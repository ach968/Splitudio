import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  signOut as _signOut,
  signInWithEmailAndPassword as _signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "@/lib/firebase/clientApp";

export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signOut() {
  return _signOut(auth);
}

export async function signInWithEmailAndPassword(email, password) {
  return _signInWithEmailAndPassword(auth, email, password);
}
