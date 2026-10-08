export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string | undefined,
  websocketUrl: import.meta.env.VITE_WEBSOCKET_URL as string | undefined,
  // Overrides stay on for dev/demo builds; set VITE_ALLOW_API_OVERRIDE=false for production.
  allowOverride: (import.meta.env.VITE_ALLOW_API_OVERRIDE ?? "true") !== "false",
};
