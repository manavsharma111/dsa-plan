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

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  MONGODB_URI: process.env.MONGODB_URI || '',
  FRONTEND_URI: process.env.FRONTEND_URI || 'http://localhost:5173',
  CLIENT_ORIGIN: process.env.FRONTEND_URI || process.env.CLIENT_ORIGIN || '*',
}

// Validation check
if (!ENV.MONGODB_URI) {
  console.warn(
    '[Config Warning] MONGODB_URI is not set. Database connections will fail until configured in .env'
  )
}
