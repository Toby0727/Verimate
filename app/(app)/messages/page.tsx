import { Inbox } from "@/components/messages/inbox";
import { PageHeader } from "@/components/shell/page-header";

export default function MessagesPage() {
  return (
    <>
      <PageHeader title="Messages" />
      <Inbox />
    </>
  );
}
