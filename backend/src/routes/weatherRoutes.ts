import { Router } from 'express'
import { getWeather } from '../services/weatherService'
import { validate } from '../middleware/validate'
import { weatherParamsSchema } from '../schemas/weatherSchema'

const router = Router()

/**
 * GET /api/weather/:lat/:lon
 * Returns current weather + 5-day forecast for a coordinate pair.
 */
router.get('/:lat/:lon', validate(weatherParamsSchema, 'params'), async (req, res, next) => {
  try {
    const { lat, lon } = req.params as unknown as { lat: number; lon: number }
    const data = await getWeather(lat, lon)
    res.json(data)
  } catch (err) {
    next(err)
  }
})

export default router
