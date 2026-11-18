import { useSyncExternalStore } from "react";
import { subscriptionManager } from "@/lib/subscriptionManager";

export function useSiteAdmin(): boolean {
  return useSyncExternalStore(subscriptionManager.onAuthChange, subscriptionManager.isAdmin, () => false);
}
