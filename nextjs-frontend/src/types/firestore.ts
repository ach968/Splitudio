import { serverTimestamp } from "firebase/firestore";

export interface Project {
  pid: string;
  uid: string | undefined;
  pName: string;
  createdAt?: typeof serverTimestamp;
  updatedAt?: typeof serverTimestamp;
  collaboratorIds?: string[];
  coverImage?: string;
  isPublic: boolean;
}
