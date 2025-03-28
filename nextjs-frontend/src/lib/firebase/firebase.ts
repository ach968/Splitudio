import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "@/lib/firebase/config";
import { getStorage } from "firebase/storage";

// Initialize Firebase instance
const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

export { firebaseApp as app, auth, storage };
