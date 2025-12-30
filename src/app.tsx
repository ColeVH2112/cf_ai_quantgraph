import {
	PaperPlaneTiltIcon,
	RobotIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/avatar/Avatar";
import { Button } from "@/components/button/Button";
import { Card } from "@/components/card/Card";
import { Textarea } from "@/components/textarea/Textarea";

export default function Chat() {
	const [messages, setMessages] = useState<{ role: string; content: string }[]>(
		[],
	);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;

		const userMsg = input;
		const newHistory = [...messages, { role: "user", content: userMsg }];
		setMessages(newHistory);
		setInput("");
		setLoading(true);

		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt: userMsg }),
			});

			const data = (await res.json()) as any;
			setMessages([...newHistory, { role: "ai", content: data.response }]);
		} catch (err: unknown) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			setMessages([
				...newHistory,
				{ role: "ai", content: `Error: ${errorMsg}` },
			]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex h-screen w-full justify-center bg-neutral-950 text-neutral-100 overflow-hidden">
			<div className="flex w-full max-w-3xl flex-col border-x border-neutral-800 bg-neutral-900 shadow-2xl h-full">
				<div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900 z-10">
					<h2 className="font-semibold text-lg tracking-tight">
						QuantGraph V3
					</h2>
					<Button
						variant="ghost"
						size="md"
						onClick={() => setMessages([])}
						className="hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
					>
						<TrashIcon size={20} />
					</Button>
				</div>

				<div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
					{messages.length === 0 && (
						<div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
							<div className="p-4 bg-neutral-800 rounded-full">
								<RobotIcon size={48} />
							</div>
							<div>
								<p className="font-medium">System Online</p>
								<p className="text-sm">Connected to QuantGraph Memory</p>
							</div>
						</div>
					)}

					{messages.map((m, i) => (
						<div
							key={i}
							className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
							>
								{m.role !== "user" && (
									<div className="mt-1 shrink-0">
										<Avatar username="AI" />
									</div>
								)}

								<Card
									className={`px-4 py-3 shadow-md border-0 text-sm md:text-base leading-relaxed ${
										m.role === "user"
											? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
											: "bg-neutral-800 text-neutral-200 rounded-2xl rounded-tl-sm"
									}`}
								>
									<p className="whitespace-pre-wrap">{m.content}</p>
								</Card>
							</div>
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>

				<div className="border-t border-neutral-800 bg-neutral-900 p-4 sm:p-6">
					<form
						onSubmit={handleSubmit}
						className="relative flex items-end gap-2 bg-neutral-950 rounded-xl border border-neutral-800 focus-within:border-neutral-600 transition-colors p-2 shadow-sm"
					>
						<Textarea
							placeholder="Ask about market precedents..."
							className="w-full bg-transparent border-none text-white focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-2"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
							}}
							rows={1}
						/>
						<button
							type="submit"
							disabled={loading || !input.trim()}
							className="mb-1 p-2 bg-blue-600 rounded-lg hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
						>
							<PaperPlaneTiltIcon size={20} weight="fill" />
						</button>
					</form>
					<div className="text-center mt-2">
						<p className="text-xs text-neutral-500">
							AI can make mistakes. Check important info.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
