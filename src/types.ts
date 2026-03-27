import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  createdAt: Timestamp;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  likesCount: number;
  commentsCount: number;
  circleId?: string;
  createdAt: Timestamp;
}

export interface Circle {
  id: string;
  name: string;
  description?: string;
  membersCount: number;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  createdAt: Timestamp;
}

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  type: '🔥' | '😂' | '💡' | '❤️';
  createdAt: Timestamp;
}
