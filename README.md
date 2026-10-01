This is a Next.js project for generating compact ContextCapsule summaries from conversations.

## Local AI

The app keeps the existing Local AI flow intact. It uses the local Ollama setup and the default qwen3.5:9b model.

## Cloud AI setup

Create a local environment file named .env.local in the project root and add the required keys:

```bash
GEMINI_API_KEY=
GROQ_API_KEY=
```

Do not commit real API keys. The file is ignored by git.

### Gemini

1. Create a Gemini API key in Google AI Studio.
2. Add the value to GEMINI_API_KEY in .env.local.
3. In the app, choose Cloud AI → Google Gemini and select a model.

### Groq

1. Generate a Groq API key.
2. Add the value to GROQ_API_KEY in .env.local.
3. In the app, choose Cloud AI → Groq and select a supported Groq model.

## Model selection

The app includes a central provider/model configuration in the cloud provider config so models can be updated in one place.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000 to use the app.

## Security

- API keys are stored only in server-side environment variables.
- No API keys are sent to the browser.
- No API keys are logged or committed to source control.
