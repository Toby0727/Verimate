import { PageHeader } from "@/components/shell/page-header";
import { SubletForm } from "@/components/sublets/sublet-form";

export default function NewSubletPage() {
  return (
    <>
      <PageHeader title="Post a sublet" backHref="/sublets" />
      <SubletForm />
    </>
  );
}
