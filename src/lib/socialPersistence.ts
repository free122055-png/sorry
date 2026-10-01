import { db } from "./firebase";
import { 
  collection, doc, setDoc, deleteDoc, 
  onSnapshot, query, orderBy, limit, getDocs, updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { 
  InstagramPost, InstagramStory, InstagramReel, 
  InstagramNote, InstagramComment, InstagramHighlight 
} from "../types/instagram";
import { uploadVideo, uploadImage } from "./uploadService";

const SOCIAL_DB_NAME = "almayadin_permanent_social_db";
const DB_VERSION = 2;

/**
 * Initialize IndexedDB for zero-loss offline cache & retry queue
 */
export const initSocialDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not supported"));
    }
    const request = indexedDB.open(SOCIAL_DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const dbInstance = (e.target as IDBOpenDBRequest).result;
      const stores = [
        "posts", "stories", "reels", "notes", 
        "comments", "profiles", "highlights", 
        "sync_queue"
      ];
      stores.forEach(storeName => {
        if (!dbInstance.objectStoreNames.contains(storeName)) {
          dbInstance.createObjectStore(storeName, { keyPath: "id" });
        }
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Generic helper to save items to IndexedDB
 */
export const saveLocalItem = async (storeName: string, item: any): Promise<void> => {
  try {
    const idb = await initSocialDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[LocalDB] Save notice for ${storeName}:`, err);
    try {
      const existing = JSON.parse(localStorage.getItem(`almayadin_${storeName}`) || "[]");
      const filtered = existing.filter((x: any) => x.id !== item.id);
      localStorage.setItem(`almayadin_${storeName}`, JSON.stringify([item, ...filtered]));
    } catch {
      // quota fallback
    }
  }
};

/**
 * Generic helper to load all items from an IndexedDB store
 */
export const loadLocalStore = async <T>(storeName: string): Promise<T[]> => {
  try {
    const idb = await initSocialDB();
    return new Promise((resolve) => {
      const tx = idb.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    try {
      const fallback = JSON.parse(localStorage.getItem(`almayadin_${storeName}`) || "[]");
      return fallback;
    } catch {
      return [];
    }
  }
};

/**
 * Generic helper to delete an item from IndexedDB (only on explicit user action)
 */
export const deleteLocalItem = async (storeName: string, id: string): Promise<void> => {
  try {
    const idb = await initSocialDB();
    return new Promise((resolve) => {
      const tx = idb.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (err) {
    try {
      const existing = JSON.parse(localStorage.getItem(`almayadin_${storeName}`) || "[]");
      const filtered = existing.filter((x: any) => x.id !== id);
      localStorage.setItem(`almayadin_${storeName}`, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  }
};

// ==========================================
// Offline Queue & Automated Retry Worker
// ==========================================
export const queueSyncItem = async (type: string, data: any) => {
  const queueItem = {
    id: `queue_${type}_${data.id}_${Date.now()}`,
    type,
    data,
    timestamp: Date.now()
  };
  await saveLocalItem("sync_queue", queueItem);
};

export const processSyncQueue = async () => {
  if (!navigator.onLine) return;
  try {
    const queue = await loadLocalStore<any>("sync_queue");
    if (queue.length === 0) return;

    for (const item of queue) {
      try {
        if (item.type === "post") {
          await persistPost(item.data, false);
        } else if (item.type === "story") {
          await persistStory(item.data, false);
        } else if (item.type === "reel") {
          await persistReel(item.data, false);
        } else if (item.type === "note") {
          await persistNote(item.data, false);
        } else if (item.type === "comment") {
          await persistComment(item.data, false);
        }
        await deleteLocalItem("sync_queue", item.id);
      } catch (retryErr) {
        console.warn(`[SyncQueue] Retry failed for ${item.id}:`, retryErr);
      }
    }
  } catch (err) {
    console.warn("[SyncQueue] Worker notice:", err);
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[SyncQueue] Online detected. Processing pending cloud uploads...");
    processSyncQueue();
  });
  setInterval(processSyncQueue, 30000);
}

// ==========================================
// 1. Post Persistence (Cloud Firestore Primary + Instant Feed)
// ==========================================
export const persistPost = async (post: InstagramPost, allowQueue = true): Promise<void> => {
  // 1. Save full object in local IndexedDB first for instant rendering
  await saveLocalItem("posts", post);

  // 2. Clean media URLs to permanent server URLs
  let cleanMediaUrls = [...(post.mediaUrls || [])];
  for (let i = 0; i < cleanMediaUrls.length; i++) {
    const url = cleanMediaUrls[i];
    if (url && url.startsWith("data:")) {
      if (url.startsWith("data:video")) {
        const uploaded = await uploadVideo(url);
        cleanMediaUrls[i] = uploaded || url;
      } else if (url.startsWith("data:image")) {
        const uploaded = await uploadImage(url);
        cleanMediaUrls[i] = uploaded || url;
      }
    }
  }

  const cleanPost: InstagramPost = {
    ...post,
    mediaUrls: cleanMediaUrls,
    createdAt: post.createdAt || Date.now()
  };

  await saveLocalItem("posts", cleanPost);

  // 3. Write directly to Cloud Firestore `instagram_posts` collection
  try {
    const postRef = doc(db, "instagram_posts", cleanPost.id);
    await setDoc(postRef, {
      ...cleanPost,
      updatedAt: Date.now()
    }, { merge: true });
    console.log(`[Persistence] Post ${cleanPost.id} published to Cloud Firestore & broadcast to all feeds.`);
  } catch (err) {
    console.warn("[Persistence] Firestore write error, queued for automatic retry:", err);
    if (allowQueue) {
      await queueSyncItem("post", cleanPost);
    }
  }
};

// ==========================================
// 2. Story Persistence (Cloud Firestore Primary)
// ==========================================
export const persistStory = async (story: InstagramStory, allowQueue = true): Promise<void> => {
  await saveLocalItem("stories", story);

  let cleanMediaUrl = story.mediaUrl;
  if (cleanMediaUrl && cleanMediaUrl.startsWith("data:")) {
    if (cleanMediaUrl.startsWith("data:video")) {
      const uploaded = await uploadVideo(cleanMediaUrl);
      cleanMediaUrl = uploaded || cleanMediaUrl;
    } else {
      const uploaded = await uploadImage(cleanMediaUrl);
      cleanMediaUrl = uploaded || cleanMediaUrl;
    }
  }

  const cleanStory = { 
    ...story, 
    mediaUrl: cleanMediaUrl,
    createdAt: story.createdAt || Date.now()
  };
  await saveLocalItem("stories", cleanStory);

  try {
    const storyRef = doc(db, "instagram_stories", cleanStory.id);
    await setDoc(storyRef, {
      ...cleanStory,
      updatedAt: Date.now()
    }, { merge: true });
    console.log(`[Persistence] Story ${cleanStory.id} published to Cloud Firestore.`);
  } catch (err) {
    console.warn("[Persistence] Firestore story sync error, queued:", err);
    if (allowQueue) {
      await queueSyncItem("story", cleanStory);
    }
  }
};

// ==========================================
// 3. Reel Persistence (Cloud Firestore Primary)
// ==========================================
export const persistReel = async (reel: InstagramReel, allowQueue = true): Promise<void> => {
  await saveLocalItem("reels", reel);

  let cleanVideoUrl = reel.videoUrl;
  let cleanThumbUrl = reel.thumbnailUrl || reel.videoUrl;

  if (cleanVideoUrl && cleanVideoUrl.startsWith("data:")) {
    const uploaded = await uploadVideo(cleanVideoUrl);
    cleanVideoUrl = uploaded || cleanVideoUrl;
    cleanThumbUrl = uploaded || cleanThumbUrl;
  }

  const cleanReel = {
    ...reel,
    videoUrl: cleanVideoUrl,
    thumbnailUrl: cleanThumbUrl,
    createdAt: reel.createdAt || Date.now()
  };

  await saveLocalItem("reels", cleanReel);

  try {
    const reelRef = doc(db, "instagram_reels", cleanReel.id);
    await setDoc(reelRef, {
      ...cleanReel,
      updatedAt: Date.now()
    }, { merge: true });
    console.log(`[Persistence] Reel ${cleanReel.id} published to Cloud Firestore.`);
  } catch (err) {
    console.warn("[Persistence] Firestore reel sync error, queued:", err);
    if (allowQueue) {
      await queueSyncItem("reel", cleanReel);
    }
  }
};

// ==========================================
// 4. Note Persistence
// ==========================================
export const persistNote = async (note: InstagramNote, allowQueue = true): Promise<void> => {
  await saveLocalItem("notes", note);
  try {
    const noteRef = doc(db, "instagram_notes", note.id);
    await setDoc(noteRef, {
      ...note,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err) {
    console.warn("[Persistence] Firestore note sync error, queued:", err);
    if (allowQueue) {
      await queueSyncItem("note", note);
    }
  }
};

// ==========================================
// 5. Comment Persistence (Real-Time Propagation)
// ==========================================
export const persistComment = async (comment: InstagramComment, allowQueue = true): Promise<void> => {
  await saveLocalItem("comments", comment);
  try {
    const commentRef = doc(db, "instagram_comments", comment.id);
    await setDoc(commentRef, {
      ...comment,
      updatedAt: Date.now()
    }, { merge: true });

    // Update post or reel commentsCount
    const postRef = doc(db, "instagram_posts", comment.targetId);
    try {
      const snap = await getDocs(query(collection(db, "instagram_comments")));
      const count = snap.docs.filter(d => d.data().targetId === comment.targetId).length;
      await updateDoc(postRef, { commentsCount: count });
    } catch {
      // ignore
    }
  } catch (err) {
    console.warn("[Persistence] Firestore comment sync error, queued:", err);
    if (allowQueue) {
      await queueSyncItem("comment", comment);
    }
  }
};

// ==========================================
// 6. User Profile Persistence (Zero Loss)
// ==========================================
export const persistUserProfile = async (userId: string, profileData: any): Promise<void> => {
  const profileItem = { id: userId, ...profileData, updatedAt: Date.now() };
  await saveLocalItem("profiles", profileItem);
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, profileData, { merge: true });
    console.log(`[Persistence] User profile for ${userId} saved to Cloud Firestore.`);
  } catch (err) {
    console.warn("[Persistence] Firestore user profile sync notice:", err);
  }
};

// ==========================================
// 7. Follows Persistence
// ==========================================
export const persistFollow = async (userId: string, targetUserId: string, isFollowing: boolean): Promise<void> => {
  const followId = `${userId}_${targetUserId}`;
  try {
    const followRef = doc(db, "instagram_follows", followId);
    if (isFollowing) {
      await setDoc(followRef, {
        userId,
        targetUserId,
        createdAt: Date.now()
      }, { merge: true });
    } else {
      await deleteDoc(followRef);
    }
  } catch (err) {
    console.warn("[Persistence] Firestore follow sync notice:", err);
  }
};

// ==========================================
// 8. Explicit User Deletion (Protected)
// ==========================================
export const deleteUserContent = async (
  type: 'post' | 'story' | 'reel' | 'note' | 'comment',
  id: string,
  authorId: string
): Promise<boolean> => {
  try {
    const collectionMap: Record<string, string> = {
      post: 'instagram_posts',
      story: 'instagram_stories',
      reel: 'instagram_reels',
      note: 'instagram_notes',
      comment: 'instagram_comments'
    };
    const storeMap: Record<string, string> = {
      post: 'posts',
      story: 'stories',
      reel: 'reels',
      note: 'notes',
      comment: 'comments'
    };

    await deleteLocalItem(storeMap[type], id);

    const colName = collectionMap[type];
    if (colName) {
      const docRef = doc(db, colName, id);
      await deleteDoc(docRef);
    }
    console.log(`[Persistence] Explicit user deletion completed for ${type} ${id}`);
    return true;
  } catch (err) {
    console.error("[Persistence] Error during explicit content delete:", err);
    return false;
  }
};
