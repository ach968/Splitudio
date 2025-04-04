import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { app } from "@/lib/firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  getFirestore,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";

import { Project, CloudFile } from "@/types/firestore";
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

export async function fetchProjects(user: User): Promise<Project[]> {
  const projectsRef = collection(db, "projects");
  const q = query(projectsRef, where("uid", "==", user.uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    return {
      ...doc.data(),
      pid: doc.id,
    } as Project;
  }) as Project[];
}

export async function storeCloudFile(
  pid: string,
  cloudFile: Omit<CloudFile, "fid" | "uploadDate" | "storagePath">
) {
  
  const projectDocRef = doc(db, "projects", pid);
  const filesCollectionRef = collection(projectDocRef, "files");

  const docRef = await addDoc(filesCollectionRef, {
    ...cloudFile,
    uploadDate: serverTimestamp(),
  });

  return docRef.id;
}

export async function fetchCloudFiles(pid: string): Promise<CloudFile[]> {
  const projectDocRef = doc(db, "projects", pid);
  const filesCollectionRef = collection(projectDocRef, "files");
  const querySnapshot = await getDocs(filesCollectionRef);

  return querySnapshot.docs.map((doc) => {
    return {
      fid: doc.id,
      ...doc.data(),
    } as CloudFile;
  }) as CloudFile[];
}
