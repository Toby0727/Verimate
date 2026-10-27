import { Suspense } from "react";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { ChatView } from "@/components/messages/chat-view";
import { PageHeader } from "@/components/shell/page-header";

export default function ChatPage({ params }: PageProps<"/messages/[id]">) {
  return (
    <>
      <PageHeader title="Chat" backHref="/messages" />
      <Suspense fallback={<DemoSkeleton />}>
        {params.then(({ id }) => (
          <ChatView id={id} />
        ))}
      </Suspense>
    </>
  );
}
