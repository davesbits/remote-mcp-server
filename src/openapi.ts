import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Common response schema for MCP tools
export const McpResponseSchema = z.object({
  content: z.array(
    z.object({
      type: z.literal("text"),
      text: z.string().describe("The response content as text")
    })
  )
});

/**
 * Creates an OpenAPI registry with predefined common components
 */
export function createOpenApiRegistry(): OpenAPIRegistry {
  const registry = new OpenAPIRegistry();
  
  // Register common components
  registry.register(
    "McpResponse",
    McpResponseSchema
  );
  
  return registry;
}

/**
 * Generates an OpenAPI document from the registry
 */
export function generateOpenApiDocument(registry: OpenAPIRegistry) {
  return registry.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "MCP API Documentation",
      version: "1.0.0",
      description: "OpenAPI documentation for Model Context Protocol tools"
    },
    servers: [
      {
        url: "/api"
      }
    ],
    tags: [
      {
        name: "MCP Tools",
        description: "Tools available through the Model Context Protocol"
      }
    ]
  });
}

/**
 * Registers an MCP tool in the OpenAPI registry
 */
export function registerMcpTool(
  registry: OpenAPIRegistry,
  name: string,
  description: string,
  inputSchema: z.ZodType<any, any>,
  outputSchema: z.ZodType<any, any> = McpResponseSchema
) {
  registry.registerPath({
    method: "post",
    path: `/${name}`,
    summary: description,
    tags: ["MCP Tools"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: inputSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: outputSchema
          }
        }
      }
    }
  });
}