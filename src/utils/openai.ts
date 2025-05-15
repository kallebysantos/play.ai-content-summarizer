const apiHost = import.meta.env.VITE_OPENAI_API_HOST ??
  "https://api.openai.com";
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const aiModel = import.meta.env.VITE_AI_MODEL ?? "gpt-3.5-turbo";

export async function summarizeText(text: string): Promise<string> {
  const prompt = `Summarize the following content in a few sentences:\n\n`;

  try {
    const response = await fetch(new URL("/v1/chat/completions", apiHost), {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: text },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error response:", errorText);
      return "Failed to get summary from OpenAI";
    }

    const data = await response.json();

    const summary = data?.choices?.[0]?.message?.content;
    if (!summary) {
      console.warn("OpenAI responded without a summary:", data);
      return "No summary received from OpenAI";
    }

    return summary.trim();
  } catch (error) {
    console.error("Error fetching summary:", error);
    return "Error while contacting OpenAI.";
  }
}
