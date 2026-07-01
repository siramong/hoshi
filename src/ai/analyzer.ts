import type { EmotionState, SystemContext } from "../types"
import type { OpenRouterProvider } from "./openrouter"

interface AnalysisResult {
  adjustments: Partial<EmotionState>
  commentary: string | null
}

export async function analyzeContext(
  ai: OpenRouterProvider,
  windowTitle: string,
  emotions: EmotionState,
  context: SystemContext,
): Promise<AnalysisResult> {
  if (!ai.isAvailable()) {
    return { adjustments: {}, commentary: null }
  }

  const prompt = `You are Hoshi, a desktop companion observing the user's activity.

Current state:
- Active window: "${windowTitle}"
- Time: ${context.timeOfDay}
- Activity: ${context.activityLevel}
- User is ${context.isIdle ? "idle" : "active"} (for ${Math.round(context.idleDuration / 1000)}s)
- Current emotions: ${JSON.stringify(emotions)}

Respond with ONLY valid JSON (no markdown, no code fence):
{
  "emotion_adjustments": {
    "happiness": <0 to 5 or -5 to 0>,
    "curiosity": <0 to 5 or -5 to 0>,
    "energy": <0 to 5 or -5 to 0>,
    "loneliness": <0 to 5 or -5 to 0>,
    "anxiety": <0 to 5 or -5 to 0>,
    "affection": <0 to 5 or -5 to 0>,
    "boredom": <0 to 5 or -5 to 0>
  },
  "commentary": "<short 1-sentence reaction in Spanish or null>"
}

Rules:
- Only adjust emotions that make sense for the context
- If user is coding, increase curiosity + discipline
- If user is idle long, increase loneliness + boredom
- If active window suggests music/games, adjust accordingly
- Commentary max 12 words, in Spanish, natural and warm
- Commentary can be null if nothing interesting to say
- Keep adjustments small (0-5 range)`

  try {
    const response = await ai.chat([
      { role: "system", content: "You are Hoshi's context analyzer. Return ONLY valid JSON." },
      { role: "user", content: prompt },
    ])

    const parsed = JSON.parse(response)
    return {
      adjustments: parsed.emotion_adjustments ?? {},
      commentary: parsed.commentary ?? null,
    }
  } catch {
    return { adjustments: {}, commentary: null }
  }
}
