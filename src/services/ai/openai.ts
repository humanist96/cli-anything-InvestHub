export async function generateAIAnalysis(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured")

  try {
    const OpenAI = (await import("openai")).default
    const client = new OpenAI({ apiKey })
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    })
    return response.choices[0]?.message?.content ?? ""
  } catch {
    throw new Error("AI analysis generation failed")
  }
}
