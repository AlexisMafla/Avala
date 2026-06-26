import { describe, expect, it } from "vitest";
import { requiresMcpPayment } from "../src/mcp/http.js";

describe("requiresMcpPayment", () => {
  it("returns false for initialize", () => {
    expect(requiresMcpPayment({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} })).toBe(false);
  });

  it("returns false for tools/list", () => {
    expect(requiresMcpPayment({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} })).toBe(false);
  });

  it("returns true for tools/call", () => {
    expect(
      requiresMcpPayment({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "validate_tax_id", arguments: { country: "ES", value: "12345678Z" } },
      }),
    ).toBe(true);
  });

  it("returns true when a batch contains tools/call", () => {
    expect(
      requiresMcpPayment([
        { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
        {
          jsonrpc: "2.0",
          id: 2,
          method: "tools/call",
          params: { name: "validate_iban", arguments: { value: "ES9121000418450200051332" } },
        },
      ]),
    ).toBe(true);
  });
});
