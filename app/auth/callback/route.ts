import { type NextRequest, NextResponse } from "next/server";

// Google 登录后 Supabase 带着 ?code= 跳回这里，用 PKCE code 换取会话 cookie，
// 然后跳到 ?next=（只接受站内相对路径，默认是 demo 的 /auth/finish）
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const base = baseUrl(request, origin);

  if (code) {
    // 延迟加载：未配置 Supabase 环境变量时 env.ts 会抛错，不能让它影响构建
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${base}${next}`);
  }

  // 问卷首页自己显示错误；demo 跳到 /auth/error
  return NextResponse.redirect(
    next === "/" ? `${base}/?signin=failed` : `${base}/auth/error`,
  );
}

function safeNext(next: string | null) {
  // 拒绝 //evil.com 和 /\evil.com，浏览器会把它们当成别的域名
  if (!next || !/^\/(?![/\\])/.test(next)) {
    return "/auth/finish";
  }
  return next;
}

// Vercel 等负载均衡后面，原始域名在 x-forwarded-host 里
function baseUrl(request: NextRequest, origin: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (process.env.NODE_ENV === "development" || !forwardedHost) return origin;
  return `https://${forwardedHost}`;
}
