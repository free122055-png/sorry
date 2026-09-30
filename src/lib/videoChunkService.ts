import { db } from "./firebase";
import { 
  collection, doc, setDoc, getDocs, deleteDoc, query, orderBy 
} from "firebase/firestore";

const CHUNK_SIZE = 600 * 1024; // 600 KB per chunk (safely below Firestore's 1MB limit)

export interface UploadVideoProgressCallback {
  (progressPercent: number, statusText: string): void;
}

/**
 * Uploads a video File or Data URL to Firestore by splitting it into 600KB chunks.
 * This makes ANY gallery video file (up to 15MB) available to 100% of users on Play Store!
 */
export const uploadChunkedVideoToFirestore = async (
  videoId: string,
  fileOrDataUrl: File | string,
  onProgress?: UploadVideoProgressCallback
): Promise<number> => {
  let base64Data = "";

  if (typeof fileOrDataUrl === "string") {
    base64Data = fileOrDataUrl;
  } else {
    onProgress?.(10, "ভিডিও প্রসেস করা হচ্ছে...");
    base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(fileOrDataUrl);
    });
  }

  onProgress?.(30, "ভিডিও ফাইল চ্যাংক তৈরি করা হচ্ছে...");

  // Delete previous chunks for this video ID if any
  try {
    const chunksRef = collection(db, "signboard_videos", videoId, "chunks");
    const oldSnap = await getDocs(chunksRef);
    for (const oldDoc of oldSnap.docs) {
      await deleteDoc(doc(db, "signboard_videos", videoId, "chunks", oldDoc.id));
    }
  } catch (e) {
    console.warn("Notice cleaning old video chunks:", e);
  }

  const totalLength = base64Data.length;
  const totalChunks = Math.ceil(totalLength / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalLength);
    const chunkData = base64Data.slice(start, end);

    const chunkDocRef = doc(db, "signboard_videos", videoId, "chunks", `chunk_${i}`);
    await setDoc(chunkDocRef, {
      index: i,
      data: chunkData,
      createdAt: Date.now()
    });

    // Pacing delay to avoid overloading Firestore write streams
    await new Promise((r) => setTimeout(r, 80));

    const percent = Math.min(95, Math.round(30 + ((i + 1) / totalChunks) * 65));
    onProgress?.(percent, `সার্ভারে চ্যাংক সেভ হচ্ছে (${i + 1}/${totalChunks})...`);
  }

  onProgress?.(100, "ভিডিও সফলভাবে ক্লাউডে আপলোড হয়েছে!");
  return totalChunks;
};

/**
 * Downloads all chunks for a video ID from Firestore, reassembles the Data URL,
 * and creates a playable local Blob URL.
 */
export const downloadAndReassembleVideo = async (videoId: string): Promise<string | null> => {
  try {
    const chunksRef = collection(db, "signboard_videos", videoId, "chunks");
    const q = query(chunksRef, orderBy("index", "asc"));
    const snap = await getDocs(q);

    if (snap.empty) return null;

    let fullBase64 = "";
    snap.docs.forEach((docSnap) => {
      const d = docSnap.data();
      if (d.data) {
        fullBase64 += d.data;
      }
    });

    if (!fullBase64) return null;

    // Convert Data URL string to Blob URL for maximum performance on Android WebView
    if (fullBase64.startsWith("data:")) {
      const parts = fullBase64.split(",");
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : "video/mp4";
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      return URL.createObjectURL(blob);
    }

    return fullBase64;
  } catch (err) {
    console.error("Error reassembling video chunks:", err);
    return null;
  }
};
