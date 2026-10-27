import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./env";

// Client Components（浏览器端）使用；createBrowserClient 内部是单例
export function createClient() {
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
