import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { cookieOptions } from "./cookies";

// 每个请求刷新 Supabase 会话 cookie，由根目录 proxy.ts 调用。只刷新，不拦截页面：
// demo 允许未登录浏览，访问控制以后用服务端 getClaims() 和 RLS 做。
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // 未配置 Supabase 环境变量时跳过，示例 demo 照常可用
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return supabaseResponse;

  // 每个请求新建 client，不要放全局变量
  const supabase = createServerClient(url, key, {
    cookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // createServerClient 和 getClaims() 之间不要插入任何代码，否则会导致用户被随机登出
  await supabase.auth.getClaims();

  // 必须原样返回 supabaseResponse，否则浏览器和服务端的会话 cookie 会不同步
  return supabaseResponse;
}
