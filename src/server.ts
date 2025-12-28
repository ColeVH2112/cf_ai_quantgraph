import { routeAgentRequest } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import { tool, createUIMessageStreamResponse, streamText, convertToModelMessages } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

// Define the model to use (OpenAI for chat flow)
// Note: You need an OpenAI API key in your .dev.vars for this part to work fully,
// but for the assignment logic, we rely on Cloudflare AI inside the tools.
const model = openai("gpt-4o");

/**
 * 1. The Default Chat Agent
 * (Kept from the starter template so the UI works immediately)
 */
export class Chat extends AIChatAgent<Env> {
  async onChatMessage(onFinish: any) {
    const result = streamText({
      system: `You are a helpful assistant.`,
      messages: await convertToModelMessages(this.messages),
      model,
      onFinish,
    });
    return createUIMessageStreamResponse({ stream: result.toUIMessageStream() });
  }
}

/**
 * 2. YOUR NEW AGENT: QuantGraph
 * (This is the class Cloudflare was looking for)
 */
export class QuantAgent extends AIChatAgent<Env> {
  // Define the System Prompt
  protected getSystemPrompt() {
    return `
    You are QuantGraph, an elite autonomous market analyst.
    Your goal is NOT to predict price, but to identify CAUSAL PRECEDENTS.
    
    When a user asks about a stock or crypto:
    1. Search your memory for historical events (using the 'lookup_history' tool).
    2. Synthesize a recommendation based on data, not vibes.
    
    Style: Professional, concise, "old money" aesthetic.
    `;
  }

  async onChatMessage(onFinish: any) {
    // Define Tools
    const agentTools = {
      lookup_history: tool({
        description: "Finds historical market events similar to the current situation.",
        parameters: z.object({
          query: z.string().describe("The news event to cross-reference"),
        }),
        execute: async ({ query }) => {
          // A. Embedding (Using Cloudflare AI)
          const embedding = await this.env.AI.run('@cf/baai/bge-base-en-v1.5', {
            text: [query],
          });

          // B. Vector Search (Using Vectorize)
          const matches = await this.env.MARKET_MEMORY.query(embedding.data[0], {
            topK: 3,
            returnMetadata: true,
          });

          // C. Format
          return matches.matches.map(m => 
            `Event: ${m.metadata?.event} | Outcome: ${m.metadata?.outcome}`
          ).join("\n");
        },
      }),
    };

    // Run the Chat
    const result = streamText({
      system: this.getSystemPrompt(),
      messages: await convertToModelMessages(this.messages),
      model: model,
      tools: agentTools,
      onFinish,
    });

    return createUIMessageStreamResponse({
      stream: result.toUIMessageStream()
    });
  }
}

/**
 * 3. The Router
 * (Handles incoming HTTP requests)
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;