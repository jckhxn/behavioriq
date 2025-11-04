import { NextRequest, NextResponse } from "next/server";
import { initializeMCPServer } from "@/lib/chatgpt/mcp/server";

/**
 * POST /api/chatgpt/mcp
 * Main MCP endpoint for ChatGPT Apps SDK
 * Handles JSON-RPC 2.0 requests from ChatGPT for tool invocation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Initialize MCP server
    const server = initializeMCPServer({
      name: "BehaviorIQ ChatGPT App",
      version: "1.0.0",
    });

    // Parse JSON-RPC 2.0 request
    const { jsonrpc, id, method, params } = body;

    if (jsonrpc !== "2.0") {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32600,
            message: "Invalid Request: jsonrpc must be 2.0",
          },
        },
        { status: 400 }
      );
    }

    // Route to appropriate handler based on method
    let result: any;

    switch (method) {
      case "tools/list":
        // Return list of available tools
        const toolsResponse = await server.request(
          { method: "tools/list" } as any,
          null as any
        );
        result = toolsResponse;
        break;

      case "tools/call":
        // Execute a tool
        const toolResponse = await server.request(
          {
            method: "tools/call",
            params,
          } as any,
          null as any
        );
        result = toolResponse;
        break;

      case "resources/read":
        // Read a resource (widget HTML)
        const resourceResponse = await server.request(
          {
            method: "resources/read",
            params,
          } as any,
          null as any
        );
        result = resourceResponse;
        break;

      default:
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32601,
              message: `Method not found: ${method}`,
            },
          },
          { status: 400 }
        );
    }

    // Return JSON-RPC 2.0 response
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal error",
          data: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chatgpt/mcp
 * Returns server info and capabilities
 */
export async function GET() {
  return NextResponse.json({
    name: "BehaviorIQ ChatGPT App",
    version: "1.0.0",
    description:
      "AI-powered behavioral assessment for children ages 3-18. Get instant insights from parent/educator feedback.",
    capabilities: {
      tools: {
        start_trial: "Anonymous 15-question assessment preview",
        start_full_assessment: "Full 75-question behavioral assessment",
        view_results: "View detailed assessment results and recommendations",
      },
      authentication: "OAuth 2.1 with PKCE for full assessments",
    },
  });
}
