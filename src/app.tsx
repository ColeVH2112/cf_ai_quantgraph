import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/button/Button";
import { Card } from "@/components/card/Card";
import { Avatar } from "@/components/avatar/Avatar";
import { Textarea } from "@/components/textarea/Textarea";
import { PaperPlaneTiltIcon, TrashIcon, RobotIcon } from "@phosphor-icons/react";

export default function Chat() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Show User Message
    const userMsg = input;
    const newHistory = [...messages, { role: "user", content: userMsg }];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      // 2. FETCH THE NEW API ENDPOINT
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg })
      });

      // 3. Parse JSON Response
      const data = await res.json() as { response: string };
      
      // 4. Show AI Message
      setMessages([...newHistory, { role: "ai", content: data.response }]);

    } catch (err: any) {
      setMessages([...newHistory, { role: "ai", content: "Error: " + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full p-4 flex justify-center items-center bg-neutral-950 text-neutral-100">
      <div className="h-[calc(100vh-2rem)] w-full max-w-lg flex flex-col shadow-xl rounded-md border border-neutral-800 bg-neutral-900">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center gap-3">
          <div className="flex-1"><h2 className="font-semibold">QuantGraph V3 (Live)</h2></div>
          <Button variant="ghost" size="md" onClick={() => setMessages([])}>
            <TrashIcon size={20} />
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-2">
              <RobotIcon size={48} />
              <p>System Ready. Connected to Llama 3.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-2 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {m.role !== "user" && <Avatar username="AI" className="shrink-0" />}
                <Card className={`p-3 rounded-md ${m.role === "user" ? "bg-blue-600 text-white" : "bg-neutral-800"}`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </Card>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 bg-neutral-900 border-t border-neutral-800 absolute bottom-0 w-full rounded-b-md">
          <div className="relative">
            <Textarea
              placeholder="Ask about the market..."
              className="w-full bg-neutral-950 border-neutral-800 text-white pr-12"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if(e.key === "Enter" && !e.shiftKey) handleSubmit(e); }}
              rows={1}
            />
            <button type="submit" disabled={loading} className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-full hover:bg-blue-500 text-white">
              <PaperPlaneTiltIcon size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
