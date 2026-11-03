import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// 上线的只有等候名单问卷；demo 页面默认隐藏（跳回首页），
// 设 DEMO_ENABLED=true 才能访问（本地开发、路演用）
const WAITLIST_PATHS = new Set(["/", "/raffle-rules", "/auth/callback"]);

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
    // 跳过静态资源和图片
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
