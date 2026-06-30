import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

/**
 * Provider-agnostic AI model resolver.
 *
 * Works with any OpenAI-compatible chat-completions endpoint — OpenAI, Groq,
 * OpenRouter, Together, DeepSeek, Mistral, xAI, or a local server (Ollama,
 * LM Studio, vLLM). Configure three env vars in .env.local:
 *
 *   AI_BASE_URL   e.g. https://api.openai.com/v1
 *                      https://openrouter.ai/api/v1
 *                      http://localhost:11434/v1   (Ollama)
 *   AI_API_KEY    your provider key (any non-empty string for local servers)
 *   AI_MODEL      e.g. gpt-4o-mini, openai/gpt-4o, llama3.1, deepseek-chat
 */

const baseURL = process.env.AI_BASE_URL;
const apiKey = process.env.AI_API_KEY;
const modelId = process.env.AI_MODEL;

export function aiConfigured(): boolean {
  return Boolean(baseURL && apiKey && modelId);
}

export function aiConfigError(): string {
  return "AI not configured. Set AI_BASE_URL, AI_API_KEY, and AI_MODEL in .env.local";
}

export function getModel(): LanguageModel {
  if (!aiConfigured()) {
    throw new Error(aiConfigError());
  }
  const provider = createOpenAI({
    baseURL: baseURL!,
    apiKey: apiKey!,
  });
  return provider(modelId!);
}

// self-check: aiConfigured() must be false when any var is missing
if (process.env.NODE_ENV === "test") {
  console.assert(
    Boolean(baseURL && apiKey && modelId) === aiConfigured(),
    "aiConfigured() out of sync with env vars",
  );
}
