import { Router } from 'express'
import { geocode } from '../services/geocodeService'
import { validate } from '../middleware/validate'
import { geocodeQuerySchema } from '../schemas/geocodeSchema'

const router = Router()

/**
 * GET /api/geocode?query=Paris
 * Returns a list of matching locations with coordinates.
 */
router.get('/', validate(geocodeQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { query } = req.query as unknown as { query: string }
    const results = await geocode(query)
    res.json(results)
  } catch (err) {
    next(err)
  }
})

export default router
