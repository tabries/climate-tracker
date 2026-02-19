import { Router } from 'express'
import { geocode } from '../services/geocodeService'

const router = Router()

/**
 * GET /api/geocode?query=Paris
 * Returns a list of matching locations with coordinates.
 */
router.get('/', async (req, res, next) => {
  try {
    const query = req.query.query as string
    const results = await geocode(query)
    res.json(results)
  } catch (err) {
    next(err)
  }
})

export default router
