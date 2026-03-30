# Music Tune - Frontend

A modern music streaming web app built with React and TypeScript.

## Tech Stack

- React + TypeScript
- Tailwind CSS
- Axios
- Socket.IO Client
- React Router
- React Hot Toast

## Features

- Stream and play songs with a full music player
- Create and manage playlists
- Like your favourite songs
- Schedule songs to play automatically at a set time
- Real-time song scheduling via Socket.IO

## Getting Started

### Prerequisites

- Node.js v18+
- Backend server running

### Installation

```bash
git clone https://github.com/rakshand11/music-mern.git
cd music-app-frontend
npm install
```

### Environment Variables

Create a `.env` file in the root:

```bash
VITE_BACKEND_URL=http://localhost:3000
```

### Run Locally

```bash
npm run dev
```

App runs on `http://localhost:5173`

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/            # App pages
├── context/          # PlayerContext
├── socket.ts         # Socket.IO connection
└── axiosInstance.ts  # Axios base config
```

## Live Demo

[musictune.com](https://musictune.com)
