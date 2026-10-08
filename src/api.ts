import { useEffect, useState } from "react";
import { createAuthClient, type Session } from "@booking/shared/auth";
import { resolveApiConfig, type KeyValueStore } from "@booking/shared/runtime-config";
import { env } from "./env";

function browserStore(): KeyValueStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const store = browserStore();

/** The backend chosen in the connection panel, read fresh on every call. */
export function apiBaseUrl(): string {
  return resolveApiConfig({
    store,
    buildApiBaseUrl: env.apiBaseUrl,
    buildWebsocketUrl: env.websocketUrl,
    allowOverride: env.allowOverride,
  }).config.apiBaseUrl;
}

export const auth = createAuthClient({ baseUrl: apiBaseUrl, store });

export function useSession(): Session | null {
  const [session, setSession] = useState(auth.current());
  useEffect(() => auth.subscribe(setSession), []);
  return session;
}
