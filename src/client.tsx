import { createRoot } from "react-dom/client";
import { Providers } from "@/providers";
import App from "./app";
import "./styles.css";

const container = document.getElementById("app");

if (container) {
	const root = createRoot(container);
	root.render(
		<Providers>
			<div className="bg-neutral-50 text-base text-neutral-900 antialiased transition-colors selection:bg-blue-700 selection:text-white dark:bg-neutral-950 dark:text-neutral-100">
				<App />
			</div>
		</Providers>,
	);
}
