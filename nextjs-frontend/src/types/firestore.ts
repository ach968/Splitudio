import { serverTimestamp, Timestamp } from "firebase/firestore";

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
  createdAt?: typeof Timestamp;
  updatedAt?: typeof Timestamp;
  collaboratorIds?: string[];
  coverImage?: string;
  isPublic: boolean;
}

