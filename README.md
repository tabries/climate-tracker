# Climate & Impact Global Tracker

An interactive dashboard for visualizing global climate data in real time, combining 2D interactive maps (MapLibre GL) with 3D Three.js globe visualization. Built for climate analysts to understand climate risks, environmental data, and their parametric-insurance impact.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Features

- **2D Map** — MapLibre GL with 5 switchable weather tile layers (temperature, precipitation, clouds, wind, pressure)
- **3D Globe** — Three.js + React Three Fiber with instanced city data points, atmosphere shader, and click-to-select
- **Real-Time Data** — Socket.IO subscriptions with 30 s broadcast, weather alerts (extreme temp, wind, AQI)
- **Analytics** — Recharts time-series charts, CSV export, embedded Grafana dashboard
- **Time-Series Storage** — InfluxDB for weather + AQI history with configurable aggregation windows
- **Caching** — Redis (30 min weather, 24 h geocode) with graceful degradation
- **Security** — Helmet headers, gzip compression, 3-tier rate limiting
- **Dark Theme** — Tailwind CSS v4 dark mode dashboard

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 6 |
| 2D Maps | MapLibre GL JS |
| 3D Visualization | Three.js, React Three Fiber, Drei |
| State Management | Zustand 5 |
| Real-Time | Socket.IO |
| Charts | Recharts |
| Styling | Tailwind CSS 4 |
| Backend | Node.js, Express 4, TypeScript |
| Validation | Zod |
| Caching | Redis 7 |
| Time-Series DB | InfluxDB 2.7 |
| Dashboards | Grafana |
| Logging | Winston |
| Security | Helmet, express-rate-limit, compression |
| Deployment | Docker (multi-stage), Nginx, Docker Compose |
| CI/CD | GitHub Actions |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + TypeScript)              │
├─────────────────────────────────────────────────────────────────┤
│  MapLibre GL        Three.js Globe       Grafana (iframe)       │
│  (2D Layers)        (3D Render)          Recharts Analytics     │
│         └──────────────┼──────────────────┘                     │
│                WebSocket │ HTTP                                  │
└────────────────────┬─────┼──────────────────────────────────────┘
                     │     │
┌────────────────────┼─────┼──────────────────────────────────────┐
│              BACKEND (Node.js + Express)                        │
│  Socket.IO (real-time) ─── REST API (weather, geocode, AQI)    │
│  Redis cache ─── InfluxDB writes ─── Winston logging            │
│  Helmet ─── Rate Limiter ─── Compression                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────┼────────────────────────────────────────────┐
│              EXTERNAL APIs                                      │
│  OpenWeatherMap ─── MapTiler ─── (Copernicus / NOAA planned)    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
climate-tracker/
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.ts              # Express server entry
│   │   ├── config/               # Redis, InfluxDB, Axios client
│   │   ├── middleware/            # Cache, error, validation, rate limiting
│   │   ├── routes/               # weather, geocode, airQuality, tiles, history
│   │   ├── services/             # API & InfluxDB service layer
│   │   ├── schemas/              # Zod request validation schemas
│   │   ├── socket/               # Socket.IO setup & broadcast logic
│   │   ├── types/                # TypeScript interfaces
│   │   └── utils/                # Winston logger
│   └── package.json
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf                # Production reverse proxy
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Map/              # MapContainer, LayerManager, Legend
│   │   │   ├── Globe/            # GlobeScene, EarthMesh, Atmosphere, DataPoints
│   │   │   └── Analytics/        # HistoryChart, AnalyticsPanel, ExportButton, Grafana
│   │   ├── store/                # Zustand stores (weather, view, layer, realtime, analytics)
│   │   ├── hooks/                # useSocket
│   │   └── data/                 # worldCities dataset
│   └── package.json
├── config/
│   └── grafana/                  # Provisioned datasources + dashboards
├── .github/
│   └── workflows/ci.yml          # GitHub Actions CI pipeline
├── docker-compose.yml            # Full-stack orchestration
└── docs/                         # Roadmap, commit strategy, prompts
```

---

## Getting Started

### Prerequisites

- **Node.js 20+**
- **Docker + Docker Compose** (for Redis, InfluxDB, Grafana)
- **OpenWeatherMap API key** — [get one free](https://openweathermap.org/api)
- **MapTiler API key** — [get one free](https://www.maptiler.com/)

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/climate-tracker.git
cd climate-tracker

# Backend
cd backend
cp .env.example .env   # Fill in API keys (see Environment Variables below)
npm install

# Frontend
cd ../frontend
cp .env.example .env   # Fill in VITE_MAPTILER_API_KEY
npm install
```

### 2. Start Infrastructure

```bash
# From project root
docker compose up redis influxdb grafana -d
```

