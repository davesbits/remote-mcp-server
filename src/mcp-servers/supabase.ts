import { z } from "zod";
import { ToolResult, ToolDefinition } from "./types";

// Supabase configuration to be set later
let SUPABASE_URL = "";
let SUPABASE_API_KEY = "";

// Define schemas for Supabase tools
const QueryTableSchema = z.object({
  table: z.string().min(1, "Table name must not be empty"),
  select: z.string().default("*"),
  limit: z.number().int().min(1).max(1000).optional(),
  order: z.string().optional(),
  filter: z.string().optional()
});

const InsertRowsSchema = z.object({
  table: z.string().min(1, "Table name must not be empty"),
  rows: z.array(z.record(z.any())).min(1, "At least one row must be provided")
});

const UpdateRowsSchema = z.object({
  table: z.string().min(1, "Table name must not be empty"),
  updates: z.record(z.any()),
  filter: z.string().min(1, "Filter condition must be provided")
});

const DeleteRowsSchema = z.object({
  table: z.string().min(1, "Table name must not be empty"),
  filter: z.string().min(1, "Filter condition must be provided")
});

const ExecuteStoredProcedureSchema = z.object({
  function: z.string().min(1, "Function name must not be empty"),
  params: z.record(z.any()).optional()
});

/**
 * Create and return Supabase tools
 */
export function createSupabaseTools(): Record<string, ToolDefinition> {
  // Update Supabase configuration from environment if available
  if (typeof self !== 'undefined') {
    const env = self as any;
    if ('SUPABASE_PROJECT_REF' in env && 'SUPABASE_SERVICE_ROLE_KEY' in env) {
      SUPABASE_URL = `https://${env.SUPABASE_PROJECT_REF}.supabase.co`;
      SUPABASE_API_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
    } else {
      console.warn("Supabase environment variables are not set; Supabase tools will not function properly");
    }
  }

  return {
    "supabase_query_table": {
      description: "Query a table in Supabase database",
      inputSchema: QueryTableSchema,
      handler: async (args) => {
        try {
          let url = `${SUPABASE_URL}/rest/v1/${args.table}?select=${args.select}`;
          
          if (args.limit) url += `&limit=${args.limit}`;
          if (args.order) url += `&order=${args.order}`;
          if (args.filter) url += `&${args.filter}`;
          
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "apikey": SUPABASE_API_KEY,
              "Authorization": `Bearer ${SUPABASE_API_KEY}`,
              "Content-Type": "application/json"
            }
          });
          
          if (!response.ok) {
            throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
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
                text: `Error in supabase_query_table: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    },
    
    "supabase_insert_rows": {
      description: "Insert rows into a Supabase table",
      inputSchema: InsertRowsSchema,
      handler: async (args) => {
        try {
          const url = `${SUPABASE_URL}/rest/v1/${args.table}`;
          
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "apikey": SUPABASE_API_KEY,
              "Authorization": `Bearer ${SUPABASE_API_KEY}`,
              "Content-Type": "application/json",
              "Prefer": "return=representation"
            },
            body: JSON.stringify(args.rows)
          });
          
          if (!response.ok) {
            throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
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
                text: `Error in supabase_insert_rows: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    },
    
    "supabase_update_rows": {
      description: "Update rows in a Supabase table",
      inputSchema: UpdateRowsSchema,
      handler: async (args) => {
        try {
          const url = `${SUPABASE_URL}/rest/v1/${args.table}?${args.filter}`;
          
          const response = await fetch(url, {
            method: "PATCH",
            headers: {
              "apikey": SUPABASE_API_KEY,
              "Authorization": `Bearer ${SUPABASE_API_KEY}`,
              "Content-Type": "application/json",
              "Prefer": "return=representation"
            },
            body: JSON.stringify(args.updates)
          });
          
          if (!response.ok) {
            throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
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
                text: `Error in supabase_update_rows: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    },
    
    "supabase_delete_rows": {
      description: "Delete rows from a Supabase table",
      inputSchema: DeleteRowsSchema,
      handler: async (args) => {
        try {
          const url = `${SUPABASE_URL}/rest/v1/${args.table}?${args.filter}`;
          
          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              "apikey": SUPABASE_API_KEY,
              "Authorization": `Bearer ${SUPABASE_API_KEY}`,
              "Content-Type": "application/json",
              "Prefer": "return=representation"
            }
          });
          
          if (!response.ok) {
            throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
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
                text: `Error in supabase_delete_rows: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    },
    
    "supabase_execute_function": {
      description: "Execute a stored procedure in Supabase database",
      inputSchema: ExecuteStoredProcedureSchema,
      handler: async (args) => {
        try {
          const url = `${SUPABASE_URL}/rest/v1/rpc/${args.function}`;
          
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "apikey": SUPABASE_API_KEY,
              "Authorization": `Bearer ${SUPABASE_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: args.params ? JSON.stringify(args.params) : undefined
          });
          
          if (!response.ok) {
            throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
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
                text: `Error in supabase_execute_function: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    }
  };
}
