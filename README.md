# 🧠 Chrome Article Summarizer

A minimal Chrome Extension built with React, TypeScript, and Vite that uses OpenAI's GPT API to summarize article content on the current page. This is the simple version — simple, fast, and focused.

![image](https://github.com/user-attachments/assets/6e5fce02-3d01-40a7-a873-e528bd76c339)
![image](https://github.com/user-attachments/assets/2addcc71-e0f2-496e-82d5-dd1de153cb8b)
![image](https://github.com/user-attachments/assets/fed50a31-4f34-4a5a-99fe-472559b7dd60)


---

## 🚀 Features

- 🧩 Chrome Extension popup interface
- 🔗 Automatically grabs the current page content
- 🤖 Summarizes using OpenAI's GPT-3.5 API
- ⚡️ Fast build with Vite + TypeScript + React
- 🧪 Local development support with `.env` config

---

## 🛠 Tech Stack

- React + TypeScript
- Vite
- Chrome Extension (Manifest v3)
- OpenAI API (GPT-3.5 Turbo)

---

## 📦 Installation

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
```

---

## 🔐 Setup API Key

Create a .env file in the root:

```env
VITE_OPENAI_API_KEY=your_openai_key_here
```
Make sure this file is in your .gitignore and is **never committed**.

## 🧪 Run in Development

```bash
npm run dev
```

---

## 🛠 Build for Chrome

```bash
npm run build
```

## 🧠 How It Works

- The content script scrapes the article text from the current tab
- The popup sends that text to the OpenAI API
- GPT-3.5 returns a short summary
- The summary is shown inside the extension popup

---

## 🤝 Contributing

This project is public for educational purposes. <br />
Feel free to fork and play around — PRs are accepted.
