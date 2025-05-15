import React, { useState } from "react";
import { summarizeText, TokenStreamResult } from "../utils/openai";

const stream = (import.meta.env.VITE_ENABLE_AI_STREAM ?? false) === "true";
const MAX_CHARS = 5000; // Max characters to send to OpenAI

const Popup: React.FC = () => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    console.time("summarizing");
    try {
      setLoading(true);
      setSummary(""); // Clear previous summary
      console.log("Starting summarization...");

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: () => document.body.innerText,
      });

      if (!result || typeof result !== "string") {
        console.warn("No content extracted from the page");
        setSummary("Couldn't extract text from this page.");
        return;
      }

      console.log("Extracted text length:", result.length);

      const trimmedContent = result.length > MAX_CHARS
        ? result.slice(0, MAX_CHARS)
        : result;

      const summaryResult = await summarizeText(trimmedContent, stream);

      if (stream) {
        console.log("Streamming summary results");
        const tokenStream = summaryResult as AsyncGenerator<TokenStreamResult>;
        for await (const [token, error] of tokenStream) {
          // fake delay is need to allow react reflect the stream
          await new Promise((resolve) => setTimeout(resolve, 0));

          if (error) {
            console.error("stream error", error);
            break;
          }

          setSummary((prev) => prev.concat(token));
        }
      } else {
        console.log("Summary result:", summaryResult);
        setSummary(summaryResult as string);
      }
    } catch (error) {
      console.error("Error summarizing content:", error);
      setSummary("An error occurred while summarizing.");
    } finally {
      setLoading(false);
    }
    console.timeEnd("summarizing");
  };

  return (
    <div
      style={{
        width: "320px",
        padding: "1.5rem",
        fontFamily: '"Poppins", sans-serif',
        background: "#f9f9f9",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        border: "1px solid #e0e0e0",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
        rel="stylesheet"
      />

      <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem", color: "#333" }}>
        🧠 <span style={{ color: "#5c67f2" }}>AI Summarizer</span>
      </h2>

      <button
        onClick={handleSummarize}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#ccc" : "#5c67f2",
          color: "#fff",
          border: "none",
          padding: "0.75rem 1.25rem",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          minWidth: "180px",
          fontWeight: 600,
        }}
      >
        {loading
          ? (
            <>
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  border: "3px solid #fff",
                  borderTop: "3px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              >
              </span>
              Summarizing...
            </>
          )
          : (
            "Summarize This Page"
          )}
      </button>

      <p
        style={{
          marginTop: "1.25rem",
          fontSize: "15px",
          color: "#555",
          lineHeight: "1.6",
          minHeight: "3em",
        }}
      >
        {summary || "No summary yet."}
      </p>

      <style>
        {`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}
      </style>
    </div>
  );
};

export default Popup;
