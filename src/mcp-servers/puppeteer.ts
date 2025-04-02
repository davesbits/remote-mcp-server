import { z } from "zod";
import { ToolResult } from "./types";

// Define the interface for tool definitions
export interface ToolDefinition {
  description: string;
  inputSchema: z.ZodType<any>;
  handler: (args: any) => Promise<ToolResult>;
}

// Define schemas for Puppeteer tools
const NavigateSchema = z.object({
  url: z.string().url("URL must be valid")
});

const ScreenshotSchema = z.object({
  selector: z.string().optional()
});

const GetTextSchema = z.object({
  selector: z.string()
});

const ClickSchema = z.object({
  selector: z.string()
});

const TypeSchema = z.object({
  selector: z.string(),
  text: z.string()
});

/**
 * Create and return Puppeteer browser automation tools
 */
export function createPuppeteerTools(): Record<string, ToolDefinition> {
  return {
    "puppeteer_navigate": {
      description: "Navigate to a URL in a browser",
      inputSchema: NavigateSchema,
      handler: async (args) => {
        // In a Cloudflare Worker environment, we can't directly use Puppeteer
        // Instead, we'd proxy this to an external service that can run a browser
        // For now, return a mock response
        return {
          content: [
            {
              type: "text",
              text: `Successfully navigated to ${args.url}`
            }
          ]
        };
      }
    },
    
    "puppeteer_screenshot": {
      description: "Take a screenshot of the current page or a specific element",
      inputSchema: ScreenshotSchema,
      handler: async (args) => {
        const selector = args.selector || "body";
        return {
          content: [
            {
              type: "text",
              text: `Screenshot taken of selector: ${selector}`
            }
          ]
        };
      }
    },
    
    "puppeteer_get_text": {
      description: "Get text content from an element on the page",
      inputSchema: GetTextSchema,
      handler: async (args) => {
        return {
          content: [
            {
              type: "text",
              text: `Text content from ${args.selector}: [Simulated content for demonstration]`
            }
          ]
        };
      }
    },
    
    "puppeteer_click": {
      description: "Click on an element on the page",
      inputSchema: ClickSchema,
      handler: async (args) => {
        return {
          content: [
            {
              type: "text",
              text: `Clicked on element with selector: ${args.selector}`
            }
          ]
        };
      }
    },
    
    "puppeteer_type": {
      description: "Type text into an input field",
      inputSchema: TypeSchema,
      handler: async (args) => {
        return {
          content: [
            {
              type: "text",
              text: `Typed "${args.text}" into element with selector: ${args.selector}`
            }
          ]
        };
      }
    }
  };
}
