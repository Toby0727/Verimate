import { describe, expect, it } from "vitest";
import { detectFraudSignals } from "./fraud";

describe("detectFraudSignals", () => {
  it("detects phone numbers", () => {
    expect(detectFraudSignals("call me at (315) 555-0123")).toEqual(["phone"]);
    expect(detectFraudSignals("我的手机 13812345678")).toEqual(["phone"]);
  });

  it("detects external handles", () => {
    expect(detectFraudSignals("add me on WeChat")).toEqual(["external-handle"]);
    expect(detectFraudSignals("加我微信吧")).toEqual(["external-handle"]);
    expect(detectFraudSignals("my ig is @jamie.syr")).toEqual([
      "external-handle",
    ]);
  });

  it("detects payment requests", () => {
    expect(detectFraudSignals("send a deposit on Venmo")).toEqual(["payment"]);
    expect(detectFraudSignals("先付押金")).toEqual(["payment"]);
    expect(detectFraudSignals("I can do Cash App")).toEqual(["payment"]);
  });

  it("reports several signals at once", () => {
    expect(detectFraudSignals("text 315-555-0123, Zelle the deposit")).toEqual([
      "phone",
      "payment",
    ]);
  });

  it("does not flag ordinary messages", () => {
    expect(detectFraudSignals("Could I see the room this weekend?")).toEqual(
      [],
    );
    // Whole-word matching: "transferred" is not "transfer".
    expect(detectFraudSignals("I transferred schools last year")).toEqual([]);
    expect(detectFraudSignals("The big kitchen is great")).toEqual([]);
  });
});
