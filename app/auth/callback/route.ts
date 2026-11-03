import { type NextRequest, NextResponse } from "next/server";

// Google 登录后 Supabase 带着 ?code= 跳回这里，用 PKCE code 换取会话 cookie
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const base = baseUrl(request, origin);

  if (code) {
    // 延迟加载：未配置 Supabase 环境变量时 env.ts 会抛错，不能让它影响构建
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${base}/auth/finish`);
  }

  return NextResponse.redirect(`${base}/auth/error`);
}

// Vercel 等负载均衡后面，原始域名在 x-forwarded-host 里
function baseUrl(request: NextRequest, origin: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (process.env.NODE_ENV === "development" || !forwardedHost) return origin;
  return `https://${forwardedHost}`;
}
