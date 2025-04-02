import { z } from "zod";

// Define the ToolResult interface if @modelcontextprotocol/sdk can't be imported
export interface ToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

// Define the interface for tool definitions
export interface ToolDefinition {
  description: string;
  inputSchema: z.ZodType<any>;
  handler: (args: any) => Promise<ToolResult>;
}
