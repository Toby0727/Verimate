import { SampleBadge } from "@/components/demo/sample-badge";
import { SimplePage } from "@/components/shell/simple-page";

export default function TermsPage() {
  return (
    <SimplePage title="Terms of service" backHref="/">
      <p className="flex items-center gap-2 text-muted-foreground text-sm">
        Draft for the demo, not legal advice <SampleBadge />
      </p>
      <div className="flex flex-col gap-3 text-sm leading-relaxed">
        <p>
          Verimate helps verified SU and ESF students find roommates and share
          sublet information. Verimate only provides information and a way to
          contact people. It is not a party to any lease or payment and does not
          guarantee any listing.
        </p>
        <p>
          You must be 18 or older, or 17 and a verified admitted student. One
          school email can belong to one account. Agents and landlords may not
          post.
        </p>
        <p>
          Report anything suspicious. The team reviews reports within 48 hours
          and may remove posts, warn or ban accounts. Verimate does not settle
          money disputes but keeps evidence you can share with the police.
        </p>
      </div>
    </SimplePage>
  );
}
