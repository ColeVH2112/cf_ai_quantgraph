import { routeAgentRequest } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import { createUIMessageStreamResponse, convertToModelMessages } from "ai";

export class Chat extends AIChatAgent<Env> {
  async onChatMessage(onFinish: any) {
    const messages = await convertToModelMessages(this.messages);
    
    // 1. Run Llama 3 on Cloudflare
    const response = await this.env.AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [{ role: "system", content: "You are a helpful assistant." }, ...messages],
      stream: true, // We ask for a stream
    });

    // 2. Convert Llama Stream to Agent Stream
    // We manually read the Llama stream and repackage it for the frontend
    const stream = new ReadableStream({
      async start(controller) {
        const reader = (response as any).getReader();
        const decoder = new TextDecoder();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Decode the chunk
            const chunk = decoder.decode(value, { stream: true });
            
            // Cloudflare sends "data: { response: 'word' }"
            // We need to extract just the 'word'
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.includes("response")) {
                try {
                  const clean = line.replace("data: ", "").trim();
                  if (!clean) continue;
                  const json = JSON.parse(clean);
                  if (json.response) {
                    // Send it to the UI in the correct format
                    controller.enqueue({ 
                      type: "text-delta", 
                      textChunk: json.response 
                    });
                  }
                } catch(e) { /* ignore parse errors */ }
              }
            }
          }
        } catch (err) {
          console.error("Stream Error", err);
          controller.enqueue({ type: "text-delta", textChunk: " [Error generating response] " });
        }
        
        controller.enqueue({ type: "finish", finishReason: "stop" });
        controller.close();
      }
    });

    return createUIMessageStreamResponse({ stream });
  }
}

// QUANT AGENT (The Brain)
export class QuantAgent extends AIChatAgent<Env> {
  async onChatMessage(onFinish: any) {
    const messages = await convertToModelMessages(this.messages);
    const lastMessage = messages[messages.length - 1].content;
    
    // RAG Logic
    let context = "";
    if (this.env.MARKET_MEMORY) {
       try {
         const embedding = await this.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [lastMessage] });
         const matches = await this.env.MARKET_MEMORY.query(embedding.data[0], { topK: 3, returnMetadata: true });
         if (matches.matches.length > 0) {
           const facts = matches.matches.map(m => `Event: ${m.metadata?.event} | Result: ${m.metadata?.outcome}`).join("\n");
           context = `\n[HISTORY]\n${facts}\n`;
         }
       } catch (e) { console.log(e); }
    }

    const systemPrompt = `You are QuantGraph. Use the history below to advise. Concise. ${context}`;

    const response = await this.env.AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
    });

    // Stream Processor
    const stream = new ReadableStream({
      async start(controller) {
        const reader = (response as any).getReader();
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.includes("response")) {
                try {
                  const clean = line.replace("data: ", "").trim();
                  if (!clean) continue;
                  const json = JSON.parse(clean);
                  if (json.response) {
                    controller.enqueue({ type: "text-delta", textChunk: json.response });
                  }
                } catch(e) {}
              }
            }
          }
        } catch (err) {}
        controller.enqueue({ type: "finish", finishReason: "stop" });
        controller.close();
      }
    });

    return createUIMessageStreamResponse({ stream });
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // BANNER FIX
    if (url.pathname.includes("check") || url.pathname.includes("key")) {
       return new Response(JSON.stringify({ hasKey: true }), {
         headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
       });
    }

    // SEED ROUTE
    if (url.pathname === "/seed") {
       if (!env.MARKET_MEMORY) return new Response("Error: Memory Binding Missing");
       try {
          const events = [{ text: "Rate Hike", event: "Hike", outcome: "Stocks Down" }];
          const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: ["Test"] });
          await env.MARKET_MEMORY.upsert([{ id: crypto.randomUUID(), values: embedding.data[0], metadata: {event:"Test", outcome:"Pass"} }]);
          return new Response("✅ V3 Seed Route Active");
       } catch(e: any) { return new Response("Error: " + e.message); }
    }

    const agentResponse = await routeAgentRequest(request, env);
    if (agentResponse) return agentResponse;
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
