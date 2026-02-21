import axios from "axios";
import type { Session } from "next-auth";
import { getSession, signOut } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

let cachedSession: Session | null = null;
let sessionPromise: Promise<Session | null> | null = null;

function getCachedSession() {
  if (!sessionPromise) {
    sessionPromise = getSession().then((session) => {
      cachedSession = session;
      // Clear the promise so next call refreshes after a delay
      setTimeout(() => {
        sessionPromise = null;
      }, 30000); // Cache for 30s (matches TanStack Query staleTime)
      return session;
    });
  }
  return sessionPromise;
}

// Clear session cache on sign out or 401
export function clearSessionCache() {
  cachedSession = null;
  sessionPromise = null;
}

api.interceptors.request.use(async (config) => {
  const session = cachedSession || (await getCachedSession());
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSessionCache();
      signOut({ callbackUrl: "/login" });
    }
    return Promise.reject(error);
  }
);

export default api;
