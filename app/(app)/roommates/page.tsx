import { RoommateList } from "@/components/roommates/roommate-list";
import { PageHeader } from "@/components/shell/page-header";

export default function RoommatesPage() {
  return (
    <>
      <PageHeader title="Roommates" />
      <RoommateList />
    </>
  );
}
