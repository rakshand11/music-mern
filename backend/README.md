# Music Tune - Backend

REST API and real-time server for the Music Tune app.

## Tech Stack

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- Cloudinary
- node-cron

## Features

- User auth with JWT stored in HTTP-only cookies
- Song and playlist management
- Like songs
- Schedule songs to auto-play via node-cron + Socket.IO
- Admin panel support
- Cloudinary for image and audio uploads

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### Installation

```bash
git clone https://github.com/rakshand11/music-mern.git
cd music-app-backend
npm install
```

### Environment Variables

Create a `.env` file in the root:

```bash
PORT=3000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
NODE_ENV=development
```

### Run Locally

```bash
npm start
```

Server runs on `http://localhost:3000`

### Production Build (for Render)

```bash
npm run build
node dist/index.js
```

## API Routes

### User

| Method | Route              | Description     |
| ------ | ------------------ | --------------- |
| POST   | /user/register     | Register user   |
| POST   | /user/login        | Login user      |
| POST   | /user/logout       | Logout user     |
| PUT    | /user/update       | Update profile  |
| POST   | /user/like/:songId | Like a song     |
| GET    | /user/liked-songs  | Get liked songs |

### Admin

| Method | Route             | Description |
| ------ | ----------------- | ----------- |
| POST   | /user/admin/login | Admin login |
| POST   | /song/create      | Create song |

### Songs

| Method | Route     | Description           |
| ------ | --------- | --------------------- |
| GET    | /song/    | Get all songs         |
| POST   | /song/add | Add a song (admin)    |
| DELETE | /song/:id | Delete a song (admin) |

### Playlists

| Method | Route            | Description       |
| ------ | ---------------- | ----------------- |
| GET    | /playlist/       | Get all playlists |
| POST   | /playlist/create | Create playlist   |
| DELETE | /playlist/:id    | Delete playlist   |

### Schedule

| Method | Route                         | Description                  |
| ------ | ----------------------------- | ---------------------------- |
| GET    | /schedule/get-schedule        | Get user schedules           |
| POST   | /schedule/create              | Create schedule              |
| PUT    | /schedule/update-schedule/:id | Update schedule              |
| DELETE | /schedule/delete-schedule/:id | Delete schedule              |
| PATCH  | /schedule/toggle/:id          | Toggle schedule active state |

## How Scheduling Works

1. User creates a schedule with a song and a time
2. node-cron checks every minute for active due schedules
3. When a match is found, Socket.IO emits a `play-song` event to that user
4. Frontend receives the event and plays the song instantly

## Project Structure

```
src/
├── controller/       # Route controllers
├── middleware/       # Auth middleware + Cloudinary
├── model/            # Mongoose models
├── route/            # Express routers
├── cron/             # node-cron schedule job
└── index.ts          # Server entry point
```

## Deployment

Deployed on Render.

- Build Command: `npm run build`
- Start Command: `node dist/index.js`
- Backend URL: `https://music-mern-qwkz.onrender.com`
