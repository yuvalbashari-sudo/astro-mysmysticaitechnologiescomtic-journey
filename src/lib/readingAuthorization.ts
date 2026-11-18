import { subscriptionManager } from "@/lib/subscriptionManager";

export function readingAuthorization(): string {
  const token = subscriptionManager.getAccessToken() ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return "Bearer " + token;
}
