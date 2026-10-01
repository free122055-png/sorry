import { InstagramPost, InstagramStory, InstagramReel, InstagramNote, InstagramHighlight } from "../types/instagram";

export const SEED_STORIES: InstagramStory[] = [];

export const SEED_POSTS: InstagramPost[] = [];

export const SEED_REELS: InstagramReel[] = [];

export const SEED_NOTES: InstagramNote[] = [];

export const SEED_EXPLORE_ITEMS: Array<{
  id: string;
  title: string;
  category: string;
  mediaUrl: string;
  type: 'image' | 'reel';
  views: string;
  likes: string;
}> = [];

export const SEED_HIGHLIGHTS: InstagramHighlight[] = [];
