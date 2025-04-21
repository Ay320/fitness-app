import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Interface for authentication state
interface AuthState {
  user: User;
  token: string;
}

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthState> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();
    console.log('Firebase Token:', token); // Log the token
    return { user, token };
  } catch (error: any) {
    throw new Error(`Sign-in failed: ${error.message}`);
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(`Sign-out failed: ${error.message}`);
  }
};

// Listen for authentication state changes
export const onAuthChange = (callback: (state: AuthState | null) => void): void => {
  onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const token = await user.getIdToken();
      callback({ user, token });
    } else {
      callback(null);
    }
  });
};