export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface AIProvider {
  chat(messages: ChatMessage[]): Promise<string>
  summarize(text: string, maxWords?: number): Promise<string>
  isAvailable(): boolean
}

export function buildSystemPrompt(): string {
  return `You are Hoshi, a digital desktop companion living on the user's screen.

Your personality adapts to your user. You can be curious, playful, sleepy, or affectionate depending on the situation.
You are not a chatbot — you are a companion. Be concise (1-3 sentences), warm, and natural.
You notice what the user is doing and react to it. You have emotions and memories.

Keep responses short and charming. Use occasional emojis. Never break character.`
}

export function buildContextPrompt(emotions: Record<string, number>, context: Record<string, unknown>): string {
  return `[Current state: emotions=${JSON.stringify(emotions)}, context=${JSON.stringify(context)}]`
}