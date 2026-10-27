import { Suspense } from "react";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { RequestDetail } from "@/components/messages/request-detail";
import { PageHeader } from "@/components/shell/page-header";

export default function RequestPage({
  params,
}: PageProps<"/messages/requests/[id]">) {
  return (
    <>
      <PageHeader title="Message request" backHref="/messages" />
      <Suspense fallback={<DemoSkeleton />}>
        {params.then(({ id }) => (
          <RequestDetail id={id} />
        ))}
      </Suspense>
    </>
  );
}
