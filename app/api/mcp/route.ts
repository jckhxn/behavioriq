import { NextRequest, NextResponse } from "next/server";

/**
 * MCP (Model Context Protocol) Server Implementation for ChatGPT App Integration
 *
 * This endpoint implements the MCP protocol to enable ChatGPT to:
 * 1. Start trial assessments (anonymous)
 * 2. Start full assessments (authenticated)
 * 3. View assessment results
 *
 * All tools return widget URIs that ChatGPT renders as iframes
 */

// MCP Tool Definitions
const MCP_TOOLS = [
  {
    name: "start_trial",
    description: "Start a free trial behavioral assessment to identify potential concerns. This assessment is anonymous and takes 5-10 minutes to complete. Perfect for getting a quick screening.",
    inputSchema: {
      type: "object",
      properties: {
        anonymous: {
          type: "boolean",
          description: "Whether to run in anonymous mode (default: true)",
          default: true,
        },
        region: {
          type: "string",
          description: "User's region for localization (optional)",
        },
      },
    },
  },
  {
    name: "start_full_assessment",
    description: "Start a comprehensive behavioral assessment with detailed analysis and recommendations. Requires authentication. Takes 20-30 minutes to complete. Provides in-depth insights across multiple behavioral domains.",
    inputSchema: {
      type: "object",
      properties: {
        templateId: {
          type: "string",
          description: "Assessment template ID to use (optional, defaults to standard comprehensive template)",
        },
        subjectName: {
          type: "string",
          description: "Name of the person being assessed (e.g., 'Alex', 'my child')",
        },
      },
      required: ["subjectName"],
    },
  },
  {
    name: "view_results",
    description: "View results from a completed assessment. Shows domain scores, risk levels, and personalized recommendations.",
    inputSchema: {
      type: "object",
      properties: {
        assessmentId: {
          type: "string",
          description: "The ID of the assessment to view results for",
        },
      },
      required: ["assessmentId"],
    },
  },
];

// MCP Resource Definitions
const MCP_RESOURCES = [
  {
    uri: "widget://trial",
    name: "Trial Assessment Widget",
    description: "Interactive trial assessment interface",
    mimeType: "text/html+skybridge",
  },
  {
    uri: "widget://assessment",
    name: "Full Assessment Widget",
    description: "Comprehensive assessment interface with authentication",
    mimeType: "text/html+skybridge",
  },
  {
    uri: "widget://results",
    name: "Results Widget",
    description: "Assessment results visualization and insights",
    mimeType: "text/html+skybridge",
  },
];

/**
 * Handle MCP protocol requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params } = body;

    console.log("[MCP] Received request:", { method, params });

    // Route to appropriate MCP method handler
    switch (method) {
      case "tools/list":
        return handleToolsList();
      case "tools/call":
        return handleToolsCall(params);
      case "resources/list":
        return handleResourcesList();
      default:
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            error: {
              code: -32601,
              message: `Method not found: ${method}`,
            },
          },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error("[MCP] Error processing request:", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
          data: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Handle tools/list - Return available tools
 */
function handleToolsList() {
  return NextResponse.json({
    jsonrpc: "2.0",
    result: {
      tools: MCP_TOOLS,
    },
  });
}

/**
 * Handle resources/list - Return available resources
 */
function handleResourcesList() {
  return NextResponse.json({
    jsonrpc: "2.0",
    result: {
      resources: MCP_RESOURCES,
    },
  });
}

/**
 * Handle tools/call - Execute a tool
 */
