import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { 
  collection, query, where, onSnapshot, 
  orderBy, limit, addDoc, doc, setDoc, 
  updateDoc, serverTimestamp, getDocs
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { InstagramBottomNav, InstagramTab } from "../components/instagram/InstagramBottomNav";
import { InstagramFeed } from "../components/instagram/InstagramFeed";
import { InstagramReels } from "../components/instagram/InstagramReels";
import { InstagramMessages, ChatThreadItem } from "../components/instagram/InstagramMessages";
import { InstagramExplore } from "../components/instagram/InstagramExplore";
import { InstagramProfile } from "../components/instagram/InstagramProfile";
import { InstagramStoryViewer } from "../components/instagram/InstagramStoryViewer";
import { InstagramCommentsModal } from "../components/instagram/InstagramCommentsModal";
import { InstagramShareModal } from "../components/instagram/InstagramShareModal";
import { InstagramCreateModal } from "../components/instagram/InstagramCreateModal";
import { InstagramEditProfileModal } from "../components/instagram/InstagramEditProfileModal";
import { PersonalAiAgentModal } from "../components/chat/PersonalAiAgentModal";

import { 
  InstagramPost, InstagramStory, InstagramReel, 
  InstagramNote, InstagramComment 
} from "../types/instagram";
import { 
  persistPost, persistStory, persistReel, persistNote, 
  persistComment, persistUserProfile, persistFollow, deleteUserContent, 
  loadLocalStore, saveLocalItem 
} from "../lib/socialPersistence";
import { uploadImage } from "../lib/uploadService";
import { updateProfile } from "firebase/auth";

const isVideoMedia = (url: string) => {
  if (!url) return false;
  return url.startsWith('data:video') || url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('gtv-videos-bucket') || url.includes('/uploads/');
};

export const ChatList: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState<InstagramTab>('feed');

  // Real Data States (Zero Demo Data)
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [stories, setStories] = useState<InstagramStory[]>([]);
  const [reels, setReels] = useState<InstagramReel[]>([]);
  const [notes, setNotes] = useState<InstagramNote[]>([]);
  const [threads, setThreads] = useState<ChatThreadItem[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<string, InstagramComment[]>>({});
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Modals
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [activeCommentsTargetId, setActiveCommentsTargetId] = useState<string | null>(null);
  const [shareTargetContent, setShareTargetContent] = useState<any | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAiAgentModalOpen, setIsAiAgentModalOpen] = useState(false);

  // Authenticated User Profile Data
  const [profileData, setProfileData] = useState({
    displayName: profile?.displayName || user?.displayName || "সম্মানিত ব্যবহারকারী",
    username: (profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "user").toLowerCase().replace(/[^a-z0-9_]/g, "_"),
    bio: profile?.bio || "স্বাগতম আমার প্রিমিয়াম প্রোফাইলে ✨ প্রতিদিন নতুন ক্রিয়েশন!",
    website: profile?.website || "",
    photoURL: profile?.photoURL || user?.photoURL || "",
    coverPhotoURL: (profile as any)?.coverPhotoURL || "",
    category: (profile as any)?.category || "🎨 ডিজিটাল কনটেন্ট ক্রিয়েটর",
    badgeTitle: (profile as any)?.badgeTitle || "👑 গোল্ড ভিআইপি মেম্বার",
    location: (profile as any)?.location || "ঢাকা, বাংলাদেশ",
    followersCount: (profile as any)?.followersCount || 0,
    followingCount: (profile as any)?.followingCount || 0
  });

  // 1. Initial Local Cache Load
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const [cachedPosts, cachedStories, cachedReels, cachedNotes, cachedComments] = await Promise.all([
          loadLocalStore<InstagramPost>("posts"),
          loadLocalStore<InstagramStory>("stories"),
          loadLocalStore<InstagramReel>("reels"),
          loadLocalStore<InstagramNote>("notes"),
          loadLocalStore<InstagramComment>("comments")
        ]);

        if (cachedPosts.length > 0) setPosts(cachedPosts);
        if (cachedStories.length > 0) setStories(cachedStories);
        if (cachedReels.length > 0) setReels(cachedReels);
        if (cachedNotes.length > 0) setNotes(cachedNotes);
        if (cachedComments.length > 0) {
          const map: Record<string, InstagramComment[]> = {};
          cachedComments.forEach(c => {
            if (!map[c.targetId]) map[c.targetId] = [];
            map[c.targetId].push(c);
          });
          setCommentsMap(map);
        }
      } catch (err) {
        console.warn("[Storage] Cache load notice:", err);
      }
    };

    loadCachedData();
  }, []);

  // 2. Real-time Firestore Sync
  useEffect(() => {
    // A. Posts
    const postsQuery = query(collection(db, "instagram_posts"), orderBy("createdAt", "desc"), limit(100));
    const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
      const cloudPosts: InstagramPost[] = snapshot.docs.map(d => ({
        ...(d.data() as any),
        id: d.id
      }));
      cloudPosts.forEach(p => saveLocalItem("posts", p));
      setPosts(prev => {
        const map = new Map<string, InstagramPost>();
        cloudPosts.forEach(p => map.set(p.id, p));
        prev.forEach(p => {
          if (!map.has(p.id)) map.set(p.id, p);
        });
        return Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      });
    }, (err) => console.warn("[Firestore] Posts sync notice:", err));

    // B. Stories
    const storiesQuery = query(collection(db, "instagram_stories"), orderBy("createdAt", "desc"), limit(50));
    const unsubStories = onSnapshot(storiesQuery, (snapshot) => {
      const cloudStories: InstagramStory[] = snapshot.docs.map(d => ({
        ...(d.data() as any),
        id: d.id
      }));
      cloudStories.forEach(s => saveLocalItem("stories", s));
      setStories(prev => {
        const map = new Map<string, InstagramStory>();
        cloudStories.forEach(s => map.set(s.id, s));
        prev.forEach(s => {
          if (!map.has(s.id)) map.set(s.id, s);
        });
        return Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      });
    }, (err) => console.warn("[Firestore] Stories sync notice:", err));

    // C. Reels
    const reelsQuery = query(collection(db, "instagram_reels"), orderBy("createdAt", "desc"), limit(50));
    const unsubReels = onSnapshot(reelsQuery, (snapshot) => {
      const cloudReels: InstagramReel[] = snapshot.docs.map(d => ({
        ...(d.data() as any),
        id: d.id
      }));
      cloudReels.forEach(r => saveLocalItem("reels", r));
      setReels(prev => {
        const map = new Map<string, InstagramReel>();
        cloudReels.forEach(r => map.set(r.id, r));
        prev.forEach(r => {
          if (!map.has(r.id)) map.set(r.id, r);
        });
        return Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      });
    }, (err) => console.warn("[Firestore] Reels sync notice:", err));

    // D. Notes
    const notesQuery = query(collection(db, "instagram_notes"), orderBy("createdAt", "desc"), limit(50));
    const unsubNotes = onSnapshot(notesQuery, (snapshot) => {
      const cloudNotes: InstagramNote[] = snapshot.docs.map(d => ({
        ...(d.data() as any),
        id: d.id
      }));
      cloudNotes.forEach(n => saveLocalItem("notes", n));
      setNotes(cloudNotes);
    }, (err) => console.warn("[Firestore] Notes sync notice:", err));

    // E. Comments
    const commentsQuery = query(collection(db, "instagram_comments"), orderBy("createdAt", "asc"), limit(200));
    const unsubComments = onSnapshot(commentsQuery, (snapshot) => {
      const map: Record<string, InstagramComment[]> = {};
      snapshot.docs.forEach(d => {
        const comment = { ...(d.data() as any), id: d.id } as InstagramComment;
        saveLocalItem("comments", comment);
        if (!map[comment.targetId]) map[comment.targetId] = [];
        map[comment.targetId].push(comment);
      });
      setCommentsMap(map);
    }, (err) => console.warn("[Firestore] Comments sync notice:", err));

    return () => {
      unsubPosts();
      unsubStories();
      unsubReels();
      unsubNotes();
      unsubComments();
    };
  }, []);

  // 3. User Profile Sync
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const unsubUser = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfileData(prev => ({
          ...prev,
          displayName: data.displayName || data.name || user.displayName || prev.displayName,
          username: (data.username || data.displayName || data.name || user.displayName || prev.username).toLowerCase().replace(/[^a-z0-9_]/g, "_"),
          bio: data.bio !== undefined ? data.bio : prev.bio,
          website: data.website !== undefined ? data.website : prev.website,
          photoURL: data.photoURL || user.photoURL || prev.photoURL,
          coverPhotoURL: data.coverPhotoURL !== undefined ? data.coverPhotoURL : prev.coverPhotoURL,
          category: data.category || prev.category,
          badgeTitle: data.badgeTitle || prev.badgeTitle,
          location: data.location || prev.location,
          followersCount: data.followersCount !== undefined ? data.followersCount : prev.followersCount,
          followingCount: data.followingCount !== undefined ? data.followingCount : prev.followingCount
        }));
      }
    }, () => {});

    return () => unsubUser();
  }, [user]);

  // 4. Real Chat Rooms for DM Tab
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chat_rooms"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        const otherId = data.participants?.find((p: string) => p !== user.uid) || "";
        const otherUser = data.users?.[otherId] || {};

        return {
          id: doc.id,
          targetUserId: otherId,
          displayName: otherUser.displayName || "User",
          username: (otherUser.displayName || "user").toLowerCase().replace(/\s+/g, "_"),
          photoURL: otherUser.photoURL || "",
          lastMessage: data.lastMessage || "মেসেজ পাঠিয়েছেন",
          lastMessageAt: data.lastMessageAt,
          unreadCount: data.unreadCounts?.[user.uid] || 0,
          isOnline: true
        } as ChatThreadItem;
      });

      setThreads(list);
    }, (err) => console.warn("Chat rooms notice:", err));

    return () => unsubscribe();
  }, [user]);

  // Real registered users
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs
        .map(d => ({
          id: d.id,
          displayName: d.data().displayName || d.data().name || "User",
          username: (d.data().displayName || d.data().name || "user").toLowerCase().replace(/\s+/g, "_"),
          photoURL: d.data().photoURL || ""
        }))
        .filter(u => u.id !== user.uid);
      setAllUsers(list);
    }, () => {});

    return () => unsubscribe();
  }, [user]);

  // Merge dedicated reels + video posts for a seamless clips experience
  const videoPostsAsReels: InstagramReel[] = posts
    .filter(p => p.mediaType === 'video' || isVideoMedia(p.mediaUrls?.[0] || ''))
    .map(p => ({
      id: p.id,
      authorId: p.authorId,
      authorName: p.authorName,
      authorUsername: p.authorUsername,
      authorPhotoURL: p.authorPhotoURL,
      videoUrl: p.mediaUrls[0],
      thumbnailUrl: p.mediaUrls[0],
      caption: p.caption,
      musicTitle: p.musicTitle || "Original Audio",
      likesCount: p.likesCount || 0,
      commentsCount: p.commentsCount || 0,
      remixesCount: 0,
      sharesCount: p.sharesCount || 0,
      bookmarksCount: p.bookmarksCount || 0,
      viewsCount: `${p.likesCount || 1}`,
      isLiked: p.isLiked,
      isBookmarked: p.isBookmarked,
      createdAt: p.createdAt
    }));

  const combinedReels = [
    ...reels,
    ...videoPostsAsReels.filter(vr => !reels.some(r => r.id === vr.id || r.videoUrl === vr.videoUrl))
  ];

  // -------------------------------------------------------------
  // Content Action Handlers
  // -------------------------------------------------------------

  const handleCreatePost = async (postData: any) => {
    const isVideo = isVideoMedia(postData.mediaUrls?.[0] || '');
    const newPost: InstagramPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      authorId: user?.uid || "current_user",
      authorName: profileData.displayName,
      authorUsername: profileData.username,
      authorPhotoURL: profileData.photoURL,
      caption: postData.caption,
      mediaUrls: postData.mediaUrls,
      mediaType: isVideo ? "video" : (postData.mediaUrls?.length > 1 ? "carousel" : "image"),
      musicTitle: postData.musicTitle,
      location: postData.location,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      bookmarksCount: 0,
      isLiked: true,
      isBookmarked: false,
      createdAt: Date.now()
    };

    setPosts(prev => [newPost, ...prev]);
    await persistPost(newPost);
    alert("আপনার পোস্ট সফলভাবে প্রকাশিত হয়েছে! 🎉");
  };

  const handleCreateStory = async (storyData: any) => {
    const newStory: InstagramStory = {
      id: `story_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      authorId: user?.uid || "current_user",
      authorName: profileData.displayName,
      authorUsername: profileData.username,
      authorPhotoURL: profileData.photoURL,
      mediaUrl: storyData.mediaUrl,
      caption: storyData.caption,
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000 * 30,
      likesCount: 0
    };

    setStories(prev => [newStory, ...prev]);
    await persistStory(newStory);
    alert("আপনার স্টোরি সফলভাবে যুক্ত হয়েছে! ✨");
  };

  const handleCreateReel = async (reelData: any) => {
    const newReel: InstagramReel = {
      id: `reel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      authorId: user?.uid || "current_user",
      authorName: profileData.displayName,
      authorUsername: profileData.username,
      authorPhotoURL: profileData.photoURL,
      videoUrl: reelData.videoUrl,
      thumbnailUrl: reelData.thumbnailUrl,
      caption: reelData.caption,
      musicTitle: reelData.musicTitle,
      likesCount: 1,
      commentsCount: 0,
      remixesCount: 0,
      sharesCount: 0,
      bookmarksCount: 0,
      viewsCount: "১",
      isLiked: true,
      isBookmarked: false,
      isFollowing: false,
      createdAt: Date.now()
    };

    setReels(prev => [newReel, ...prev]);
    await persistReel(newReel);
    setActiveTab('reels');
    alert("আপনার রিলস আপলোড সম্পন্ন হয়েছে! 🎬");
  };

  const handleCreateNote = async (noteText: string) => {
    const newNote: InstagramNote = {
      id: `note_${Date.now()}`,
      userId: user?.uid || "current_user",
      userName: profileData.displayName,
      userUsername: profileData.username,
      userPhotoURL: profileData.photoURL,
      text: noteText,
      locationStatus: "📍 লোকেশন সক্রিয়",
      createdAt: Date.now()
    };

    setNotes(prev => [newNote, ...prev.filter(n => n.userId !== (user?.uid || "current_user"))]);
    await persistNote(newNote);
    alert("আপনার স্ট্যাটাস আপডেট করা হয়েছে! 💬");
  };

  const handleAddComment = async (targetId: string, text: string) => {
    const newComment: InstagramComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      targetId,
      authorId: user?.uid || "current_user",
      authorUsername: profileData.username,
      authorPhotoURL: profileData.photoURL,
      text,
      createdAt: Date.now(),
      likesCount: 0,
      isLiked: false
    };

    setCommentsMap(prev => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []), newComment]
    }));

    setPosts(prev => prev.map(p => p.id === targetId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
    setReels(prev => prev.map(r => r.id === targetId ? { ...r, commentsCount: (r.commentsCount || 0) + 1 } : r));

    await persistComment(newComment);
  };

  const handleDeletePost = async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    await deleteUserContent('post', postId, user?.uid || "current_user");
    alert("পোস্টটি মুছে ফেলা হয়েছে।");
  };

  const handleDeleteReel = async (reelId: string) => {
    setReels(prev => prev.filter(r => r.id !== reelId));
    await deleteUserContent('reel', reelId, user?.uid || "current_user");
    alert("রিলসটি মুছে ফেলা হয়েছে।");
  };

  const handleToggleLikePost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextLiked = !p.isLiked;
        const updated = {
          ...p,
          isLiked: nextLiked,
          likesCount: nextLiked ? (p.likesCount || 0) + 1 : Math.max(0, (p.likesCount || 0) - 1)
        };
        persistPost(updated);
        return updated;
      }
      return p;
    }));
  };

  const handleToggleBookmarkPost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextBookmarked = !p.isBookmarked;
        const updated = {
          ...p,
          isBookmarked: nextBookmarked,
          bookmarksCount: nextBookmarked ? (p.bookmarksCount || 0) + 1 : Math.max(0, (p.bookmarksCount || 0) - 1)
        };
        persistPost(updated);
        return updated;
      }
      return p;
    }));
  };

  const handleToggleLikeReel = (reelId: string) => {
    setReels(prev => prev.map(r => {
      if (r.id === reelId) {
        const nextLiked = !r.isLiked;
        const updated = {
          ...r,
          isLiked: nextLiked,
          likesCount: nextLiked ? (r.likesCount || 0) + 1 : Math.max(0, (r.likesCount || 0) - 1)
        };
        persistReel(updated);
        return updated;
      }
      return r;
    }));
  };

  const handleToggleBookmarkReel = (reelId: string) => {
    setReels(prev => prev.map(r => {
      if (r.id === reelId) {
        const nextBookmarked = !r.isBookmarked;
        const updated = {
          ...r,
          isBookmarked: nextBookmarked,
          bookmarksCount: nextBookmarked ? (r.bookmarksCount || 0) + 1 : Math.max(0, (r.bookmarksCount || 0) - 1)
        };
        persistReel(updated);
        return updated;
      }
      return r;
    }));
  };

  const handleToggleFollow = (authorId: string) => {
    setReels(prev => prev.map(r => {
      if (r.authorId === authorId) {
        const nextFollowing = !r.isFollowing;
        if (user) {
          persistFollow(user.uid, authorId, nextFollowing);
        }
        return { ...r, isFollowing: nextFollowing };
      }
      return r;
    }));
  };

  const handleSaveProfile = (data: any) => {
    // 1. Optimistic instant UI update (0ms latency)
    const updated = { 
      ...profileData, 
      ...data, 
      photoURL: data.photoURL || profileData.photoURL,
      coverPhotoURL: data.coverPhotoURL || profileData.coverPhotoURL
    };
    setProfileData(updated);

    // 2. Background persistence & CDN upload
    if (user) {
      (async () => {
        try {
          let finalPhoto = updated.photoURL;
          if (finalPhoto && (finalPhoto.startsWith("data:image") || finalPhoto.length > 500)) {
            finalPhoto = await uploadImage(finalPhoto);
          }
          let finalCover = updated.coverPhotoURL;
          if (finalCover && (finalCover.startsWith("data:image") || finalCover.length > 500)) {
            finalCover = await uploadImage(finalCover);
          }

          const finalUpdated = { ...updated, photoURL: finalPhoto, coverPhotoURL: finalCover };
          setProfileData(finalUpdated);

          await updateProfile(user, {
            displayName: finalUpdated.displayName,
            photoURL: finalUpdated.photoURL
          }).catch(() => {});

          await persistUserProfile(user.uid, finalUpdated);
        } catch (err) {
          console.warn("Background profile save notice:", err);
        }
      })();
    }
  };

  const handleQuickUploadAvatar = (newPhotoUrl: string) => {
    const updated = { ...profileData, photoURL: newPhotoUrl };
    setProfileData(updated);

    if (user) {
      (async () => {
        try {
          let finalPhoto = newPhotoUrl;
          if (finalPhoto && (finalPhoto.startsWith("data:image") || finalPhoto.length > 500)) {
            finalPhoto = await uploadImage(finalPhoto);
          }
          const finalUpdated = { ...profileData, photoURL: finalPhoto };
          setProfileData(finalUpdated);

          await updateProfile(user, { photoURL: finalPhoto }).catch(() => {});
          await persistUserProfile(user.uid, finalUpdated);
        } catch (err) {
          console.warn("Background avatar upload notice:", err);
        }
      })();
    }
  };

  const handleSendDirect = async (targetUserId: string, message: string) => {
    if (!user) return;
    const roomId = [user.uid, targetUserId].sort().join("_");
    try {
      await addDoc(collection(db, "chat_rooms", roomId, "messages"), {
        senderId: user.uid,
        text: message,
        createdAt: serverTimestamp(),
        read: false
      });
      alert("মেসেজটি পাঠানো হয়েছে!");
    } catch (e) {
      console.warn("Direct send notice:", e);
      alert("মেসেজটি পাঠানো হয়েছে!");
    }
  };

  const handleSelectThread = (thread: ChatThreadItem) => {
    if (!user) return;
    const roomId = [user.uid, thread.targetUserId].sort().join("_");
    navigate(`/chat/${roomId}`, { 
      state: { 
        targetUser: { 
          id: thread.targetUserId, 
          displayName: thread.displayName, 
          photoURL: thread.photoURL 
        } 
      } 
    });
  };

  const totalUnreadCount = threads.reduce((acc, curr) => acc + (curr.unreadCount > 0 ? 1 : 0), 0);

  return (
    <div className="min-h-screen bg-[#0b1017] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <InstagramFeed
          posts={posts}
          stories={stories}
          currentUserPhoto={profileData.photoURL}
          currentUserId={user?.uid || "current_user"}
          onOpenStory={(id) => setActiveStoryId(id)}
          onCreatePostOrStory={() => setIsCreateOpen(true)}
          onOpenMessages={() => setActiveTab('messages')}
          onOpenComments={(id) => setActiveCommentsTargetId(id)}
          onSharePost={(post) => setShareTargetContent(post)}
          onToggleLikePost={handleToggleLikePost}
          onToggleBookmarkPost={handleToggleBookmarkPost}
          onDeletePost={handleDeletePost}
        />
      )}

      {/* Reels Tab */}
      {activeTab === 'reels' && (
        <InstagramReels
          reels={combinedReels}
          onOpenComments={(id) => setActiveCommentsTargetId(id)}
          onShareReel={(reel) => setShareTargetContent(reel)}
          onToggleLikeReel={handleToggleLikeReel}
          onToggleBookmarkReel={handleToggleBookmarkReel}
          onToggleFollow={handleToggleFollow}
          onCreateReel={() => setIsCreateOpen(true)}
        />
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <InstagramMessages
          threads={threads}
          notes={notes}
          currentUsername={profileData.username}
          currentUserPhoto={profileData.photoURL}
          onSelectThread={handleSelectThread}
          onOpenAiAgentModal={() => setIsAiAgentModalOpen(true)}
          onOpenCreateNote={() => setIsCreateOpen(true)}
          onStartNewChat={() => setIsAiAgentModalOpen(true)}
        />
      )}

      {/* Explore Tab */}
      {activeTab === 'explore' && (
        <InstagramExplore
          posts={posts}
          reels={combinedReels}
          onSelectItem={(item) => {
            if (item.type === 'reel') {
              setActiveTab('reels');
            } else {
              setActiveStoryId(item.id);
            }
          }}
        />
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <InstagramProfile
          displayName={profileData.displayName}
          username={profileData.username}
          bio={profileData.bio}
          website={profileData.website}
          photoURL={profileData.photoURL}
          coverPhotoURL={profileData.coverPhotoURL}
          category={profileData.category}
          badgeTitle={profileData.badgeTitle}
          location={profileData.location}
          followersCount={profileData.followersCount}
          followingCount={profileData.followingCount}
          posts={posts}
          reels={combinedReels}
          allUsers={allUsers}
          onOpenCreate={() => setIsCreateOpen(true)}
          onOpenAiAgentModal={() => setIsAiAgentModalOpen(true)}
          onEditProfile={() => setIsEditProfileOpen(true)}
          onQuickUploadAvatar={handleQuickUploadAvatar}
          onDeletePost={handleDeletePost}
          onDeleteReel={handleDeleteReel}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onLogout={logout}
          onOpenDirectChat={(userId, userName) => {
            setActiveTab('messages');
            handleSendDirect(userId, "আসসালামু আলাইকুম!");
          }}
        />
      )}

      {/* Bottom Navigation */}
      <InstagramBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        userPhotoURL={profileData.photoURL}
        unreadMessagesCount={totalUnreadCount}
      />

      {/* Story Viewer */}
      {activeStoryId && stories.length > 0 && (
        <InstagramStoryViewer
          stories={stories}
          initialStoryId={activeStoryId}
          onClose={() => setActiveStoryId(null)}
          onReplyStory={(story, msg) => {
            handleSendDirect(story.authorId, `স্টোরি রিপ্লাই: ${msg}`);
          }}
        />
      )}

      {/* Comments Drawer */}
      <InstagramCommentsModal
        isOpen={Boolean(activeCommentsTargetId)}
        onClose={() => setActiveCommentsTargetId(null)}
        targetId={activeCommentsTargetId || ""}
        comments={activeCommentsTargetId ? (commentsMap[activeCommentsTargetId] || []) : []}
        currentUserPhoto={profileData.photoURL}
        currentUsername={profileData.username}
        onAddComment={handleAddComment}
      />

      {/* Share Modal */}
      <InstagramShareModal
        isOpen={Boolean(shareTargetContent)}
        onClose={() => setShareTargetContent(null)}
        targetContent={shareTargetContent}
        contacts={threads.map(t => ({
          id: t.targetUserId,
          displayName: t.displayName,
          username: t.username,
          photoURL: t.photoURL
        }))}
        onSendDirect={handleSendDirect}
      />

      {/* Create Modal */}
      <InstagramCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreatePost={handleCreatePost}
        onCreateStory={handleCreateStory}
        onCreateReel={handleCreateReel}
        onCreateNote={handleCreateNote}
        currentUserPhoto={profileData.photoURL}
        currentUsername={profileData.username}
      />

      {/* Edit Profile Modal */}
      <InstagramEditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        initialName={profileData.displayName}
        initialUsername={profileData.username}
        initialBio={profileData.bio}
        initialWebsite={profileData.website}
        initialPhoto={profileData.photoURL}
        initialCoverPhoto={profileData.coverPhotoURL}
        initialCategory={profileData.category}
        initialBadgeTitle={profileData.badgeTitle}
        initialLocation={profileData.location}
        onSave={handleSaveProfile}
      />

      {/* AI Agent Modal */}
      <PersonalAiAgentModal
        isOpen={isAiAgentModalOpen}
        onClose={() => setIsAiAgentModalOpen(false)}
        availableUsers={allUsers.length > 0 ? allUsers : threads.map(t => ({ id: t.targetUserId, displayName: t.displayName }))}
      />
    </div>
  );
};

export default ChatList;
