import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  signOut as _signOut,
  UserCredential,
  User,
  NextOrObserver,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { app, auth } from "@/lib/firebase/firebase";

const db = getFirestore(app);

export function onAuthStateChanged(cb: NextOrObserver<User>) {
  return _onAuthStateChanged(auth, cb);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  // Store new users, update login time for existing users
  await storeUser(result);
  return result;
}

async function storeUser(userCredential: UserCredential) {
  const { user } = userCredential;
  const userDocRef = doc(db, "users", user.uid);

  // 1) Auth users doc
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  } else {
    await setDoc(
      userDocRef,
      {
        lastLoginAt: serverTimestamp(),
      },
      {
        merge: true,
      }
    );
  }

  // 1.5 ) For demo purposes, clone projects from splitudio account
  if(process.env.DEMO == "true") {
    await fetch("/api/demo_load_projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceUserId: '5QTYUdsZIwhOJezBWZcdr3CwRKM2' , targetUserId: user.uid }),
    });
  }
  
  // 2) Hit backend API to ensure customer document exists
  const idToken = await user.getIdToken();

  await fetch("/api/customer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  // 3) Set session cookie
  await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

export async function signOut() {
  await fetch("/api/session", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  return _signOut(auth);
}
