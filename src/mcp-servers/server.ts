import { 
  ErrorCode, 
  McpError,
  Server as McpServer
} from "./mock-sdk";
import { createPuppeteerTools } from './puppeteer';
import { createBraveSearchTools } from './brave-search';
import { createSupabaseTools } from './supabase';

/**
 * Creates and configures the MCP server with all tools
 */
export function createMcpServer(): McpServer {
  // Create a new MCP server instance
  const server = new McpServer(
    {
      name: "cloudflare-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  // Set up error handling
  server.onerror = (error) => {
    console.error("[MCP Error]", error);
  };

  // Register all tools from different services
  setupPuppeteerTools(server);
  setupBraveSearchTools(server);
  setupSupabaseTools(server);

  return server;
}

/**
 * Set up Puppeteer browser automation tools
 */
function setupPuppeteerTools(server: McpServer) {
  try {
    const puppeteerTools = createPuppeteerTools();
    
    // Register all puppeteer tools
    for (const [name, toolDef] of Object.entries(puppeteerTools)) {
      server.registerTool(name, toolDef.description, toolDef.handler, toolDef.inputSchema);
    }
  } catch (error) {
    console.error("Failed to set up Puppeteer tools:", error);
  }
}

/**
 * Set up Brave Search tools
 */
function setupBraveSearchTools(server: McpServer) {
  try {
    const braveSearchTools = createBraveSearchTools();
    
    // Register all brave search tools
    for (const [name, toolDef] of Object.entries(braveSearchTools)) {
      server.registerTool(name, toolDef.description, toolDef.handler, toolDef.inputSchema);
    }
  } catch (error) {
    console.error("Failed to set up Brave Search tools:", error);
  }
}

/**
 * Set up Supabase tools
 */
function setupSupabaseTools(server: McpServer) {
  try {
    const supabaseTools = createSupabaseTools();
    
    // Register all supabase tools
    for (const [name, toolDef] of Object.entries(supabaseTools)) {
      server.registerTool(name, toolDef.description, toolDef.handler, toolDef.inputSchema);
    }
  } catch (error) {
    console.error("Failed to set up Supabase tools:", error);
  }
}
