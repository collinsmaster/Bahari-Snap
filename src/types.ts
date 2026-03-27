export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  isVerified: boolean;
  photoURL?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    photoURL?: string;
  };
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  likesCount: number;
  commentsCount: number;
  circleId?: string;
  createdAt: string;
  reactions?: Reaction[];
}

export interface Circle {
  id: string;
  name: string;
  description?: string;
  membersCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: {
    username: string;
    photoURL?: string;
  };
  text: string;
  createdAt: string;
}

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  type: string;
  createdAt: string;
}
