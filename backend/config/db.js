const mongoose = require('mongoose')
const dns = require('dns')

// Safe DNS fallback for Windows / ISP SRV lookup
try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {
  // Ignore if restricted in sandbox/container
}

let isConnecting = false

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (isConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (mongoose.connection.readyState === 1) return mongoose.connection
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.warn('[Config Warning] MONGODB_URI is not set.')
  }

  try {
    isConnecting = true
    const conn = await mongoose.connect(uri || '', {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    })
    isConnecting = false
    console.log('MongoDB connected successfully')

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB Error]', err.message)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from database.')
    })

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Reconnected to database.')
    })

    return conn
  } catch (error) {
    isConnecting = false
    console.error('MongoDB connection error:', error.message)
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
    throw error
  }
}

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
    console.log('[MongoDB] Disconnected gracefully.')
  }
}

const isDbConnected = () => {
  return mongoose.connection.readyState === 1
}

connectDB.connectDB = connectDB
connectDB.disconnectDB = disconnectDB
connectDB.isDbConnected = isDbConnected

module.exports = connectDB
module.exports.connectDB = connectDB
module.exports.disconnectDB = disconnectDB
module.exports.isDbConnected = isDbConnected
