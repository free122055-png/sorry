// ============================================================================
// VIDEO TILAWAT OFFLINE STORAGE SERVICE (IndexedDB Engine)
// Provides complete offline caching, downloading, and playback for Video Tilawat
// Compatible with Android AAB/APK (Capacitor/WebView) and Web browsers
// ============================================================================

import { VideoTilawatItem } from "../components/tilawat/VideoTilawatSection";

const DB_NAME = "AlMayadin_Tilawat_Offline_DB";
const DB_VERSION = 1;
const STORE_BLOBS = "video_blobs";
const STORE_META = "video_metadata";
const LOCAL_STORAGE_DOWNLOADS_KEY = "almayadin_downloaded_video_ids";
const LOCAL_STORAGE_CACHE_LIST_KEY = "cached_video_tilawat_list";

export interface DownloadProgress {
  videoId: string;
  progress: number; // 0 - 100
  downloadedMB: string;
  totalMB: string;
  status: "idle" | "downloading" | "completed" | "error";
  error?: string;
}

// ---------------------------------------------------------------------------
// Open or Initialize IndexedDB
// ---------------------------------------------------------------------------
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB not supported in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ---------------------------------------------------------------------------
// Helper: Get list of downloaded video IDs (synchronous via localStorage)
// ---------------------------------------------------------------------------
export function getDownloadedVideoIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DOWNLOADS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function isVideoDownloaded(videoId: string): boolean {
  if (!videoId) return false;
  const ids = getDownloadedVideoIds();
  return ids.includes(videoId);
}

function updateDownloadedVideoIds(videoId: string, action: "add" | "remove") {
  try {
    const ids = new Set(getDownloadedVideoIds());
    if (action === "add") {
      ids.add(videoId);
    } else {
      ids.delete(videoId);
    }
    localStorage.setItem(LOCAL_STORAGE_DOWNLOADS_KEY, JSON.stringify(Array.from(ids)));
  } catch (e) {
    console.error("Failed to update downloaded video IDs in localStorage", e);
  }
}

// ---------------------------------------------------------------------------
// Helper: Cache the entire video list in localStorage for offline browsing
// ---------------------------------------------------------------------------
export function cacheTilawatVideosList(videos: VideoTilawatItem[]) {
  try {
    if (videos && videos.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_CACHE_LIST_KEY, JSON.stringify(videos));
    }
  } catch (e) {
    console.warn("Failed to cache videos list for offline:", e);
  }
}

export function getCachedTilawatVideosList(): VideoTilawatItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_LIST_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Save Video for Offline Playback
// ---------------------------------------------------------------------------
export async function downloadAndSaveVideo(
  item: VideoTilawatItem,
  resolvedUrl: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<boolean> {
  if (!item || !resolvedUrl) {
    throw new Error("Missing video item or URL");
  }

  const videoId = item.id;

  try {
    onProgress?.({
      videoId,
      progress: 5,
      downloadedMB: "0.0",
      totalMB: "Calculating...",
      status: "downloading",
    });

    // 1. Fetch video with Range & stream reading to track download progress
    const response = await fetch(resolvedUrl, {
      method: "GET",
      headers: {
        Accept: "video/mp4,video/*;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok && response.status !== 206) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    const contentLength = response.headers.get("content-length");
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
    const totalMB = totalBytes > 0 ? (totalBytes / (1024 * 1024)).toFixed(1) + " MB" : "Unknown";

    let blob: Blob;

    if (response.body && totalBytes > 0) {
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedBytes += value.length;
          const pct = Math.min(99, Math.round((receivedBytes / totalBytes) * 100));
          const currentMB = (receivedBytes / (1024 * 1024)).toFixed(1) + " MB";
          onProgress?.({
            videoId,
            progress: pct,
            downloadedMB: currentMB,
            totalMB,
            status: "downloading",
          });
        }
      }

      blob = new Blob(chunks, { type: response.headers.get("content-type") || "video/mp4" });
    } else {
      // Fallback: direct blob
      blob = await response.blob();
    }

    if (!blob || blob.size === 0) {
      throw new Error("Downloaded empty video content");
    }

    // 2. Fetch thumbnail for offline display if available
    let offlineThumbBlob: Blob | null = null;
    if (item.thumbnailUrl && item.thumbnailUrl.startsWith("http")) {
      try {
        const thumbRes = await fetch(item.thumbnailUrl);
        if (thumbRes.ok) {
          offlineThumbBlob = await thumbRes.blob();
        }
      } catch (err) {
        console.warn("Thumbnail offline cache skipped:", err);
      }
    }

    // 3. Save to IndexedDB
    const db = await openDatabase();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_BLOBS, STORE_META], "readwrite");
      
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);

      const blobStore = tx.objectStore(STORE_BLOBS);
      const metaStore = tx.objectStore(STORE_META);

      blobStore.put({
        id: videoId,
        blob: blob,
        mimeType: blob.type || "video/mp4",
        size: blob.size,
        savedAt: Date.now(),
      });

      metaStore.put({
        ...item,
        isOfflineAvailable: true,
        offlineSavedAt: Date.now(),
        offlineSizeBytes: blob.size,
        offlineSizeFormatted: (blob.size / (1024 * 1024)).toFixed(1) + " MB",
      });
    });

    // 4. Update sync state
    updateDownloadedVideoIds(videoId, "add");

    onProgress?.({
      videoId,
      progress: 100,
      downloadedMB: (blob.size / (1024 * 1024)).toFixed(1) + " MB",
      totalMB: (blob.size / (1024 * 1024)).toFixed(1) + " MB",
      status: "completed",
    });

    return true;
  } catch (error: any) {
    console.error("Video offline download error:", error);
    onProgress?.({
      videoId,
      progress: 0,
      downloadedMB: "0 MB",
      totalMB: "0 MB",
      status: "error",
      error: error?.message || "ডাউনলোড ব্যর্থ হয়েছে",
    });
    return false;
  }
}

// ---------------------------------------------------------------------------
// Get Offline Video Blob URL for Playback
// ---------------------------------------------------------------------------
export async function getOfflineVideoBlobUrl(videoId: string): Promise<string | null> {
  if (!videoId) return null;

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_BLOBS, "readonly");
      const store = tx.objectStore(STORE_BLOBS);
      const req = store.get(videoId);

      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          const blobUrl = URL.createObjectURL(req.result.blob);
          resolve(blobUrl);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  } catch (e) {
    console.error("Failed to retrieve offline video blob:", e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Delete Offline Video
// ---------------------------------------------------------------------------
export async function deleteOfflineVideo(videoId: string): Promise<boolean> {
  if (!videoId) return false;

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_BLOBS, STORE_META], "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);

      tx.objectStore(STORE_BLOBS).delete(videoId);
      tx.objectStore(STORE_META).delete(videoId);
    });

    updateDownloadedVideoIds(videoId, "remove");
    return true;
  } catch (e) {
    console.error("Failed to delete offline video:", e);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Get All Downloaded Videos (Metadata) for Offline Listing
// ---------------------------------------------------------------------------
export async function getAllOfflineVideos(): Promise<VideoTilawatItem[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_META, "readonly");
      const store = tx.objectStore(STORE_META);
      const req = store.getAll();

      req.onsuccess = () => {
        const list = req.result || [];
        resolve(list);
      };

      req.onerror = () => resolve([]);
    });
  } catch (e) {
    console.error("Failed to get offline videos list:", e);
    return [];
  }
}
