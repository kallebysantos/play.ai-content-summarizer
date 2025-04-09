const apiKey = import.meta.env.VITE_OPENAI_API_KEY

export async function summarizeText(text: string): Promise<string> {
  const prompt = `Summarize the following content in a few sentences:\n\n`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text }
        ],
        temperature: 0.5
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI error response:", errorText)
      return "Failed to get summary from OpenAI"
    }

    const data = await response.json()

    const summary = data?.choices?.[0]?.message?.content
    if (!summary) {
      console.warn("OpenAI responded without a summary:", data)
      return "No summary received from OpenAI"
    }

    return summary.trim()
  } catch (error) {
    console.error('Error fetching summary:', error)
    return 'Error while contacting OpenAI.'    
  }
}