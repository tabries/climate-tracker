import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectRedis } from './config/redis'
import weatherRoutes from './routes/weatherRoutes'
import geocodeRoutes from './routes/geocodeRoutes'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 5000

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' }))
app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.get('/api', (_req, res) => {
  res.json({ message: 'Climate Tracker API', version: '0.1.0' })
})
app.use('/api/weather', weatherRoutes)
app.use('/api/geocode', geocodeRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

connectRedis()

export default app
