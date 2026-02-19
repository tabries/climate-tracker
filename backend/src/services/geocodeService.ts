import axios from 'axios'
import type { GeocodeResult, GeocodeResponse } from '../types/geocode'

const MAPTILER_BASE = 'https://api.maptiler.com/geocoding/v1'

export async function geocode(query: string): Promise<GeocodeResult[]> {
  const apiKey = process.env.MAPTILER_API_KEY
  if (!apiKey) throw new Error('MAPTILER_API_KEY is not set')

  const url = `${MAPTILER_BASE}/${encodeURIComponent(query)}.json`

  const res = await axios.get<GeocodeResponse>(url, {
    params: {
      key: apiKey,
      limit: 5,
      types: 'place,district,region,country',
    },
  })

  return res.data.features.map((f) => {
    const country = f.context?.find((c) => c.id.startsWith('country'))?.text ?? ''
    return {
      lat: f.center[1],
      lon: f.center[0],
      name: f.text,
      country,
      full_name: f.place_name,
    }
  })
}
