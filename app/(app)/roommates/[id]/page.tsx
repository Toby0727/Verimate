import { Suspense } from "react";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { ProfileDetail } from "@/components/roommates/profile-detail";
import { PageHeader } from "@/components/shell/page-header";

export default function RoommatePage({ params }: PageProps<"/roommates/[id]">) {
  return (
    <>
      <PageHeader title="Profile" backHref="/roommates" />
      <Suspense fallback={<DemoSkeleton />}>
        {params.then(({ id }) => (
          <ProfileDetail id={id} />
        ))}
      </Suspense>
    </>
  );
}
