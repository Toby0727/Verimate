"use client";

import Image from "next/image";
import Link from "next/link";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { SampleBadge } from "@/components/demo/sample-badge";
import { AccessGate } from "@/components/shell/access-gate";
import { formatDay } from "@/components/shell/labels";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { otherParticipant, profileOf } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";
import { effectiveStatus } from "@/lib/rules/requests";
import { isHiddenFor } from "@/lib/rules/visibility";
import { cn } from "@/lib/utils";

const STATUS_LABEL = {
  pending: "Waiting",
  accepted: "Accepted",
  deleted: "Declined",
  expired: "Expired",
} as const;

function PersonRow({
  href,
  photo,
  name,
  preview,
  meta,
  muted,
}: {
  href: string;
  photo: string | null | undefined;
  name: string;
  preview: string;
  meta: string;
  muted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl p-2 hover:bg-muted",
        muted && "opacity-60",
      )}
    >
      <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">
        {photo ? (
          <Image
            src={photo}
            alt=""
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium text-sm">{name}</span>
          <span className="shrink-0 text-muted-foreground text-xs">{meta}</span>
        </div>
        <p className="truncate text-muted-foreground text-sm">{preview}</p>
      </div>
    </Link>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="p-8 text-center text-muted-foreground text-sm">{children}</p>
  );
}

function InboxContent() {
  const demo = useDemo();
  if (!demo?.meId) return <DemoSkeleton />;
  const { world, now, meId } = demo;
  const visible = (id: string) => !isHiddenFor(meId, id, world.blocks);

  const received = world.messageRequests
    .filter((r) => r.toId === meId && visible(r.fromId))
    .filter((r) => ["pending", "expired"].includes(effectiveStatus(r, now)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const sent = world.messageRequests
    .filter((r) => r.fromId === meId && visible(r.toId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const chats = world.conversations
    .filter((c) => c.participantIds.includes(meId))
    .filter((c) => visible(otherParticipant(c.participantIds, meId)));
  const pendingCount = received.filter(
    (r) => effectiveStatus(r, now) === "pending",
  ).length;

  return (
    <Tabs defaultValue="requests" className="p-4">
      <TabsList className="w-full">
        <TabsTrigger value="requests">
          Requests{pendingCount ? ` · ${pendingCount}` : ""}
        </TabsTrigger>
        <TabsTrigger value="sent">Sent</TabsTrigger>
        <TabsTrigger value="chats">Chats</TabsTrigger>
      </TabsList>

      <TabsContent value="requests" className="flex flex-col gap-1 pt-2">
        <div className="flex items-center gap-2 px-2 text-muted-foreground text-xs">
          New people can send you one message. Requests expire after 14 days.
          <SampleBadge />
        </div>
        {received.length === 0 ? <Empty>No requests right now.</Empty> : null}
        {received.map((r) => {
          const p = profileOf(world, r.fromId);
          const status = effectiveStatus(r, now);
          return (
            <PersonRow
              key={r.id}
              href={`/messages/requests/${r.id}`}
              photo={p?.photo}
              name={p?.displayName ?? "Someone"}
              preview={r.message}
              meta={status === "expired" ? "Expired" : formatDay(r.createdAt)}
              muted={status === "expired"}
            />
          );
        })}
      </TabsContent>

      <TabsContent value="sent" className="flex flex-col gap-1 pt-2">
        {sent.length === 0 ? (
          <Empty>You haven't sent any requests yet.</Empty>
        ) : null}
        {sent.map((r) => {
          const p = profileOf(world, r.toId);
          const status = effectiveStatus(r, now);
          const chat = world.conversations.find((c) => c.requestId === r.id);
          return (
            <PersonRow
              key={r.id}
              href={chat ? `/messages/${chat.id}` : `/roommates/${r.toId}`}
              photo={p?.photo}
              name={p?.displayName ?? "Someone"}
              preview={r.message}
              meta={STATUS_LABEL[status]}
              muted={status !== "pending" && status !== "accepted"}
            />
          );
        })}
      </TabsContent>

      <TabsContent value="chats" className="flex flex-col gap-1 pt-2">
        {chats.length === 0 ? (
          <Empty>Accepted requests show up here.</Empty>
        ) : null}
        {chats.map((c) => {
          const otherId = otherParticipant(c.participantIds, meId);
          const p = profileOf(world, otherId);
          const last = world.messages
            .filter((m) => m.conversationId === c.id)
            .sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0];
          return (
            <PersonRow
              key={c.id}
              href={`/messages/${c.id}`}
              photo={p?.photo}
              name={p?.displayName ?? "Someone"}
              preview={last?.body ?? "Say hi!"}
              meta={last ? formatDay(last.sentAt) : ""}
            />
          );
        })}
      </TabsContent>
    </Tabs>
  );
}

export function Inbox() {
  return (
    <AccessGate require="signed-in">
      <InboxContent />
    </AccessGate>
  );
}
