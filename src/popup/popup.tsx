import React, { useState } from 'react'
import { summarizeText } from '../utils/openai'

const Popup: React.FC = () => {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const MAX_CHARS = 5000 // Max characters to send to OpenAI

  const handleSummarize = async () => {
    try {
      setLoading(true)
      setSummary("") // Clear previous summary
      console.log("Starting summarization...")

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: () => document.body.innerText
      })

      if (!result || typeof result !== "string") {
        console.warn("No content extracted from the page")
        setSummary("Couldn't extract text from this page.")
        return
      }

      console.log("Extracted text length:", result.length)

      const trimmedContent = result.length > MAX_CHARS 
        ? result.slice(0, MAX_CHARS) : result

      const summary = await summarizeText(trimmedContent)
      console.log("Summary result:", summary)
      setSummary(summary)
    } catch (error) {
      console.error("Error summarizing content:", error)
      setSummary("An error occurred while summarizing.")
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '300px', padding: '1rem', fontFamily: 'Arial' }}>
      <h2>🧠 AI Summarizer</h2>
      <button onClick={handleSummarize} disabled={loading}>
        {loading ? 'Summarizing...' : 'Summarize This Page'}
      </button>
      <p style={{ marginTop: '1rem', fontSize: '14px' }}>
        {summary || 'No summary yet.'}
      </p>
    </div>
  )
}

export default Popup