import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { loadDotEnv } from "../load-env.js";
import { SUPPORTED_COUNTRIES } from "../core/index.js";
import { MCP_HTTP_PATH, registerMcpHttpRoute } from "../mcp/http.js";
import { TOOLS, getTool } from "../tools/definitions.js";
import { loadPaymentConfig, buildPaymentDiscovery, buildPaymentStatus, registerRestPaymentGating } from "./payments.js";
import { buildMppManifest } from "./manifest.js";
import { paymentStore } from "./store.js";
import { dashboardHtml } from "./dashboard.js";

loadDotEnv();

const PORT = Number(process.env.PORT ?? 8787);
const IS_PROD = process.env.NODE_ENV === "production";
const WEB_DIST = join(process.cwd(), "web/dist");
const HAS_WEB = IS_PROD && existsSync(WEB_DIST);

const paymentConfig = loadPaymentConfig();
paymentStore.init();

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "X-Payment", "X-PAYMENT", "mcp-session-id", "Last-Event-ID", "mcp-protocol-version"],
    exposeHeaders: ["X-Payment-Response", "X-PAYMENT-RESPONSE", "mcp-session-id", "mcp-protocol-version"],
  }),
);

function publicRequestOrigin(reqUrl: string, header: (name: string) => string | undefined): string {
  const url = new URL(reqUrl);
  const proto = header("x-forwarded-proto")?.split(",")[0]?.trim() || url.protocol.replace(":", "");
  const host = header("x-forwarded-host")?.split(",")[0]?.trim() || header("host") || url.host;
  return `${proto}://${host}`;
}

function serveDiscoveryManifest(c: Context) {
  const origin = publicRequestOrigin(c.req.url, (name) => c.req.header(name));
  return c.json(buildMppManifest(paymentConfig, origin), 200, {
    "Cache-Control": "public, max-age=300",
  });
}

function apiRootJson() {
  return {
    name: "avala",
    description:
      "Pay-per-call validation of IBANs, tax IDs and bank accounts for Spain, Colombia and Argentina.",
    countries: SUPPORTED_COUNTRIES,
    paid: paymentConfig.enabled,
    pricePerCall: paymentConfig.enabled ? paymentConfig.priceDisplay : "free (dev mode)",
    endpoints: TOOLS.map((t) => ({
      method: "POST",
      path: `/v1/${t.name.replace(/_/g, "-")}`,
      description: t.description,
    })),
    mcp: {
      transport: "streamable-http",
      path: MCP_HTTP_PATH,
      payment: paymentConfig.enabled ? "tempo-tip20 on tools/call" : "free (dev mode)",
    },
  };
}

// --- Free metadata endpoints (used for discovery / Tempo directory listing) ---

app.get("/", (c) => {
  const accept = c.req.header("accept") ?? "";
  const wantsHtml = accept.includes("text/html") && !accept.includes("application/json");
  if (HAS_WEB && wantsHtml) {
    const html = readFileSync(join(WEB_DIST, "index.html"), "utf8");
    return c.html(html);
  }
  return c.json(apiRootJson());
});

app.get("/healthz", (c) => c.json({ ok: true, payments: paymentConfig.enabled ? "paid" : "free" }));

app.get("/payments/status", (c) => c.json(buildPaymentStatus(paymentConfig)));

app.get("/stats", (c) => c.json(paymentStore.getStats(paymentConfig.enabled)));

app.get("/dashboard", (c) => c.html(dashboardHtml()));

app.get("/services.json", (c) =>
  c.json({
    name: "avala",
    version: "0.1.0",
    pricing: buildPaymentDiscovery(paymentConfig),
    tools: TOOLS.map((t) => ({
      name: t.name,
      title: t.title,
      description: t.description,
      endpoint: `/v1/${t.name.replace(/_/g, "-")}`,
    })),
    mcp: {
      transport: "streamable-http",
      url: MCP_HTTP_PATH,
      tools: TOOLS.map((t) => t.name),
    },
  }),
);

// MPP discovery manifest (OpenAPI 3.1) — required by MPPScan at /openapi.json.
app.get("/openapi.json", serveDiscoveryManifest);
app.get("/.well-known/mpp.json", serveDiscoveryManifest);

// --- Payment gating (tempo-tip20) ---

registerRestPaymentGating(app, paymentConfig);
registerMcpHttpRoute(app, paymentConfig);

// --- Paid validation endpoints ---

function registerToolRoute(toolName: string): void {
  const tool = getTool(toolName);
  if (!tool) return;
  const path = `/v1/${toolName.replace(/_/g, "-")}`;
  const schema = z.object(tool.shape);

  app.post(path, async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "invalid_json", message: "Request body must be JSON." }, 400);
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        { error: "invalid_input", issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })) },
        422,
      );
    }

    const result = tool.handler(parsed.data as Record<string, unknown>);
    return c.json(result);
  });
}

for (const tool of TOOLS) {
  registerToolRoute(tool.name);
}

// --- Static web UI (production monolith) ---

if (HAS_WEB) {
  app.use("/assets/*", serveStatic({ root: "./web/dist" }));
  app.get("/favicon.svg", serveStatic({ root: "./web/dist" }));

  app.get("*", async (c, next) => {
    if (c.req.method !== "GET") return next();
    const pathname = new URL(c.req.url).pathname;
    if (
      pathname.startsWith("/v1") ||
      pathname.startsWith("/mcp") ||
      pathname.startsWith("/.well-known/") ||
      pathname === "/openapi.json" ||
      pathname === "/healthz" ||
      pathname === "/payments/status" ||
      pathname === "/stats" ||
      pathname === "/dashboard" ||
      pathname === "/services.json"
    ) {
      return next();
    }
    return serveStatic({ path: "./web/dist/index.html" })(c, next);
  });

  console.log("[avala] Serving web UI from web/dist");
}

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`[avala] Listening on http://localhost:${info.port}`);
});

export { app };
