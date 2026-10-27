import { PageHeader } from "@/components/shell/page-header";
import { MySublets } from "@/components/sublets/my-sublets";

export default function MySubletsPage() {
  return (
    <>
      <PageHeader title="My sublets" backHref="/me" />
      <MySublets />
    </>
  );
}
