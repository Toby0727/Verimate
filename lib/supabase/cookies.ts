// 会话 cookie 的公共设置：生产环境只走 HTTPS（Secure）。
// 不放在 env.ts 里，因为 proxy.ts 在缺环境变量时也要能导入。
export const cookieOptions = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};
