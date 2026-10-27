import { PageHeader } from "@/components/shell/page-header";
import { SubletList } from "@/components/sublets/sublet-list";

export default function SubletsPage() {
  return (
    <>
      <PageHeader title="Sublets" />
      <SubletList />
    </>
  );
}
