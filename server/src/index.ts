import { createServer } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getWidgetMetadata } from "./config/csp.js";

const PORT = Number(process.env.PORT ?? 8000);
const MCP_PATH = "/mcp";
const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);

// Create GameBox MCP server
function createGameBoxServer() {
  const server = new McpServer({
    name: "gamebox",
    version: "0.1.0",
  });

  // Register a simple test widget resource
  server.registerResource(
    "game-menu",
    "ui://widget/game-menu.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/game-menu.html",
          mimeType: "text/html+skybridge",
          text: `<div id="root">
            <h1>GameBox</h1>
            <p>The Ultimate ChatGPT Game Collection</p>
          </div>`,
          _meta: getWidgetMetadata(),
        },
      ],
    })
  );

  // Register a simple test tool
  server.registerTool(
    "show_game_menu",
    {
      title: "Show Game Menu",
      description: "Display the GameBox game selection menu",
      inputSchema: {},
      _meta: {
        "openai/outputTemplate": "ui://widget/game-menu.html",
        "openai/toolInvocation/invoking": "Loading GameBox menu",
        "openai/toolInvocation/invoked": "GameBox menu ready",
      },
    },
    async () => ({
      content: [
        {
          type: "text",
          text: "Welcome to GameBox! 🎮",
        },
      ],
      structuredContent: {
        games: [
          { id: "word-challenge", name: "Word Challenge" },
          { id: "20-questions", name: "20 Questions" },
          { id: "connections", name: "Connections" },
          { id: "spelling-bee", name: "Spelling Bee" },
          { id: "trivia", name: "Trivia Challenge" },
        ],
      },
    })
  );

  return server;
}

// Create HTTP server
const httpServer = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400).end("Missing URL");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  // Handle CORS preflight
  if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
      "Access-Control-Allow-Headers": "content-type, mcp-session-id",
      "Access-Control-Expose-Headers": "Mcp-Session-Id",
    });
    res.end();
    return;
  }

  // Health check endpoint
  if (req.method === "GET" && url.pathname === "/") {
    res
      .writeHead(200, { "content-type": "text/plain" })
      .end("GameBox MCP Server");
    return;
  }

  // Handle MCP requests
  if (url.pathname === MCP_PATH && req.method && MCP_METHODS.has(req.method)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

    const server = createGameBoxServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode
      enableJsonResponse: true,
    });

    // Clean up on connection close
    res.on("close", () => {
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.writeHead(500).end("Internal server error");
      }
    }
    return;
  }

  res.writeHead(404).end("Not Found");
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`GameBox MCP server listening on http://localhost:${PORT}${MCP_PATH}`);
});
