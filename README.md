# 🌊 Bahari Snap

**Bahari Snap** is a fluid, immersive social media platform inspired by the ocean. Experience the "flow" of content with vertical snaps, wave interactions, and community circles.

[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&repository=github.com/YOUR_GITHUB_USERNAME/bahari-snap&branch=main&name=bahari-snap&env[APP_URL]=&env[FIREBASE_API_KEY]=&env[FIREBASE_AUTH_DOMAIN]=&env[FIREBASE_PROJECT_ID]=&env[FIREBASE_STORAGE_BUCKET]=&env[FIREBASE_MESSAGING_SENDER_ID]=&env[FIREBASE_APP_ID]=&env[FIREBASE_FIRESTORE_DATABASE_ID]=)

## 🚀 Features

- **Vertical Snap Feed:** Immersive full-screen video and image scrolling.
- **Wave Interactions:** React with 🔥, 😂, 💡, or ❤️ and leave "Echoes" (comments).
- **Circles:** Join community groups like *Music Waves*, *Tech Tide*, and *Nairobi Trends*.
- **Real-time Updates:** Powered by Firebase for instant interactions.
- **Ocean Aesthetic:** Deep blue themes with neon accents and glassmorphism.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, Framer Motion.
- **Backend:** Node.js (Express) serving the SPA.
- **Database:** Firebase Firestore & Storage.
- **Auth:** Firebase Google Authentication.

## 📦 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/bahari-snap.git
cd bahari-snap
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file based on `.env.example` and add your Firebase credentials:
```env
GEMINI_API_KEY=your_key
APP_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_key
...
```

### 4. Run Development Server
```bash
npm run dev
```

## 🚢 Deployment to Koyeb

1. **Push to GitHub:** Create a new repository and push your code.
2. **Click the Deploy Button:** Use the button above or manually connect your repo in the Koyeb dashboard.
3. **Configure Environment Variables:**
   - `APP_URL`: Your Koyeb app URL (e.g., `https://bahari-snap-user.koyeb.app`).
   - `FIREBASE_*`: Your Firebase project credentials.

## 📄 License
Apache-2.0
