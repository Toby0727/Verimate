function required(name: string, value: string | undefined) {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

// NEXT_PUBLIC_ 变量必须写成字面量 process.env.X，Next.js 才会在构建时内联到浏览器端
export const supabaseUrl = required(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);
export const supabasePublishableKey = required(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
