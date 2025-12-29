import { routeAgentRequest } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";

// These classes must exist for the Worker to start, even if unused.
export class Chat extends AIChatAgent<Env> {
  async onChatMessage(onFinish: any) { return null; }
}
export class QuantAgent extends AIChatAgent<Env> {
  async onChatMessage(onFinish: any) { return null; }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // --- 1. SIMPLE API ENDPOINT (The Fix) ---
    // We listen for "/api/chat". No Agent library involvement.
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        // Parse the incoming JSON from the frontend
        const body = await request.json() as any;
        const userPrompt = body.prompt;

        // Run Llama 3 (Simple Mode)
        const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
            messages: [
              { role: "system", content: "You are QuantGraph. Concise and professional." },
              { role: "user", content: userPrompt }
            ],
            stream: false
        });

        // Return the text in a simple JSON object
        // Cloudflare AI returns: { response: "The text" }
        return new Response(JSON.stringify(response), {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" // Allow browser access
          }
        });

      } catch (err: any) {
        return new Response(JSON.stringify({ response: "Error: " + err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    // Banner Fix
    if (url.pathname.includes("check") || url.pathname.includes("key")) {
       return new Response(JSON.stringify({ hasKey: true }), {
         headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
       });
    }

    // Fallback to assets
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
