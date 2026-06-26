import type { Hono } from "hono";
import type { Context, MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer } from "./server.js";
import { createPathPaymentMiddleware, type PaymentConfig } from "../http/payments.js";

const MCP_PATH = "/mcp";

const MCP_CORS_HEADERS = [
  "Content-Type",
  "mcp-session-id",
  "Last-Event-ID",
  "mcp-protocol-version",
  "X-Payment",
  "X-PAYMENT",
];

function extractRpcMethods(body: unknown): string[] {
  if (Array.isArray(body)) {
    return body.flatMap(extractRpcMethods);
  }
  if (body && typeof body === "object" && "method" in body && typeof body.method === "string") {
    return [body.method];
  }
  return [];
}

/** True when the MCP request invokes a paid tool (tools/call). */
export function requiresMcpPayment(body: unknown): boolean {
  return extractRpcMethods(body).some((method) => method === "tools/call");
}

function createMcpPaymentMiddleware(config: PaymentConfig): MiddlewareHandler {
  const paidMiddleware = createPathPaymentMiddleware(
    config,
    MCP_PATH,
    "Avala MCP tool invocation",
  );

  return async (c, next) => {
    if (c.req.method !== "POST") {
      return next();
    }

    const body = await c.req.json();
    c.set("mcpParsedBody", body);

    if (!requiresMcpPayment(body)) {
      return next();
    }

    return paidMiddleware(c, next);
  };
}

async function handleMcpRequest(c: Context): Promise<Response> {
  const parsedBody = c.req.method === "POST" ? c.get("mcpParsedBody") : undefined;

  const transport = new WebStandardStreamableHTTPServerTransport();
  const server = createMcpServer();
  await server.connect(transport);

  return transport.handleRequest(c.req.raw, { parsedBody });
}

/** Register the remote MCP endpoint (Streamable HTTP) on the Hono app. */
export function registerMcpHttpRoute(app: Hono, config: PaymentConfig): void {
  app.use(
    MCP_PATH,
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowHeaders: MCP_CORS_HEADERS,
      exposeHeaders: ["mcp-session-id", "mcp-protocol-version", "X-Payment-Response", "X-PAYMENT-RESPONSE"],
    }),
  );

  app.use(MCP_PATH, createMcpPaymentMiddleware(config));
  app.all(MCP_PATH, handleMcpRequest);

  console.log(`[avala] MCP HTTP endpoint -> ${MCP_PATH} (x402 on tools/call: ${config.enabled ? "on" : "off"})`);
}

export const MCP_HTTP_PATH = MCP_PATH;
