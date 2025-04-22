const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// When deployed, there are quotes that need to be stripped
const sanitizedConfig = Object.fromEntries(
  Object.entries(config).map(([key, value]) => {
    const stringVal = String(value);
    if (stringVal.startsWith('"') && stringVal.endsWith('"')) {
      return [key, stringVal.slice(1, -1)];
    }
    return [key, stringVal];
  })
);

export const firebaseConfig = sanitizedConfig;
