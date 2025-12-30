#AI Prompts

**Tools:** Google gemini 3.0 Pro; Cursor (Claude Sonnet 4.5 thinking)

### Prompts:

## 1. Hey Gemini, for my Cloudflare application i have an optional project to build an Ai-powered application on CloudFlare that includes: LLm(recommend using Llama 3.3 on Workers AI), Workflow/Coordination (recommend using Workflows, Workers, or Durable Objects), User input via chat or voice (recommend using Pages or Realtime), memory or state. I was planning on doing a project for financial analysis: it would utilize CloudFlare workers as well as llm to store historical events and their impacs on financial markets in order to enerate insights to the outcomes of current/present rim eevents. My general idea was to store events in memory and then embed queries in order to compare them with llama 3.3 and generate useful insights. At full scale it would utilize a web-scraping extension to generate all the historcial insights but i dont know if i will have the time to fully implement that part. I am buiding through emacs, could you help me initialize the project using the Cloudflare base and workers and then outline the steps for moving forward and navigating this environment?
**Initialization and Architecture:** Established the architectural constraits and environment through Emacs

## 2. Could you help check my server.ts file for typos; i added the chat and QuantAgent agents in order to fulfill the tasks required by my project
**Review:** Unit testing and logic verification for agents

## 3. Could you please help reconfigure the wrangler.jsonc in order to set up the frontend
**Configuration:** configure build pipeline

## 4. I can not get the 'OpenAi Key Not Configured' banner to disappear, i do not have an OpenAi API to use and was hoping to do this project for free, can you help me debug and remove the banner
**Constraint debugging:** maintain self-contained project in the Cloudflare ecosystem

## 5. I am having issues where the chat is not sending messages properly. Can we bypass the agent library
**Refactoring:** remove abstractions in favor of direct RAG system in server.ts

## 6. How do I properly connect the llama 3.3 model to the Cloudflare Vectorize such that it will properly seed and the past market events
**RAG implementation:**implementing core vector imbedding/ retrieval

## 7. Could you help me generate a general README.md file for this project thatis professional and accruately outlines the inner workings of the project as well as my intended future directions.
**Bookkeeping:** general bookkeeping acceleration

## 8. Hey Cursor; I have implemented this project and bot in order to fulfill an optional cloudflare project. It is supposed to store a database of historical events and their impact on financial markets in order to provide context-aware insights for current events. i am having a lot of linting errors from the GitHub biome that keeps my repository from passing the sanity check; could you help me fix those without damaging the structure of my code and project?
**Configuration:** general pipeline constraint configuration for Biome v2 in order to ensure good repo state.