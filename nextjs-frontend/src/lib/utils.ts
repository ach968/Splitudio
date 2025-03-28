import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { app } from "@/lib/firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";

import { Project } from "@/types/firestore";
import { User } from "firebase/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const db = getFirestore(app);

export async function storeProject(project: Project) {
  const projectDocRef = doc(db, "projects", project.pid);
  const projectDoc = await getDoc(projectDocRef);
  if (!projectDoc.exists()) {
    await setDoc(projectDocRef, {
      pid: project.pid,
      name: project.pName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      uid: project.uid,
      collaboratorIds: project.collaboratorIds,
      coverImage: project.coverImage,
      isPublic: project.isPublic,
    });
  } else {
    await setDoc(
      projectDocRef,
      {
        updatedAt: serverTimestamp(),
      },
      {
        merge: true,
      }
    );
  }
}

export async function fetchProjects(user: User) {}
