import { AIChatAgent } from "agents/ai-chat-agent";

export class Chat extends AIChatAgent<Env> {
  async onChatMessage(_onFinish: any): Promise<Response | undefined> {
    return undefined;
  }

  async executeTask(_description: string, _task: any): Promise<void> {
    // Handle scheduled task execution
  }
}

export class QuantAgent extends AIChatAgent<Env> {
  async onChatMessage(_onFinish: any): Promise<Response | undefined> {
    return undefined;
  }
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    // --- QUANTGRAPH API (Memory Enabled) ---
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = (await request.json()) as any;
        const userPrompt = body.prompt;

        // 1. MEMORY LOOKUP (RAG)
        let context = "";
        if (env.MARKET_MEMORY) {
          try {
            const embedding = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
              text: [userPrompt]
            });
            if (
              !("data" in embedding) ||
              !embedding.data ||
              embedding.data.length === 0
            ) {
              throw new Error("Invalid embedding response");
            }
            const matches = await env.MARKET_MEMORY.query(embedding.data[0], {
              topK: 3,
              returnMetadata: true
            });

            if (matches.matches.length > 0) {
              const facts = matches.matches
                .map(
                  (m) =>
                    ` • Event: ${m.metadata?.event} | Outcome: ${m.metadata?.outcome}`
                )
                .join("\n");
              context = `\n[HISTORICAL PRECEDENTS FOUND IN DATABASE]:\n${facts}\n`;
            }
          } catch (e) {
            console.log("Memory Lookup skipped: ", e);
          }
        }

        // 2. CONSTRUCT PROMPT
        const systemPrompt = `You are QuantGraph, an elite financial historian and analyst. 
        Your goal is to identify causal precedents for current market events.
        
        Use the provided Historical Precedents to answer the user's question. 
        If no precedents are found, use your general knowledge but mention that specific database records were missing.
        
        Style: Professional, concise. You are technically advanced and looking to provide a concise explanation of the signals and how we should proceed given the information we have. Clearly express what we should see numericlly and how we should adjust as well as provide a concise and clear explanation for why and how
        ${context}`;

        // 3. RUN LLAMA 3
        const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          stream: false
        });

        // 4. RETURN RESPONSE
        return new Response(JSON.stringify(response), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return new Response(
          JSON.stringify({ response: `System Error: ${errorMsg}` }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    // UTILITY ROUTES
    if (url.pathname.includes("check") || url.pathname.includes("key")) {
      return new Response(JSON.stringify({ hasKey: true }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    if (url.pathname === "/seed") {
      if (!env.MARKET_MEMORY)
        return new Response("Error: Memory Binding Missing");
      try {
        const events = [
          {
            text: "Federal Reserve hikes rates 50bps",
            event: "Rate Hike",
            outcome: "Tech stocks dropped 3%, Banks rallied"
          },
          {
            text: "SEC approves Bitcoin ETF",
            event: "Regulatory Approval",
            outcome: "Bitcoin surged 5% intraday"
          },
          {
            text: "Oil supply shock in middle east",
            event: "Geopolitical Conflict",
            outcome: "Energy sector up 6%, Airlines down 4%"
          }
        ];
        for (const item of events) {
          const embedding = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
            text: [item.text]
          });
          if (
            !("data" in embedding) ||
            !embedding.data ||
            embedding.data.length === 0
          ) {
            throw new Error("Invalid embedding response");
          }
          await env.MARKET_MEMORY.upsert([
            {
              id: crypto.randomUUID(),
              values: embedding.data[0],
              metadata: { event: item.event, outcome: item.outcome }
            }
          ]);
        }
        return new Response("✅ QuantGraph Memory Seeded with 3 Events");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return new Response(`Error: ${msg}`);
      }
    }

    // Return 404 for unmatched routes
    return new Response("Not Found", { status: 404 });
  }
} satisfies ExportedHandler<Env>;
