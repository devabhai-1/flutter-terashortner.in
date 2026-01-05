import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { ref, set, update, get, child } from "firebase/database";
import { getFirebaseAuth, getFirebaseDatabase, hashPassword, safeEmailKey, generateZeroStats } from "./firebase";

export interface UserData {
  profile: {
    name: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    lastLogin: string;
  };
  dashboard: {
    currentCPM: number;
    totalavailable: number;
    todayImpressions: number;
    totalEarnings: number;
    totalImpressions: number;
    dailyStats: Record<string, { impressions: number; earnings: number; cpm: number }>;
  };
  withdrawals: {
    totalWithdrawn: number;
    totalavailable: number;
    requests: Record<string, any>;
  };
  shortner: {
    web: Record<string, any>;
    telegram: Record<string, any>;
  };
}

export async function handleSignup(
  name: string,
  email: string,
  password: string
): Promise<void> {
  let auth, db;
  try {
    auth = getFirebaseAuth();
    db = getFirebaseDatabase();
  } catch (error: any) {
    throw new Error("Firebase not configured. Please update config.ts with your Firebase credentials.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  await createUserWithEmailAndPassword(auth, email, password);

  const now = new Date().toISOString();
  const emailKey = safeEmailKey(email);
  const hashedPass = await hashPassword(password);

  const userData: UserData = {
    profile: {
      name,
      email,
      passwordHash: hashedPass,
      createdAt: now,
      lastLogin: now,
    },
    dashboard: {
      currentCPM: 0,
      totalavailable: 0,
      todayImpressions: 0,
      totalEarnings: 0,
      totalImpressions: 0,
      dailyStats: generateZeroStats(),
    },
    withdrawals: {
      totalWithdrawn: 0,
      totalavailable: 0,
      requests: {
        "-initRequest": {
          method: "UPI",
          amount: 0,
          date: now,
          status: "pending",
          details: { upi: "init@upi" },
        },
      },
    },
    shortner: {
      web: {
        initCode: {
          originalUrl: "https://terabox.com/s/placeholder",
          shortUrl: `${window.location.origin}/a/initCode`,
          fileId: "placeholder",
          views: 0,
          createdAt: now,
        },
      },
      telegram: {
        initTelegram: {
          originalUrl: "https://terabox.com/s/initTelegram",
          shortUrl: `${window.location.origin}/a/initTelegram`,
          fileId: "initTelegram",
          telegramId: "000000",
          views: 0,
          createdAt: now,
        },
      },
    },
  };

  await set(ref(db, `users/${emailKey}`), userData);
  localStorage.setItem("userData", JSON.stringify(userData));
}

export async function handleLogin(
  email: string,
  password: string
): Promise<UserData> {
  let auth, db;
  try {
    auth = getFirebaseAuth();
    db = getFirebaseDatabase();
  } catch (error: any) {
    throw new Error("Firebase not configured. Please update config.ts with your Firebase credentials.");
  }

  await signInWithEmailAndPassword(auth, email, password);

  const emailKey = safeEmailKey(email);
  const snapshot = await get(child(ref(db), `users/${emailKey}`));

  if (!snapshot.exists()) {
    throw new Error("User data not found in database.");
  }

  const now = new Date().toISOString();
  const hashedPass = await hashPassword(password);

  await update(ref(db, `users/${emailKey}/profile`), {
    lastLogin: now,
    passwordHash: hashedPass,
  });

  const data = snapshot.val();
  const updatedData: UserData = {
    ...data,
    profile: {
      ...(data.profile || {}),
      lastLogin: now,
      passwordHash: hashedPass,
    },
  };

  localStorage.setItem("userData", JSON.stringify(updatedData));
  return updatedData;
}

export function watchAuth(callback: (user: User | null) => void) {
  try {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, callback);
  } catch (error) {
    console.warn("Firebase auth not available");
    return () => {}; // Return empty unsubscribe function
  }
}

export function getCurrentUser(): User | null {
  try {
    const auth = getFirebaseAuth();
    return auth.currentUser;
  } catch (error) {
    return null;
  }
}

