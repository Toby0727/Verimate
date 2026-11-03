import Link from "next/link";
import { SimplePage } from "@/components/shell/simple-page";
import { buttonVariants } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <SimplePage title="Sign in" backHref="/">
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <h2 className="font-semibold text-lg">Google sign-in didn't finish</h2>
        <p className="max-w-xs text-muted-foreground text-sm">
          The sign-in link expired or was cancelled. Try again from the start.
        </p>
        <Link href="/sign-in" className={buttonVariants({ className: "mt-2" })}>
          Back to sign in
        </Link>
      </div>
    </SimplePage>
  );
}
