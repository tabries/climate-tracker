import axios from 'axios'
import type { GeocodeResult, MapboxGeocodeResponse } from '../types/geocode'

const MAPBOX_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places'

export async function geocode(query: string): Promise<GeocodeResult[]> {
  const token = process.env.MAPBOX_ACCESS_TOKEN
  if (!token) throw new Error('MAPBOX_ACCESS_TOKEN is not set')

  const url = `${MAPBOX_BASE}/${encodeURIComponent(query)}.json`

  const res = await axios.get<MapboxGeocodeResponse>(url, {
    params: {
      access_token: token,
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
