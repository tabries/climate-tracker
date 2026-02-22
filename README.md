# Interactive Climate & Impact Global Tracker

An interactive dashboard for visualizing global climate data in real time, combining 2D interactive maps with 3D Three.js visualization. Targeted at climate analysts to understand climate risks, environmental data, and their impact.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| 2D Maps | Mapbox GL JS |
| 3D Visualization | Three.js + React Three Fiber |
| State | Zustand |
| Real-time | Socket.io |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Time-series DB | InfluxDB |
| Cache | Redis |
| Deployment | Docker |

## Project Structure

```
climate-tracker/
├── frontend/          # Vite + React + TypeScript
├── backend/           # Node.js + Express + TypeScript
├── docs/              # Project planning and roadmap
└── docker-compose.yml # Local dev environment
```

## Getting Started

### Prerequisites
- Node.js 20+
- Docker + Docker Compose

### Local Development

```bash
# Start infrastructure (Redis, InfluxDB, Grafana)
docker-compose up -d

# Backend
cd backend
cp .env.example .env   # Fill in your API keys
npm install
npm run dev            # Runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev            # Runs on http://localhost:3000
```

## Build Stages

See [`docs/0.0_CLIMATE_TRACKER_ROADMAP.md`](docs/0.0_CLIMATE_TRACKER_ROADMAP.md) for the full build plan.

| Stage | Focus |
|-------|-------|
| 0 | Setup & project structure |
| 1 | Backend APIs + caching |
| 2 | Frontend base + Mapbox |
| 3 | Climate data layers |
| 4 | Three.js 3D globe |
| 5 | Real-time WebSocket |
| 6 | Grafana + analytics |
| 7 | Deployment + polish |
