import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  storageBucket?: string;
  messagingSenderId?: string;
};

const config = readFirebaseConfig();

export function isFirebaseConfigured(): boolean {
  return config !== null;
}

export function getFirebaseAppInstance(): FirebaseApp | null {
  if (!config) {
    return null;
  }

  return getApps().length > 0 ? getApp() : initializeApp(config);
}

export function getFirebaseAuthInstance(): Auth | null {
  const app = getFirebaseAppInstance();
  return app ? getAuth(app) : null;
}

export function getGoogleProvider(): GoogleAuthProvider | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

export function getFirestoreInstance(): Firestore | null {
  const app = getFirebaseAppInstance();
  return app ? getFirestore(app) : null;
}

function readFirebaseConfig(): FirebaseWebConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  };
}
