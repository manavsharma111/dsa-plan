import mongoose from 'mongoose'
import dns from 'dns'
import { ENV } from './env.js'

// Safe DNS fallback for Windows / ISP SRV lookup
try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {
  // Ignore if restricted in sandbox/container
}

let isConnecting = false

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (isConnecting) {
    // Wait for in-flight connection
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (mongoose.connection.readyState === 1) return mongoose.connection
  }

  const uri = ENV.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables')
  }

  try {
    isConnecting = true
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    })
    isConnecting = false
    console.log(
      `[MongoDB] Connected successfully to database: ${conn.connection.name}`
    )

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB Error]', err.message)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from database. Reconnecting...')
    })

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Reconnected to database.')
    })

    return conn
  } catch (error) {
    isConnecting = false
    console.error('[MongoDB Connection Failed]', error.message)
    throw error
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
    console.log('[MongoDB] Disconnected gracefully.')
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1
}
