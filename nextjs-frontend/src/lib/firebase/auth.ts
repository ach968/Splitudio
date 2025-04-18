import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  signOut as _signOut,
  signInWithEmailAndPassword as _signInWithEmailAndPassword,
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
import { Customer } from "@/types/firestore";

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
  const customerDocRef = doc(db, "customers", user.uid);

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

  // 2) ensure empty custoemr record
  const customerDoc = await getDoc(customerDocRef);
  if(!customerDoc.exists()){
    const newCust: Customer = {
      uid: user.uid,
      stripeCustomerId: '',
      subscriptionStatus: 'none',
      apiUsage: 0
    }
  
    await setDoc(customerDocRef, newCust);
  }

  const idToken = await userCredential.user.getIdToken();
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
