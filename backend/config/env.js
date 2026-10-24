import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from backend directory first, fallback to root if needed
dotenv.config({ path: path.resolve(__dirname, '../.env') })
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') })
}

const rawOrigins = process.env.CLIENT_ORIGIN || process.env.FRONTEND_URI || '*'
const parsedOrigins = rawOrigins.includes(',')
  ? rawOrigins.split(',').map((o) => o.trim())
  : rawOrigins

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  MONGODB_URI: process.env.MONGODB_URI || '',
  FRONTEND_URI: process.env.FRONTEND_URI || 'http://localhost:5173',
  CLIENT_ORIGIN: parsedOrigins,
  PRODUCTION_FRONTEND_URL:
    process.env.PRODUCTION_FRONTEND_URL || 'https://dsa-plan-sigma.vercel.app',
  PRODUCTION_BACKEND_URL:
    process.env.PRODUCTION_BACKEND_URL || 'https://dsa-plan-backend.onrender.com',
  AI_MODEL: process.env.AI_MODEL || 'GEMINI',
  OLLAMA_URL: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  OPENAI_API: process.env.OPENAI_API || '',
  GROK_API_KEY: process.env.GROK_API_KEY || '',
  CUSTOM_MODEL_URL: process.env.CUSTOM_MODEL_URL || '',
}

// Validation check
if (!ENV.MONGODB_URI) {
  console.warn(
    '[Config Warning] MONGODB_URI is not set. Database connections will fail until configured in .env'
  )
}
