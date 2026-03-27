import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "bahari_snap_secret_key_2026";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Test database connection
  try {
    await prisma.$connect();
    console.log("Connected to database successfully");
    // Check if tables exist
    const userCount = await prisma.user.count();
    console.log(`Current user count: ${userCount}`);
  } catch (error) {
    console.error("Database connection error:", error);
    console.log("DATABASE_URL is set:", !!process.env.DATABASE_URL);
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      console.log("Database host:", url.host);
    }
  }

  app.use(cors());
  app.use(express.json());

  // Validation helpers
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateUsername = (username: string) => /^[a-zA-Z0-9_]{3,20}$/.test(username);
  const validatePassword = (password: string) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);

  // Helper to send OTP via EmailJS
  const sendOTP = async (email: string, otp: string) => {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey || !privateKey) {
      console.error("EmailJS environment variables are not set. Please check EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, and EMAILJS_PRIVATE_KEY.");
      return false;
    }

    try {
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          accessToken: privateKey,
          template_params: { to_email: email, otp: otp },
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`EmailJS API Error (${response.status}):`, errorText);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Failed to send OTP via EmailJS:", error);
      return false;
    }
  };

  // Middleware to authenticate JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // --- AUTH ROUTES ---

  app.post("/api/auth/register", async (req, res) => {
    const { email, password, username, displayName } = req.body;
    
    if (!validateEmail(email)) return res.status(400).json({ error: "Invalid email format" });
    if (!validateUsername(username)) return res.status(400).json({ error: "Username must be 3-20 characters (alphanumeric/underscore)" });
    if (!validatePassword(password)) return res.status(400).json({ error: "Password must be at least 8 characters, with one letter and one number" });

    try {
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] }
      });
      if (existingUser) return res.status(400).json({ error: "Email or username already taken" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          username,
          displayName,
          otp,
          otpExpires,
          isVerified: false,
        },
      });

      const sent = await sendOTP(email, otp);
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      
      if (!sent) {
        return res.json({ 
          token, 
          user, 
          warning: "Account created, but we couldn't send the verification email. Please try resending it from the verification screen.",
          message: "Account created (Email failed)"
        });
      }

      res.json({ token, user, message: "Verification OTP sent to your email" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/verify-otp", authenticateToken, async (req: any, res) => {
    const { otp } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) return res.status(404).json({ error: "User not found" });

      if (user.isVerified) return res.json({ message: "Already verified", user });

      if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, otp: null, otpExpires: null }
      });

      res.json({ message: "Email verified successfully", user: updatedUser });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/resend-otp", authenticateToken, async (req: any, res) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) return res.status(404).json({ error: "User not found" });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { otp, otpExpires }
      });

      const sent = await sendOTP(user.email, otp);
      if (!sent) {
        return res.json({ 
          warning: "We couldn't send the new OTP. Please check your EmailJS configuration or try again later.",
          message: "Resend failed"
        });
      }

      res.json({ message: "New OTP sent to your email" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) return res.status(400).json({ error: "Invalid credentials" });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.json({ token, user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/google", async (req, res) => {
    const { email, displayName, photoURL, uid } = req.body;
    try {
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            displayName,
            photoURL,
            isVerified: true, // Google users are verified by default
            username: email.split('@')[0] + "_" + Math.floor(Math.random() * 1000),
          },
        });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.json({ token, user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // --- POST ROUTES ---

  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await prisma.post.findMany({
        include: {
          author: { select: { id: true, username: true, displayName: true, photoURL: true } },
          reactions: true,
          _count: { select: { comments: true, reactions: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/posts", authenticateToken, async (req: any, res) => {
    const { mediaUrl, mediaType, caption, circleId } = req.body;
    try {
      const post = await prisma.post.create({
        data: {
          authorId: req.user.id,
          mediaUrl,
          mediaType,
          caption,
          circleId,
        },
      });
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/posts/:id/react", authenticateToken, async (req: any, res) => {
    const { type } = req.body;
    const postId = req.params.id;
    try {
      const existing = await prisma.reaction.findUnique({
        where: { postId_userId_type: { postId, userId: req.user.id, type } }
      });

      if (existing) {
        await prisma.reaction.delete({ where: { id: existing.id } });
        await prisma.post.update({ where: { id: postId }, data: { likesCount: { decrement: 1 } } });
        return res.json({ status: "removed" });
      }

      await prisma.reaction.create({
        data: { postId, userId: req.user.id, type }
      });
      await prisma.post.update({ where: { id: postId }, data: { likesCount: { increment: 1 } } });
      res.json({ status: "added" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const comments = await prisma.comment.findMany({
        where: { postId: req.params.id },
        include: { author: { select: { username: true, photoURL: true } } },
        orderBy: { createdAt: 'asc' }
      });
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/posts/:id/comments", authenticateToken, async (req: any, res) => {
    const { text } = req.body;
    try {
      const comment = await prisma.comment.create({
        data: {
          postId: req.params.id,
          authorId: req.user.id,
          text,
        },
      });
      await prisma.post.update({ where: { id: req.params.id }, data: { commentsCount: { increment: 1 } } });
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // --- CIRCLE ROUTES ---

  app.get("/api/circles", async (req, res) => {
    try {
      const circles = await prisma.circle.findMany();
      res.json(circles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- USER ROUTES ---

  app.get("/api/users/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
