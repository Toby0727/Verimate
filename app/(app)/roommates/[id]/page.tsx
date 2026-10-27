import { Suspense } from "react";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { ProfileDetail } from "@/components/roommates/profile-detail";

export default function RoommatePage({ params }: PageProps<"/roommates/[id]">) {
  return (
    <Suspense fallback={<DemoSkeleton />}>
      {params.then(({ id }) => (
        <ProfileDetail id={id} />
      ))}
    </Suspense>
  );
}
