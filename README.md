# PulseFit — Personal Fitness & Nutrition Tracker

A full-stack MERN (MongoDB, Express.js, React, Node.js) web application written in pure JavaScript (`.js` & `.jsx`) with Tailwind CSS, Recharts, and GSAP ScrollTrigger animations.

## Quick Start

```bash
# 1. Copy environment variables
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Start the server (Express API + Vite frontend on port 3000)
npm run dev
```

Open **`http://localhost:3000`** in your browser and register your own account on `/register`.

> If a local MongoDB instance isn't running on your machine, the server automatically starts an embedded in-memory MongoDB server so everything works out of the box.

## MongoDB Compass

PulseFit reads `MONGODB_URI` from `.env`. For a local MongoDB server, use:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/fitness_tracker
```

In MongoDB Compass, create a connection with the same URI. The `fitness_tracker` database appears after PulseFit writes its first document. If MongoDB is unavailable, the development server falls back to an in-memory database, which does not persist data after shutdown.

## Scripts

- `npm run dev` — Start development server (`node server.js`)
- `npm start` — Start server (`node server.js`)
- `npm run build` — Build frontend bundle into `dist/`
- `npm run lint` — Check JavaScript/JSX syntax across all files
- `npm test` — Run unit tests (`node --test`)
