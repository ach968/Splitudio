import { User } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";

export interface CloudFile { 
  fid: string; 
  url: string; 
  size: number; 
  contentType: string; 
  uploadDate: typeof serverTimestamp;
  storagePath: string; 
}

export interface Project {
  pid: string;
  uid: string | null; 
  pName: string;
  createdAt?: typeof serverTimestamp;
  updatedAt?: typeof serverTimestamp;
  collaboratorIds?: string[];
  coverImage?: string;
  isPublic: boolean;
}

export interface Customer {
  user: User
  subscription: string,
  stripeSubscriptionId: null
}

