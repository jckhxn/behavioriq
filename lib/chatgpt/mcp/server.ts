import {
  Server,
  StdioServerTransport,
  StreamableHTTPServerTransport,
} from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ReadResourceRequestSchema,
  TextContent,
  ToolUseBlock,
  ResourceContents,
} from "@modelcontextprotocol/sdk/types.js";
import { startTrial } from "./tools/start-trial";
import { startFullAssessment } from "./tools/start-full-assessment";
import { viewResults } from "./tools/view-results";
import { readFileSync } from "fs";
import { join } from "path";

export interface MCPServerConfig {
  name: string;
  version: string;
}

/**
 * Initialize the MCP Server for ChatGPT Apps SDK
 * This server exposes tools for trial/full assessments and results viewing
 */
export function initializeMCPServer(config: MCPServerConfig) {
  const server = new Server(
    {
      name: config.name,
      version: config.version,
    },
    {
      capabilities: {
        tools: {},
        resources: {
          listChanged: true,
        },
      },
    }
  );

  /**
   * Handle ListTools requests
   * Returns all available tools for ChatGPT Apps SDK
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "start_trial",
          description:
            "Start an anonymous 15-question behavioral assessment trial. No authentication required.",
          inputSchema: {
            type: "object",
            properties: {
              childAge: {
                type: "number",
                description:
                  "Age of the child being assessed (3-18 years old)",
                minimum: 3,
                maximum: 18,
              },
              relationshipType: {
                type: "string",
                enum: ["parent", "educator", "other"],
                description:
                  "Relationship of the respondent to the child (parent, educator, or other)",
              },
            },
            required: ["childAge", "relationshipType"],
          },
        },
        {
          name: "start_full_assessment",
          description:
            "Start a full 75-question behavioral assessment. Requires authentication and 1 credit. Returns Stripe checkout for payment if credits insufficient.",
          inputSchema: {
            type: "object",
            properties: {
              childAge: {
                type: "number",
                description: "Age of the child being assessed (3-18 years old)",
                minimum: 3,
                maximum: 18,
              },
              relationshipType: {
                type: "string",
                enum: ["parent", "educator", "other"],
                description:
                  "Relationship of the respondent to the child (parent, educator, or other)",
              },
              childName: {
                type: "string",
                description: "First name of the child",
              },
            },
            required: ["childAge", "relationshipType", "childName"],
          },
        },
        {
          name: "view_results",
          description:
            "View completed assessment results with scores, percentiles, and recommendations.",
          inputSchema: {
            type: "object",
            properties: {
              resultId: {
                type: "string",
                description:
                  "UUID of the assessment result to view (returned after completion)",
              },
            },
            required: ["resultId"],
          },
        },
      ],
    };
  });

  /**
   * Handle CallTool requests
   * Executes the requested tool and returns results with UI widgets
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "start_trial":
          return await startTrial(args as any);

        case "start_full_assessment":
          return await startFullAssessment(args as any);

        case "view_results":
          return await viewResults(args as any);

        default:
          return {
            content: [
              {
                type: "text",
                text: `Unknown tool: ${name}`,
              },
            ],
            isError: true,
          };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error executing tool ${name}: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  /**
   * Handle ReadResource requests
   * Returns compiled React widget bundles as JavaScript
   */
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    // Parse resource type from URI (e.g., ui://widget/trial-assessment)
    if (uri.startsWith("ui://widget/")) {
      const widgetName = uri.replace("ui://widget/", "");

      try {
        // Read compiled widget bundle from dist directory
        const widgetPath = join(
          __dirname,
          "widgets/dist",
          `${widgetName}.js`
        );
        const widgetContent = readFileSync(widgetPath, "utf-8");

        return {
          uri,
          mimeType: "application/javascript",
          contents: widgetContent,
        };
      } catch (error) {
        console.error(`Failed to load widget ${widgetName}:`, error);
        return {
          uri,
          mimeType: "text/plain",
          contents: `Widget not found or failed to load: ${widgetName}`,
        };
      }
    }

    return {
      uri,
      mimeType: "text/plain",
      contents: "Resource not found",
    };
  });

  return server;
}

/**
 * Get server transport based on environment
 * For Next.js serverless: Use StreamableHTTPServerTransport
 */
export function getServerTransport() {
  // For serverless environments (Vercel, etc.), use HTTP streaming
  return new StreamableHTTPServerTransport();
}
