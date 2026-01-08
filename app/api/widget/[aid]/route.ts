import { NextRequest, NextResponse } from "next/server";
import agentService from "@/lib/services/agent-service";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ aid: string }> }
) {
  try {
    const { aid } = await params;

    if (!aid) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }

    // Fetch agent data
    const agent = await agentService.fetchAgent(aid);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get the base widget script
    const widgetPath = join(process.cwd(), "lib", "widget", "widget.js");
    let widgetScript = readFileSync(widgetPath, "utf-8");

    // Get the base URL from the request
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Create agent-specific configuration
    const agentConfig = {
      baseUrl: baseUrl,
      agentId: agent.id,
      customization: {
        primaryColor: agent.customization.primaryColor,
        name: agent.customization.name,
        botIcon: agent.customization.botIcon,
      },
    };

    // Inject agent configuration into the script
    const configInjection = `
// Agent-specific configuration injected by server
window.MAGICALCX_AGENT_CONFIG = ${JSON.stringify(agentConfig, null, 2)};
`;

    // Insert the configuration at the very beginning of the script
    widgetScript = configInjection + widgetScript;

    // The getWidgetConfig function already handles the injected config
    // No need to modify it since we updated the function to check for window.MAGICALCX_AGENT_CONFIG

    // Set appropriate headers
    const response = new NextResponse(widgetScript, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });

    return response;
  } catch (error) {
    console.error("Error serving widget script:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
