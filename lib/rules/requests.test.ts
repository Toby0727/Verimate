import { describe, expect, it } from "vitest";
import {
  canSendRequest,
  effectiveStatus,
  isRequestExpired,
  requestsSentToday,
} from "./requests";
import {
  makeProfile,
  makeVerification,
  NOW,
  twoUserDataset,
} from "./test-fixtures";
import { addDays } from "./time";
import type { MessageRequest } from "./types";

const request = (overrides: Partial<MessageRequest> = {}): MessageRequest => ({
  id: "r1",
  fromId: "a1",
  toId: "a2",
  message: "Hi!",
  context: { type: "profile" },
  status: "pending",
  createdAt: NOW.toISOString(),
  respondedAt: null,
  ...overrides,
});

describe("expiry", () => {
  it("expires pending requests after 14 days", () => {
    expect(
      isRequestExpired(request({ createdAt: addDays(NOW, -13) }), NOW),
    ).toBe(false);
    expect(
      isRequestExpired(request({ createdAt: addDays(NOW, -15) }), NOW),
    ).toBe(true);
    expect(
      effectiveStatus(
        request({ status: "accepted", createdAt: addDays(NOW, -30) }),
        NOW,
      ),
    ).toBe("accepted");
  });
});

describe("canSendRequest", () => {
  it("allows a first request between verified, complete users", () => {
    expect(canSendRequest(twoUserDataset(), "a1", "a2", NOW)).toEqual({
      ok: true,
    });
  });

  it("refuses unverified senders", () => {
    const data = twoUserDataset({
      verifications: [
        makeVerification({ expiresAt: addDays(NOW, -1) }),
        makeVerification({ id: "v2", accountId: "a2" }),
      ],
    });
    expect(canSendRequest(data, "a1", "a2", NOW)).toEqual({
      ok: false,
      reason: "unverified",
    });
  });

  it("refuses when either profile is incomplete", () => {
    const data = twoUserDataset({
      profiles: [makeProfile(), makeProfile({ accountId: "a2", photo: null })],
    });
    expect(canSendRequest(data, "a1", "a2", NOW)).toEqual({
      ok: false,
      reason: "incomplete",
    });
  });

  it("refuses when either side blocked the other", () => {
    const data = twoUserDataset({
      blocks: [
        { blockerId: "a2", blockedId: "a1", createdAt: NOW.toISOString() },
      ],
    });
    expect(canSendRequest(data, "a1", "a2", NOW)).toEqual({
      ok: false,
      reason: "blocked",
    });
  });

  it("refuses a second open request in either direction", () => {
    const pending = twoUserDataset({
      messageRequests: [request({ fromId: "a2", toId: "a1" })],
    });
    expect(canSendRequest(pending, "a1", "a2", NOW)).toEqual({
      ok: false,
      reason: "duplicate",
    });
    const expired = twoUserDataset({
      messageRequests: [request({ createdAt: addDays(NOW, -15) })],
    });
    expect(canSendRequest(expired, "a1", "a2", NOW)).toEqual({ ok: true });
  });

  it("enforces the 30-day cooldown after a deleted request", () => {
    const deleted = (days: number) =>
      twoUserDataset({
        messageRequests: [
          request({
            status: "deleted",
            createdAt: addDays(NOW, -days - 1),
            respondedAt: addDays(NOW, -days),
          }),
        ],
      });
    expect(canSendRequest(deleted(29), "a1", "a2", NOW)).toEqual({
      ok: false,
      reason: "cooldown",
    });
    expect(canSendRequest(deleted(31), "a1", "a2", NOW)).toEqual({ ok: true });
  });

  it("allows 10 new requests a day and refuses the 11th", () => {
    const sentToday = (count: number) =>
      Array.from({ length: count }, (_, i) =>
        request({ id: `x${i}`, toId: `other${i}` }),
      );
    const nine = twoUserDataset({ messageRequests: sentToday(9) });
    expect(requestsSentToday(nine, "a1", NOW)).toBe(9);
    expect(canSendRequest(nine, "a1", "a2", NOW)).toEqual({ ok: true });
    const ten = twoUserDataset({ messageRequests: sentToday(10) });
    expect(canSendRequest(ten, "a1", "a2", NOW)).toEqual({
      ok: false,
      reason: "daily-limit",
    });
  });
});
