# 🧠 ContextCapsule

> **Turn long AI conversations into compact, structured context — so you can continue working without starting from scratch.**

ContextCapsule is a **Next.js application** that converts conversations into structured summaries containing the most important information needed to continue a project.

### ✨ What it captures

- 🎯 **Goals** — What you're trying to achieve
- 🧠 **Key Decisions** — Important choices made during the conversation
- 📈 **Progress** — What has already been completed
- 🚧 **Blockers** — Problems or things preventing progress
- ➡️ **Next Steps** — What should be done next

The idea is simple: **save the important context once and carry it into your next AI session.**

---

## 🤖 AI Support

ContextCapsule supports both **Local AI** and **Cloud AI**.

### 💻 Local AI

The app supports local AI using **Ollama**, allowing you to run the AI locally.

**Default model:**

```text
qwen3.5:9b
```

Make sure Ollama is installed and the required model is available locally before using the Local AI option.

### ☁️ Cloud AI

Cloud AI currently supports:

- ✨ **Google Gemini**
- ⚡ **Groq**

---

## 🔐 Cloud AI Setup

Create a local environment file named `.env.local` in the project root:

```bash
GEMINI_API_KEY=
GROQ_API_KEY=
```

> ⚠️ **Never commit real API keys to Git.**  
> `.env.local` is ignored by Git.

### ✨ Google Gemini

1. Create a Gemini API key in **Google AI Studio**.
2. Add the key to `GEMINI_API_KEY` in `.env.local`.
3. Open the app.
4. Select **Cloud AI → Google Gemini**.
5. Choose a supported model.

### ⚡ Groq

1. Generate a Groq API key.
2. Add the key to `GROQ_API_KEY` in `.env.local`.
3. Open the app.
4. Select **Cloud AI → Groq**.
5. Choose a supported model.

---

## 🧩 Model Selection

ContextCapsule uses a **centralized provider/model configuration** for Cloud AI.

This makes it easier to:

- ➕ Add new models
- 🔄 Update existing models
- ⚙️ Manage providers from one place

without changing provider logic throughout the application.

---

## 🚀 Getting Started

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Start the development server

```bash
npm run dev
```

### 3️⃣ Open the application

Visit:

**http://localhost:3000**

---

## 🔒 Security

ContextCapsule is designed to keep API credentials secure.

- 🔐 API keys are stored only in **server-side environment variables**.
- 🚫 API keys are **not sent to the browser**.
- 📝 API keys are **not logged by the application**.
- 🛡️ `.env.local` is ignored by Git.
- ❌ Never commit real API keys to source control.

---

## 🛠️ Tech Stack

- ⚛️ **Next.js**
- 📘 **TypeScript**
- 🤖 **Ollama**
- ✨ **Google Gemini**
- ⚡ **Groq**
- ▲ **Vercel**

---

## 🌱 Project Goal

ContextCapsule was built to solve a simple problem:

> **What happens when an AI conversation becomes too long, reaches a usage limit, or you need to continue the project in a new session?**

Instead of explaining everything again, ContextCapsule creates a **compact context capsule** that preserves the important parts of the conversation.

### 💡 The goal

**Less repetition. More continuity. Better AI-assisted development.**

---

## 📌 Project Status

🚧 **Actively developing**

The project is being improved with a focus on:

- Better context extraction
- More AI model support
- Improved summaries
- Better user experience
- Easier context transfer between AI sessions

---

⭐ If you find the project interesting, consider **starring the repository** and following the project as it evolves.