async function handleToolsCall(params: any) {
  const { name, arguments: args } = params;

  console.log("[MCP] Executing tool:", { name, args });

  try {
    switch (name) {
      case "start_trial":
        return await executeStartTrial(args);
      case "start_full_assessment":
        return await executeStartFullAssessment(args);
      case "view_results":
        return await executeViewResults(args);
      default:
        return NextResponse.json({
          jsonrpc: "2.0",
          error: {
            code: -32602,
            message: `Unknown tool: ${name}`,
          },
        });
    }
  } catch (error) {
    console.error(`[MCP] Error executing tool ${name}:`, error);
    return NextResponse.json({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`,
      },
    });
  }
}

/**
 * Execute start_trial tool
 * Calls existing POST /api/trial/start and returns widget URI
 */
async function executeStartTrial(args: any) {
  const { anonymous = true, region } = args;

  // Call existing trial start API
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/trial/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      anonymous,
      region,
      utm: {
        source: "chatgpt",
        medium: "app",
        campaign: "chatgpt_trial",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Trial start failed: ${response.statusText}`);
  }

  const data = await response.json();
  const { sessionId } = data;

  // Construct widget URI
  const widgetUrl = `${baseUrl}/chatgpt/trial?sessionId=${sessionId}`;

  // Return MCP response with OpenAI metadata
  return NextResponse.json({
    jsonrpc: "2.0",
    result: {
      content: [
        {
          type: "text",
          text: "Starting your free trial assessment. This will take about 5-10 minutes. Answer honestly about what you observe - there are no right or wrong answers.",
          annotations: {
            "openai/toolInvocation/invoking": "Setting up your trial assessment...",
            "openai/toolInvocation/invoked": "Trial assessment ready! You can start now in the widget below.",
          },
        },
        {
          type: "resource",
          resource: {
            uri: `widget://trial?sessionId=${sessionId}`,
            text: widgetUrl,
            mimeType: "text/html+skybridge",
          },
          annotations: {
            "openai/outputTemplate": widgetUrl,
            "openai/resultCanProduceWidget": true,
            "openai/widgetAccessible": false,
          },
        },
      ],
      metadata: {
        sessionId,
        toolName: "start_trial",
        widgetType: "trial",
      },
    },
  });
}

/**
 * Execute start_full_assessment tool
 * Creates assessment session and returns widget URI
 * If not authenticated, returns auth prompt widget
 */
async function executeStartFullAssessment(args: any) {
  const { templateId, subjectName } = args;

  if (!subjectName) {
    throw new Error("subjectName is required");
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Create ChatGPT session (which will check auth internally)
  const response = await fetch(`${baseUrl}/api/chatgpt/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionType: "assessment",
      templateId,
      subjectName,
      source: "chatgpt",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Check if it's an auth error
    if (response.status === 401 || errorData.requiresAuth) {
      // Return auth prompt widget
      const authWidgetUrl = `${baseUrl}/chatgpt/auth?returnTo=assessment&subjectName=${encodeURIComponent(subjectName)}&templateId=${templateId || ""}`;

      return NextResponse.json({
        jsonrpc: "2.0",
        result: {
          content: [
            {
              type: "text",
              text: "To start a comprehensive assessment, I'll need you to sign in. I'll send you a magic link - just click it to continue. No password needed!",
              annotations: {
                "openai/toolInvocation/invoking": "Checking authentication...",
                "openai/toolInvocation/invoked": "Please sign in to continue",
              },
            },
            {
              type: "resource",
              resource: {
                uri: `widget://auth?returnTo=assessment`,
                text: authWidgetUrl,
                mimeType: "text/html+skybridge",
              },
              annotations: {
                "openai/outputTemplate": authWidgetUrl,
                "openai/resultCanProduceWidget": true,
                "openai/widgetAccessible": false,
              },
            },
          ],
          metadata: {
            requiresAuth: true,
            toolName: "start_full_assessment",
          },
        },
      });
    }

    throw new Error(`Failed to start assessment: ${response.statusText}`);
  }

  const data = await response.json();
  const { sessionId, assessmentId } = data;

  // Construct widget URI for assessment
  const widgetUrl = `${baseUrl}/chatgpt/assessment/${assessmentId}?sessionId=${sessionId}`;

  return NextResponse.json({
    jsonrpc: "2.0",
    result: {
      content: [
        {
          type: "text",
          text: `Great! Starting comprehensive assessment for ${subjectName}. This assessment will take 20-30 minutes and cover multiple behavioral domains. You can pause and resume anytime.`,
          annotations: {
            "openai/toolInvocation/invoking": "Creating your comprehensive assessment...",
            "openai/toolInvocation/invoked": `Assessment for ${subjectName} is ready! Let's begin.`,
          },
        },
        {
          type: "resource",
          resource: {
            uri: `widget://assessment?assessmentId=${assessmentId}`,
            text: widgetUrl,
            mimeType: "text/html+skybridge",
          },
          annotations: {
            "openai/outputTemplate": widgetUrl,
            "openai/resultCanProduceWidget": true,
            "openai/widgetAccessible": false,
          },
        },
      ],
      metadata: {
        sessionId,
        assessmentId,
        subjectName,
        toolName: "start_full_assessment",
        widgetType: "assessment",
      },
    },
  });
}

/**
 * Execute view_results tool
 * Fetches results and returns widget URI
 */
async function executeViewResults(args: any) {
  const { assessmentId } = args;

  if (!assessmentId) {
    throw new Error("assessmentId is required");
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Verify assessment exists and get basic info
  const response = await fetch(`${baseUrl}/api/assessment/${assessmentId}/results`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Assessment not found");
    }
    throw new Error(`Failed to fetch results: ${response.statusText}`);
  }

  const results = await response.json();

  // Check if assessment is complete
  if (!results.isComplete) {
    return NextResponse.json({
      jsonrpc: "2.0",
      result: {
        content: [
          {
            type: "text",
            text: "This assessment is not yet complete. Continue the assessment to view results.",
          },
        ],
        metadata: {
          assessmentId,
          isComplete: false,
        },
      },
    });
  }

  // Construct widget URI for results
  const widgetUrl = `${baseUrl}/chatgpt/results/${assessmentId}`;

  // Generate summary text from results
  const topDomains = results.domains
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 3)
    .map((d: any) => `${d.name}: ${d.score}%`)
    .join(", ");

  return NextResponse.json({
    jsonrpc: "2.0",
    result: {
      content: [
        {
          type: "text",
          text: `Assessment complete! Here are the results. Top areas: ${topDomains}. View the full report below for detailed insights and recommendations.`,
          annotations: {
            "openai/toolInvocation/invoking": "Loading assessment results...",
            "openai/toolInvocation/invoked": "Results are ready to view!",
          },
        },
        {
          type: "resource",
          resource: {
            uri: `widget://results?assessmentId=${assessmentId}`,
            text: widgetUrl,
            mimeType: "text/html+skybridge",
          },
          annotations: {
            "openai/outputTemplate": widgetUrl,
            "openai/resultCanProduceWidget": true,
            "openai/widgetAccessible": false,
          },
        },
      ],
      metadata: {
        assessmentId,
        toolName: "view_results",
        widgetType: "results",
        domains: results.domains,
        flags: results.flags,
      },
    },
  });
}

/**
 * Handle OPTIONS for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://chat.openai.com, https://chatgpt.com",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
