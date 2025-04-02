import { z } from "zod";
import { ToolResult, ToolDefinition } from "./types";

// Default headers for Brave Search API requests with API key to be set later
const apiHeaders = {
  "Accept": "application/json",
  "Content-Type": "application/json",
  "X-Subscription-Token": "" // Will be set from environment variables
};

// Base URL for Brave Search API
const BRAVE_SEARCH_API = "https://api.search.brave.com/res/v1";

// Define schemas for Brave Search tools
const WebSearchSchema = z.object({
  query: z.string().min(1, "Search query must not be empty"),
  count: z.number().int().min(1).max(20).optional(),
  country: z.string().length(2).optional(),
  language: z.string().optional(),
  safesearch: z.enum(["strict", "moderate", "off"]).optional()
});

const NewsSearchSchema = z.object({
  query: z.string().min(1, "Search query must not be empty"),
  count: z.number().int().min(1).max(20).optional(),
  freshness: z.enum(["day", "week", "month", "any"]).optional()
});

const ImageSearchSchema = z.object({
  query: z.string().min(1, "Search query must not be empty"),
  count: z.number().int().min(1).max(20).optional(),
  safesearch: z.enum(["strict", "moderate", "off"]).optional()
});

/**
 * Create and return Brave Search tools
 */
export function createBraveSearchTools(): Record<string, ToolDefinition> {
  // Update headers with API key from environment if available
  if (typeof self !== 'undefined' && 'BRAVE_API_KEY' in self) {
    apiHeaders["X-Subscription-Token"] = (self as any).BRAVE_API_KEY;
  }
  
  return {
    "brave_web_search": {
      description: "Search the web using Brave Search",
      inputSchema: WebSearchSchema,
      handler: async (args) => {
        try {
          const searchParams = new URLSearchParams({
            q: args.query,
            count: args.count?.toString() || "10"
          });
          
          if (args.country) searchParams.append("country", args.country);
          if (args.language) searchParams.append("language", args.language);
          if (args.safesearch) searchParams.append("safesearch", args.safesearch);
          
          const url = `${BRAVE_SEARCH_API}/web/search?${searchParams.toString()}`;
          
          // In Cloudflare Workers, we can use the fetch API directly
          const response = await fetch(url, {
            method: "GET",
            headers: apiHeaders
          });
          
          if (!response.ok) {
            throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Format the response
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error in brave_web_search: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    },
    
    "brave_news_search": {
      description: "Search for news articles using Brave Search",
      inputSchema: NewsSearchSchema,
      handler: async (args) => {
        try {
          const searchParams = new URLSearchParams({
            q: args.query,
            count: args.count?.toString() || "10",
            search_type: "news"
          });
          
          if (args.freshness) searchParams.append("freshness", args.freshness);
          
          const url = `${BRAVE_SEARCH_API}/news/search?${searchParams.toString()}`;
          
          const response = await fetch(url, {
            method: "GET",
            headers: apiHeaders
          });
          
          if (!response.ok) {
            throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error in brave_news_search: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    },
    
    "brave_image_search": {
      description: "Search for images using Brave Search",
      inputSchema: ImageSearchSchema,
      handler: async (args) => {
        try {
          const searchParams = new URLSearchParams({
            q: args.query,
            count: args.count?.toString() || "10",
            search_type: "images"
          });
          
          if (args.safesearch) searchParams.append("safesearch", args.safesearch);
          
          const url = `${BRAVE_SEARCH_API}/images/search?${searchParams.toString()}`;
          
          const response = await fetch(url, {
            method: "GET",
            headers: apiHeaders
          });
          
          if (!response.ok) {
            throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error in brave_image_search: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    }
  };
}
