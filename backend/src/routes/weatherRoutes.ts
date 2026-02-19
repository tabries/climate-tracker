import { Router } from 'express'
import { getWeather } from '../services/weatherService'

const router = Router()

/**
 * GET /api/weather/:lat/:lon
 * Returns current weather + 5-day forecast for a coordinate pair.
 */
router.get('/:lat/:lon', async (req, res, next) => {
  try {
    const lat = parseFloat(req.params.lat)
    const lon = parseFloat(req.params.lon)
    const data = await getWeather(lat, lon)
    res.json(data)
  } catch (err) {
    next(err)
  }
})

export default router
