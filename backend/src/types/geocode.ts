export interface GeocodeResult {
  lat: number
  lon: number
  name: string
  country: string
  full_name: string
}

/** Raw shape from Mapbox Geocoding API */
export interface MapboxGeocodeFeature {
  id: string
  place_name: string
  center: [number, number] // [lon, lat]
  text: string
  context?: { id: string; text: string }[]
}

export interface MapboxGeocodeResponse {
  features: MapboxGeocodeFeature[]
}
