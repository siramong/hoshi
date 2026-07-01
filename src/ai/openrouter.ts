import { type AIProvider, type ChatMessage, buildSystemPrompt } from "./provider"

const BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

interface OpenRouterConfig {
  apiKey: string
  model: string
}

export class OpenRouterProvider implements AIProvider {
  private config: OpenRouterConfig | null = null

  constructor(apiKey?: string, model = "mistralai/mistral-7b-instruct") {
    if (apiKey) {
      this.config = { apiKey, model }
    }
  }

  configure(apiKey: string, model?: string): void {
    this.config = { apiKey, model: model ?? this.config?.model ?? "mistralai/mistral-7b-instruct" }
  }

  isAvailable(): boolean {
    return this.config !== null && this.config.apiKey.length > 0
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    if (!this.isAvailable() || !this.config) {
      throw new Error("OpenRouter not configured")
    }

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
        "HTTP-Referer": "https://hoshi.app",
        "X-Title": "Hoshi Companion",
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          ...messages,
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OpenRouter API error (${res.status}): ${err}`)
    }

    const data = await res.json()
    return (data.choices?.[0]?.message?.content ?? "").trim()
  }

  async summarize(text: string, maxWords = 50): Promise<string> {
    if (!this.isAvailable() || !this.config) {
      return text.length > 200 ? text.slice(0, 200) + "..." : text
    }

    const res = await this.chat([
      {
        role: "user",
        content: `Summarize this in at most ${maxWords} words, keeping key details:\n\n${text}`,
      },
    ])

    return res || (text.length > 200 ? text.slice(0, 200) + "..." : text)
  }
}