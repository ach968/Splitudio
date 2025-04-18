import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { app, auth } from "@/lib/firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getFirestore,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  writeBatch,
  QuerySnapshot,
} from "firebase/firestore";

import { Project, CloudFile } from "@/types/firestore";
import { User } from "firebase/auth";
import { deleteObject, getStorage, listAll, ref, StorageReference } from "firebase/storage";
import { adminDb } from "./firebase/admin";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const db = getFirestore(app);

// Also used to update projects
export async function storeProject(project: Project) {
  const projectDocRef = doc(db, "projects", project.pid);
  const projectDoc = await getDoc(projectDocRef);

  if (!projectDoc.exists()) {
    await setDoc(projectDocRef, {
      pid: project.pid,
      fileName: project.fileName,
      pName: project.pName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      uid: project.uid,
      collaboratorIds: project.collaboratorIds,
      isPublic: project.isPublic,
    });
  } else {
    await setDoc(
      projectDocRef,
      {
        ...project,
        updatedAt: serverTimestamp(),
      },
      {
        merge: true,
      }
    );
  }
}

export async function getProject(pid: string): Promise<Project | undefined> {
  const projectDocRef = doc(db, "projects", pid);
  const projectDoc = await getDoc(projectDocRef);

  if(!projectDoc.exists) return undefined;

  return {
    pid: pid,
    ...projectDoc.data()
  } as Project;
}

export async function deleteProject(project: Project) {
  const projectDocRef = doc(db, "projects", project.pid);
  const projectDoc = await getDoc(projectDocRef);

  if(!projectDoc.exists) return;

  // 1. Delete every Storage object under projects/{pid}/
  const storage = getStorage(app);
  const folderRef = ref(storage, `projects/${project.pid}`);
  await removeFolderRecursively(folderRef);

  // 2. Remove docs in the "files" sub‑collection (optional but tidy)
  const batch = writeBatch(db);
  const filesSnap = await getDocs(collection(projectDocRef, 'files'));
  filesSnap.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  
  deleteDoc(projectDocRef)
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











async function removeFolderRecursively(folderRef: StorageReference) {
  const page = await listAll(folderRef);

  // delete all files in this "directory"
  await Promise.all(page.items.map((item) => deleteObject(item)));

  // recurse into sub‑dirs
  await Promise.all(
    page.prefixes.map((subFolder) => removeFolderRecursively(subFolder))
  );
}