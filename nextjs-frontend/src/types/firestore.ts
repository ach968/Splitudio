import { Timestamp } from "firebase/firestore";

export interface Project {
  pid: string;
  pName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  ownerId: string;
  collaboratorIds?: string[];
  coverImage?: string;
  isPublic: boolean;
}