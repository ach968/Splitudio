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
  addDoc,
  updateDoc,
} from "firebase/firestore";

import { Project, CloudFile, Customer } from "@/types/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const db = getFirestore(app);

// Also used to update projects
export async function storeProject(project: Project) {
  const res = await fetch("/api/set_project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({project: project}),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(`set_project failed: ${error ?? res.statusText}`);
  }

  return res;
}

// export async function storeProject(project: Project) {

//   console.log("STORING: ", project)
//   console.log("Current user UID:", getAuth().currentUser?.uid);
//   const projectDocRef = doc(db, "projects", project.pid);
//   const projectDoc = await getDoc(projectDocRef);

//   if (!projectDoc.exists()) {
//     await setDoc(projectDocRef, {
//       pid: project.pid,
//       fileName: project.fileName,
//       pName: project.pName,
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//       uid: project.uid,
//       isPublic: project.isPublic,
//     });
//   } else {
//     await setDoc(
//       projectDocRef,
//       {
//         ...project,
//         updatedAt: serverTimestamp(),
//       },
//       {
//         merge: true,
//       }
//     );
//   }
// }

// export async function getProject(pid: string): Promise<Project | undefined> {
//   const projectDocRef = doc(db, "projects", pid);
//   const projectDoc = await getDoc(projectDocRef);

//   if(!projectDoc.exists) return undefined;

//   return {
//     pid: pid,
//     ...projectDoc.data()
//   } as Project;
// }

// export async function deleteProject(project: Project) {
//   const projectDocRef = doc(db, "projects", project.pid);
//   const projectDoc = await getDoc(projectDocRef);

//   if(!projectDoc.exists) return;

//   // 1. Delete every Storage object under projects/{pid}/
//   const storage = getStorage(app);
//   const folderRef = ref(storage, `projects/${project.pid}`);
//   await removeFolderRecursively(folderRef);

//   // 2. Remove docs in the "files" sub‑collection (optional but tidy)
//   const batch = writeBatch(db);
//   const filesSnap = await getDocs(collection(projectDocRef, 'files'));
//   filesSnap.forEach((d) => batch.delete(d.ref));
//   await batch.commit();
  
//   deleteDoc(projectDocRef)
// }

// export async function fetchProjects(user: User): Promise<Project[]> {
//   const projectsRef = collection(db, "projects");
//   const q = query(projectsRef, where("uid", "==", user.uid));
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map((doc) => {
//     return {
//       ...doc.data(),
//       pid: doc.id,
//     } as Project;
//   }) as Project[];
// }

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

// REMOVE THIS IN PROD WTFFFFF
// export async function fetchCloudFiles(pid: string): Promise<CloudFile[]> {
//   const projectDocRef = doc(db, "projects", pid);
//   const filesCollectionRef = collection(projectDocRef, "files");
//   const querySnapshot = await getDocs(filesCollectionRef);

//   return querySnapshot.docs.map((doc) => {
//     return {
//       fid: doc.id,
//       ...doc.data(),
//     } as CloudFile;
//   }) as CloudFile[];
// }

export async function getCustomer() {

  const res = await fetch("/api/customer", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    // Forward server‑side error message if available
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(`get_customer failed: ${error}`);
  }

  const { customer } = (await res.json()) as { customer?: Customer };

  return customer;
}

// REMOVE THIS FOR PROD
// THIS IS ONLY USED TO GIVE YOURSELF PREMIUM IN THE DEMO
export async function storeCustomer(cust: Customer) {
  const customerDocRef = doc(db, "customers", cust.uid);
  const customerDoc = await getDoc(customerDocRef);

  if(customerDoc) {
    await updateDoc(
      customerDocRef,
      {
        ...cust,
      }
    );
  }
  else { // this should never happen but meh
    await setDoc(customerDocRef, { ...cust });
  }
}


