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
  fileName: string; // filename of original mp3 (displayed in frontend)
  originalMp3?: string // PATH TO ORIGINAL MP3
  isPublic: boolean;
  trackIds?: string[] // List of trackIds
}

export interface Track {
  trackId: string;
  stemPath?: string // PATH TO SPLIT MP3 STEM
  midiPath?: string // PATH TO MIDI
  sheetMusicPath?: string // PATH TO SHEET MUSIC
}

export interface Customer {
  uid: string; // firebase UID
  stripeCustomerId: string;
  subscriptionStatus: "active" | "none";
  apiUsage: number;
}

