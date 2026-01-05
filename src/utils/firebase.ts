import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import type { Database } from "firebase/database";
import { firebaseConfig } from "../config";

let app: any;
let auth: Auth;
let db: Database;

export function initializeFirebase() {
  try {
    // Check if config is valid (not empty values)
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "" || firebaseConfig.apiKey === "YOUR_API_KEY") {
      console.warn("Firebase config not set. Please update .env file with your Firebase credentials.");
      return null;
    }
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getDatabase(app);
    return { app, auth, db };
  } catch (err) {
    console.error("Firebase init failed:", err);
    console.warn("App will continue without Firebase. Please check config.ts");
    return null;
  }
}

export function getFirebaseAuth() {
  if (!auth) {
    const result = initializeFirebase();
    if (!result) {
      throw new Error("Firebase not initialized. Please configure Firebase in config.ts");
    }
    auth = result.auth;
  }
  return auth;
}

export function getFirebaseDatabase() {
  if (!db) {
    const result = initializeFirebase();
    if (!result) {
      throw new Error("Firebase not initialized. Please configure Firebase in config.ts");
    }
    db = result.db;
  }
  return db;
}

// SHA-256 hash helper
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Firebase-safe key
export function safeEmailKey(email: string): string {
  return String(email).trim().toLowerCase().replace(/\./g, "_");
}

// Create 10-day stats
export function generateZeroStats(days: number = 10) {
  const stats: Record<string, { impressions: number; earnings: number; cpm: number }> = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const isoDate = date.toISOString().split("T")[0];
    stats[isoDate] = { impressions: 0, earnings: 0, cpm: 0 };
  }
  return stats;
}

