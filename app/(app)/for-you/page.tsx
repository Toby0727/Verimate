import { ForYouList } from "@/components/for-you/for-you-list";
import { PageHeader } from "@/components/shell/page-header";

export default function ForYouPage() {
  return (
    <>
      <PageHeader title="For You" />
      <ForYouList />
    </>
  );
}