This starts:
- **Redis** on `localhost:6379`
- **InfluxDB** on `localhost:8086` (admin / admin123)
- **Grafana** on `localhost:4000` (admin / admin123)

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev            # http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev            # http://localhost:3000
```

### 4. Full-Stack Docker (Production)

Build and run everything in Docker:

```bash
docker compose --profile full up --build -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Grafana | http://localhost:4000 |
| InfluxDB | http://localhost:8086 |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | HTTP server port |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |
| `NODE_ENV` | — | Set to `production` for JSON log format |
| `LOG_LEVEL` | `info` | Winston log level |
| `OPENWEATHERMAP_API_KEY` | — | **Required.** Weather, AQI, and tile data |
| `MAPTILER_API_KEY` | — | **Required.** Geocoding |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `INFLUXDB_URL` | `http://localhost:8086` | InfluxDB connection |
| `INFLUXDB_TOKEN` | — | InfluxDB auth token (writes disabled if empty) |
| `INFLUXDB_ORG` | `climate-tracker` | InfluxDB organization |
| `INFLUXDB_BUCKET` | `climate` | InfluxDB bucket |
| `WS_BROADCAST_INTERVAL` | `30000` | WebSocket broadcast interval (ms) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_MAPTILER_API_KEY` | MapTiler key for map tiles |

---

## API Reference

### REST Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api` | API info + version |
| `GET` | `/api/weather/:lat/:lon` | Current weather + 5-day forecast |
| `GET` | `/api/geocode?query=<name>` | Location search (geocoding) |
| `GET` | `/api/air-quality/:lat/:lon` | Air Quality Index + pollutants |
| `GET` | `/api/tiles/:layer/:z/:x/:y` | Weather map tile proxy |
| `GET` | `/api/history/weather/:lat/:lon?range=24h&every=1h` | Weather time-series (InfluxDB) |
| `GET` | `/api/history/air-quality/:lat/:lon?range=24h&every=1h` | AQI time-series (InfluxDB) |
| `GET` | `/api/history/export/:lat/:lon?range=24h` | CSV export (weather + AQI) |

**Tile layers:** `temp_new`, `precipitation_new`, `clouds_new`, `wind_new`, `pressure_new`

**History ranges:** `1h`, `6h`, `12h`, `24h`, `7d`, `30d` — **Windows:** `5m`, `15m`, `1h`, `6h`, `1d`

### WebSocket Events (Socket.IO)

| Direction | Event | Description |
|-----------|-------|-------------|
| Client → Server | `subscribe` | Subscribe to location updates `{ lat, lon, name? }` |
| Client → Server | `unsubscribe` | Unsubscribe from location `{ lat, lon }` |
| Server → Client | `config` | Connection config `{ broadcastInterval }` |
| Server → Client | `weather:update` | Real-time weather data |
| Server → Client | `air-quality:update` | Real-time AQI data |
| Server → Client | `weather:alerts` | Threshold alerts (temp >40/< -20°C, wind >100 km/h, AQI >300) |

### Rate Limits

| Scope | Limit |
|-------|-------|
| All `/api/*` | 100 requests / 15 min / IP |
| `/api/geocode` | 30 requests / 1 min / IP |
| `/api/history/export` | 10 requests / 1 min / IP |

---

## Docker

### Images

Both images use multi-stage builds for minimal size:

- **Backend** — `node:20-alpine` → compiles TypeScript → production runtime with non-root user
- **Frontend** — `node:20-alpine` → Vite build → `nginx:1.27-alpine` serving static files

### Commands

```bash
# Infrastructure only (dev)
docker compose up redis influxdb grafana -d

# Full stack (production)
docker compose --profile full up --build -d

# Tear down
docker compose --profile full down -v
```

---

## CI/CD

GitHub Actions runs on every push to `main` and on pull requests:

1. **Backend** — `npm ci` → type-check → build
2. **Frontend** — `npm ci` → lint → type-check → build
3. **Docker** — builds both images (only after lint/build succeeds)

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## Build Stages

This project was built incrementally in 8 stages:

| Stage | Focus | Highlights |
|-------|-------|------------|
| 0 | Setup | Monorepo, Docker Compose, TypeScript config |
| 1 | Backend APIs | Weather, geocode, AQI endpoints, Redis caching, Zod validation |
| 2 | Frontend Base | MapLibre map, SearchBar, DataPanel, Zustand stores |
| 3 | Weather Layers | 5 OWM tile layers, LayerManager toggle, Legend |
| 4 | 3D Globe | Three.js globe, atmosphere shader, instanced city points |
| 5 | Real-Time | Socket.IO subscriptions, alerts, broadcast loop |
| 6 | Analytics | InfluxDB time-series, Recharts, CSV export, Grafana |
| 7 | Polish + Deploy | Dockerfiles, Nginx, security, CI/CD, documentation |

See the full roadmap in [`docs/0.0_CLIMATE_TRACKER_ROADMAP.md`](docs/0.0_CLIMATE_TRACKER_ROADMAP.md).

---

## License

MIT
