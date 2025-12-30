# QuantGraph AI: Causal Market Analysis Agent

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)

**QuantGraph** is a full-stack AI financial analyst built on the Cloudflare Edge. It uses **Retrieval Augmented Generation (RAG)** to "remember" historical market events and identify causal precedents for current financial news.

Unlike generic chatbots, QuantGraph uses a vector database to ground its answers in historical data, adopting a professional "Quantitative Analyst" persona.

## 🚀 Live Demo
**[Insert Your V3 Link Here]**

## 🏗️ Architecture
This project is a **Full-Stack TypeScript** application deployed entirely on serverless infrastructure.

* **Frontend:** React + Vite (TypeScript)
    * Custom Flexbox layout for responsive chat UI.
    * Direct API integration (bypassing heavy SDKs for performance).
* **Backend:** Cloudflare Workers (TypeScript)
    * Handles API requests and AI orchestration.
* **AI Inference:** Llama 3 (via Cloudflare Workers AI)
    * Runs `@cf/meta/llama-3-8b-instruct` on the edge.
* **Memory (RAG):** Cloudflare Vectorize
    * Stores embeddings of historical market events to provide context to the AI.

## ✨ Key Features
* **Causal Reasoning:** The AI looks up past events (e.g., "Rate Hikes") to predict future outcomes based on seeded data.
* **Edge Latency:** Runs globally on Cloudflare's network, eliminating cold starts common in standard containers.
* **"Safe Mode" Protocol:** Uses a custom-built, robust JSON protocol to ensure message delivery even in unstable network conditions.
* **Responsive UI:** A clean, dark-mode interface designed to mimic professional trading terminals.

## 🛠️ Getting Started

### Prerequisites
* Node.js & npm
* Cloudflare Wrangler CLI (`npm install -g wrangler`)

### Installation
```bash
# 1. Clone the repository
git clone [YOUR_REPO_URL]

# 2. Install dependencies
npm install
