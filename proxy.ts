import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// 上线的只有等候名单问卷和团队后台 /team；demo 页面默认隐藏（跳回首页），
// 设 DEMO_ENABLED=true 才能访问（本地开发、路演用）
const WAITLIST_PATHS = new Set([
  "/",
  "/raffle-rules",
  "/privacy",
  "/auth/callback",
  // Team dashboard; the database decides who sees data.
  "/team",
]);

export async function proxy(request: NextRequest) {
  if (
    process.env.DEMO_ENABLED !== "true" &&
    !WAITLIST_PATHS.has(request.nextUrl.pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 只跳过构建产物、标签页图标、public/ 下的示例图片和 vendor 脚本；不按扩展名跳过，
    // 否则 /roommates/a.png 这类路径会绕过上面的 demo 拦截
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|sample/|vendor/).*)",
  ],
};
