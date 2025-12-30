import type { ToolCallOptions } from "ai";

export const tools = {
  // Add your tool definitions here if needed
};

export type ToolContext = {
  executions: Record<
    string,
    (args: any, context: ToolCallOptions) => Promise<unknown>
  >;
};
