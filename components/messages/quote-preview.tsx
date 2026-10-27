import Image from "next/image";
import { labelOf, PROMPTS } from "@/components/shell/labels";
import type { RequestQuote } from "@/lib/rules/types";

// The photo or prompt answer a message request replies to.
export function QuotePreview({ quote }: { quote: RequestQuote }) {
  if (quote.kind === "photo") {
    return (
      <div className="relative h-28 w-24 overflow-hidden rounded-xl bg-muted">
        <Image
          src={quote.photo}
          alt=""
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-muted px-3 py-2.5">
      <p className="font-semibold text-xs">
        {labelOf(PROMPTS, quote.promptId)}
      </p>
      <p className="mt-1 font-serif text-base leading-snug">{quote.answer}</p>
    </div>
  );
}
