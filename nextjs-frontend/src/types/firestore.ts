import { User } from "firebase/auth";
import { FieldValue, serverTimestamp, Timestamp } from "firebase/firestore";

export interface CloudFile { 
  fid: string; 
  url: string; 
  size: number; 
  contentType: string; 
  uploadDate: FieldValue | Timestamp;
  storagePath: string; 
}

export interface Project {
  pid: string;
  uid: string | null; 
  pName: string;
  createdAt?: FieldValue | Timestamp;
  updatedAt?: FieldValue | Timestamp;
  collaboratorIds?: string[];
  fileName: string; // filename of original mp3
  originalMp3?: string // PATH TO ORIGINAL MP3  
  isPublic: boolean;
  tracks?: string[] // List of trackIds that belong to this project
}

export interface Track {
  trackId: string;
  midi: string // PATH TO MIDI
  stem: string // PATH TO STEM
}

export interface Customer {
  uid: string; // firebase UID
  stripeCustomerId: string;
  subscriptionStatus: "active" | "cancelled";
  projects: string[]; // List of projectIds that belong to the user 
  apiUsage: number;
}

