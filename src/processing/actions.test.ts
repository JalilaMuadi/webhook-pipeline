import { describe, it, expect } from "vitest";
import { transformPayload } from "./actions.js";

describe("Payload Transformations", () => {
  it("should uppercase the message correctly", () => {
    const input = JSON.stringify({ data: "hello" });
    const result = transformPayload(input, "uppercase");
    expect(result).toContain("HELLO");
  });

  it("should mask email addresses for privacy", () => {
    const input = JSON.stringify({ user: "test@example.com" });
    const result = transformPayload(input, "mask_emails");
    expect(result).toContain("******@***.com");
  });

  it("should filter out low price items (filter_high_price)", () => {
    const lowPrice = JSON.stringify({ price: 50 });
    const result = transformPayload(lowPrice, "filter_high_price");
    expect(result).toBeNull();
  });

  it("should return the original payload when type is passthrough", () => {
    const input = JSON.stringify({ key: "value" });
    const result = transformPayload(input, "passthrough");
    expect(result).toBe(input);
  });
});
