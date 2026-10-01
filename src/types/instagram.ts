export interface InstagramAuthor {
  id: string;
  username: string;
  displayName: string;
  photoURL?: string;
  hasStory?: boolean;
}

export interface InstagramPost {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorPhotoURL?: string;
  caption: string;
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'carousel';
  musicTitle?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  bookmarksCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt: number;
  location?: string;
}

export interface InstagramStory {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorPhotoURL?: string;
  mediaUrl: string;
  caption?: string;
  createdAt: number;
  expiresAt: number;
  likesCount?: number;
  isLiked?: boolean;
}

export interface InstagramReel {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorPhotoURL?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption: string;
  musicTitle?: string;
  likesCount: number;
  commentsCount: number;
  remixesCount: number;
  sharesCount: number;
  bookmarksCount: number;
  viewsCount: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isFollowing?: boolean;
  createdAt: number;
}

export interface InstagramNote {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  userPhotoURL?: string;
  text: string;
  locationStatus?: string;
  createdAt: number;
}

export interface InstagramComment {
  id: string;
  targetId: string; // postId or reelId
  authorId: string;
  authorUsername: string;
  authorPhotoURL?: string;
  text: string;
  createdAt: number;
  likesCount: number;
  isLiked?: boolean;
}

export interface InstagramHighlight {
  id: string;
  title: string;
  coverUrl: string;
  storiesCount: number;
}
