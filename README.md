# 🌊 Bahari Snap

**Bahari Snap** is a fluid, immersive social media platform inspired by the ocean. Experience the "flow" of content with vertical snaps, wave interactions, and community circles.

[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&repository=github.com/YOUR_GITHUB_USERNAME/bahari-snap&branch=main&name=bahari-snap&env[DATABASE_URL]=&env[JWT_SECRET]=&env[APP_URL]=&env[FIREBASE_API_KEY]=&env[FIREBASE_AUTH_DOMAIN]=&env[FIREBASE_PROJECT_ID]=&env[FIREBASE_STORAGE_BUCKET]=&env[FIREBASE_MESSAGING_SENDER_ID]=&env[FIREBASE_APP_ID]=&env[FIREBASE_FIRESTORE_DATABASE_ID]=)

## 🚀 Features

- **Vertical Snap Feed:** Immersive full-screen video and image scrolling.
- **Wave Interactions:** React with 🔥, 😂, 💡, or ❤️ and leave "Echoes" (comments).
- **Circles:** Join community groups like *Music Waves*, *Tech Tide*, and *Nairobi Trends*.
- **Real-time Updates:** Powered by PostgreSQL and JWT for instant interactions.
- **Ocean Aesthetic:** Deep blue themes with neon accents and glassmorphism.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, Framer Motion.
- **Backend:** Node.js (Express), Prisma ORM.
- **Database:** PostgreSQL (Render/Koyeb).
- **Auth:** JWT (Email/Password & Google OAuth).
- **Storage:** Firebase Storage (for media).

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
Create a `.env` file based on `.env.example` and add your credentials:
```env
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your_secret
APP_URL=http://localhost:3000
FIREBASE_API_KEY=your_key
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
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: A long random string for security.
   - `APP_URL`: Your Koyeb app URL (e.g., `https://bahari-snap-user.koyeb.app`).
   - `FIREBASE_*`: Your Firebase project credentials (for storage).

## 📄 License
Apache-2.0

## ⚠️ Common Issues

**"The table public.User does not exist in the current database."**
This error occurs if the database schema hasn't been pushed to your PostgreSQL database.
- **Fix:** Ensure you have set the `DATABASE_URL` environment variable in your Koyeb/Render dashboard.
- The application is configured to automatically run `npx prisma db push` on startup. If it fails, double-check your database credentials and connection string.
- You can also manually push the schema by running `npx prisma db push` from your local machine if you have the `DATABASE_URL` set in your `.env` file.
