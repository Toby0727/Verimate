"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import * as actions from "@/lib/demo/actions";

export function BrowseAsVisitor() {
  return (
    <Link
      href="/roommates"
      onClick={() => actions.switchPersona("visitor")}
      className={buttonVariants({ size: "lg", variant: "outline" })}
    >
      Browse as visitor
    </Link>
  );
}
