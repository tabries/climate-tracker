/**
 * Major world cities with approximate coordinates for globe data-point demo.
 * Each entry includes a simulated temperature (°C) for color mapping.
 */
export interface CityDataPoint {
  name: string
  lat: number
  lon: number
  temp: number // °C (simulated)
}

export const WORLD_CITIES: CityDataPoint[] = [
  // ── Americas ──────────────────────────────────────────────
  { name: 'New York', lat: 40.71, lon: -74.01, temp: 12 },
  { name: 'Los Angeles', lat: 34.05, lon: -118.24, temp: 22 },
  { name: 'Chicago', lat: 41.88, lon: -87.63, temp: 8 },
  { name: 'Houston', lat: 29.76, lon: -95.37, temp: 28 },
  { name: 'Miami', lat: 25.76, lon: -80.19, temp: 30 },
  { name: 'Toronto', lat: 43.65, lon: -79.38, temp: 5 },
  { name: 'Mexico City', lat: 19.43, lon: -99.13, temp: 18 },
  { name: 'São Paulo', lat: -23.55, lon: -46.63, temp: 24 },
  { name: 'Buenos Aires', lat: -34.6, lon: -58.38, temp: 16 },
  { name: 'Lima', lat: -12.05, lon: -77.04, temp: 20 },
  { name: 'Bogotá', lat: 4.71, lon: -74.07, temp: 14 },
  { name: 'Santiago', lat: -33.45, lon: -70.67, temp: 15 },
  { name: 'Vancouver', lat: 49.28, lon: -123.12, temp: 7 },
  { name: 'Anchorage', lat: 61.22, lon: -149.9, temp: -5 },

  // ── Europe ────────────────────────────────────────────────
  { name: 'London', lat: 51.51, lon: -0.13, temp: 10 },
  { name: 'Paris', lat: 48.86, lon: 2.35, temp: 11 },
  { name: 'Berlin', lat: 52.52, lon: 13.41, temp: 8 },
  { name: 'Madrid', lat: 40.42, lon: -3.7, temp: 18 },
  { name: 'Rome', lat: 41.9, lon: 12.5, temp: 17 },
  { name: 'Moscow', lat: 55.76, lon: 37.62, temp: -2 },
  { name: 'Istanbul', lat: 41.01, lon: 28.98, temp: 13 },
  { name: 'Athens', lat: 37.98, lon: 23.73, temp: 19 },
  { name: 'Oslo', lat: 59.91, lon: 10.75, temp: 2 },
  { name: 'Stockholm', lat: 59.33, lon: 18.07, temp: 3 },
  { name: 'Reykjavik', lat: 64.15, lon: -21.94, temp: -1 },
  { name: 'Lisbon', lat: 38.72, lon: -9.14, temp: 17 },
  { name: 'Warsaw', lat: 52.23, lon: 21.01, temp: 6 },
  { name: 'Budapest', lat: 47.5, lon: 19.04, temp: 9 },

  // ── Asia ──────────────────────────────────────────────────
  { name: 'Tokyo', lat: 35.68, lon: 139.69, temp: 14 },
  { name: 'Beijing', lat: 39.9, lon: 116.41, temp: 10 },
  { name: 'Shanghai', lat: 31.23, lon: 121.47, temp: 16 },
  { name: 'Mumbai', lat: 19.08, lon: 72.88, temp: 32 },
  { name: 'Delhi', lat: 28.61, lon: 77.21, temp: 34 },
  { name: 'Bangkok', lat: 13.76, lon: 100.5, temp: 33 },
  { name: 'Singapore', lat: 1.35, lon: 103.82, temp: 31 },
  { name: 'Seoul', lat: 37.57, lon: 126.98, temp: 11 },
  { name: 'Dubai', lat: 25.2, lon: 55.27, temp: 38 },
  { name: 'Tehran', lat: 35.69, lon: 51.39, temp: 20 },
  { name: 'Karachi', lat: 24.86, lon: 67.01, temp: 30 },
  { name: 'Jakarta', lat: -6.21, lon: 106.85, temp: 30 },
  { name: 'Hong Kong', lat: 22.32, lon: 114.17, temp: 25 },
  { name: 'Taipei', lat: 25.03, lon: 121.57, temp: 23 },
  { name: 'Osaka', lat: 34.69, lon: 135.5, temp: 15 },
  { name: 'Hanoi', lat: 21.03, lon: 105.85, temp: 26 },
  { name: 'Riyadh', lat: 24.69, lon: 46.72, temp: 40 },

  // ── Africa ────────────────────────────────────────────────
  { name: 'Cairo', lat: 30.04, lon: 31.24, temp: 26 },
  { name: 'Lagos', lat: 6.52, lon: 3.38, temp: 29 },
  { name: 'Nairobi', lat: -1.29, lon: 36.82, temp: 19 },
  { name: 'Cape Town', lat: -33.93, lon: 18.42, temp: 17 },
  { name: 'Johannesburg', lat: -26.2, lon: 28.05, temp: 18 },
  { name: 'Casablanca', lat: 33.57, lon: -7.59, temp: 19 },
  { name: 'Addis Ababa', lat: 9.02, lon: 38.75, temp: 16 },
  { name: 'Accra', lat: 5.56, lon: -0.2, temp: 28 },
  { name: 'Dakar', lat: 14.72, lon: -17.47, temp: 27 },

  // ── Oceania ───────────────────────────────────────────────
  { name: 'Sydney', lat: -33.87, lon: 151.21, temp: 20 },
  { name: 'Melbourne', lat: -37.81, lon: 144.96, temp: 15 },
  { name: 'Auckland', lat: -36.85, lon: 174.76, temp: 14 },
  { name: 'Perth', lat: -31.95, lon: 115.86, temp: 22 },
  { name: 'Brisbane', lat: -27.47, lon: 153.03, temp: 24 },
]
