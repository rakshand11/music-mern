# Dobby Ads Drive — Backend 🗂️

REST API for a Google Drive-inspired app where users can register, create nested folders, and upload images.

## 🌐 Live API

- **Backend:** https://your-backend.render.com

> Update this link after deployment.

---

## 🛠️ Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication (HTTP-only cookies)
- Cloudinary (image storage)
- Multer (file uploads)

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── cloudinary.js
│   ├── controller/
│   │   ├── user.controller.js
│   │   ├── folder.controller.js
│   │   └── image.controller.js
│   ├── middleware/
│   │   └── middleware.js
│   ├── model/
│   │   ├── user.model.js
│   │   ├── folder.model.js
│   │   └── image.model.js
│   └── route/
│       ├── user.route.js
│       ├── folder.route.js
│       └── image.route.js
├── index.js
├── package.json
└── .env.example
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Fill in your credentials in .env

# Start development server
npm run dev

# Start production server
npm start
```

---

## 🔑 Environment Variables

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📡 API Endpoints

### Auth

| Method | Endpoint       | Description         | Auth |
| ------ | -------------- | ------------------- | ---- |
| POST   | `/user/signup` | Register a new user | ❌   |
| POST   | `/user/login`  | Login               | ❌   |
| POST   | `/user/logout` | Logout              | ✅   |

### Folders

| Method | Endpoint            | Description                    | Auth |
| ------ | ------------------- | ------------------------------ | ---- |
| POST   | `/folder`           | Create a folder                | ✅   |
| GET    | `/folder?parentId=` | Get folders (root or nested)   | ✅   |
| GET    | `/folder/:id`       | Get single folder with size    | ✅   |
| DELETE | `/folder/:id`       | Delete folder and all contents | ✅   |

### Images

| Method | Endpoint           | Description              | Auth |
| ------ | ------------------ | ------------------------ | ---- |
| POST   | `/image`           | Upload image to a folder | ✅   |
| GET    | `/image?folderId=` | Get images in a folder   | ✅   |
| DELETE | `/image/:id`       | Delete an image          | ✅   |

---

## 🔐 Test Credentials

```
Email: test@dobbyads.com
Password: test123
```

> Update these with your actual test credentials before submitting.

---

## 👨‍💻 Author

Built by **Rakshan** for the Dobby Ads Full Stack Developer Assignment.
