import { Suspense } from "react";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { PageHeader } from "@/components/shell/page-header";
import { SubletDetail } from "@/components/sublets/sublet-detail";

export default function SubletPage({ params }: PageProps<"/sublets/[id]">) {
  return (
    <>
      <PageHeader title="Sublet" backHref="/sublets" />
      <Suspense fallback={<DemoSkeleton />}>
        {params.then(({ id }) => (
          <SubletDetail id={id} />
        ))}
      </Suspense>
    </>
  );
}
