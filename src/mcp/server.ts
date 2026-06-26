import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TOOLS } from "../tools/definitions.js";

/** Build an MCP server instance with all Avala validation tools registered. */
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "avala",
    version: "0.1.0",
  });

  for (const tool of TOOLS) {
    server.tool(
      tool.name,
      tool.description,
      tool.shape,
      async (args: Record<string, unknown>) => {
        const result = tool.handler(args);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    );
  }

  return server;
}
