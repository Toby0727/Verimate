import { MembershipPage } from "@/components/membership/membership-page";
import { PageHeader } from "@/components/shell/page-header";

export default function MembershipRoute() {
  return (
    <>
      <PageHeader title="Membership" backHref="/me" />
      <MembershipPage />
    </>
  );
}
