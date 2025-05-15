import { parseJSONOverEventStream } from "./stream/json_parser.ts";

const apiHost = import.meta.env.VITE_OPENAI_API_HOST ??
  "https://api.openai.com";
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const aiModel = import.meta.env.VITE_AI_MODEL ?? "gpt-3.5-turbo";

export type TokenStreamResult = [string, undefined] | [undefined, Error];

export async function summarizeText(
  text: string,
  stream: boolean = false,
): Promise<string | AsyncGenerator<TokenStreamResult>> {
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
        stream,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: text },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      console.error("OpenAI error response:", errorText);
      return "Failed to get summary from OpenAI";
    }

    if (stream) {
      const timeoutMs = 60 * 1000; // 60s
      const timeoutSignal = AbortSignal.timeout(timeoutMs);
      const messageStream = parseJSONOverEventStream(
        response.body,
        timeoutSignal,
      );

      const tokenStream = async function* () {
        for await (const event of messageStream) {
          if ("done" in event && event.done) {
            return;
          }

          if ("error" in event) {
            const error = (event.error instanceof Error)
              ? event.error
              : new Error(event.error as string);

            yield [undefined, error];
          }

          // @ts-ignore preguiça de por types
          const choice = event.choices.at(0);

          // @ts-ignore preguiça de por types
          const value = choice?.message?.content ?? choice?.delta?.content ??
            undefined;

          yield [value, undefined];

          // @ts-ignore preguiça de por types
          const finishReason = choice?.finish_reason;
          if (finishReason && finishReason !== "stop") {
            yield [undefined, new Error("Expected a completed response.")];
          }
        }

        throw new Error("Did not receive done or success response in stream.");
      };

      return tokenStream() as AsyncGenerator<TokenStreamResult>;
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
