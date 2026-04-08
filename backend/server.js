const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

/* ================== ENV ================== */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

/* ================== PATHS ================== */
const uploadsPath = path.join(__dirname, "uploads");

// safer frontend path detection
let frontendPath = path.join(__dirname, "../frontend");
if (!fs.existsSync(frontendPath)) {
  frontendPath = path.join(__dirname, "frontend");
}
const frontendIndex = path.join(frontendPath, "index.html");

/* ================== ENV VALIDATION ================== */
if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

/* ================== DEBUG ================== */
console.log("🔍 PORT:", PORT);
console.log("🔍 Mongo URI exists:", !!MONGO_URI);
console.log("🔍 Frontend path:", frontendPath);
console.log("🔍 Frontend exists:", fs.existsSync(frontendPath));

/* ================== PASSPORT ================== */
try {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    require("./config/passport");
    app.use(passport.initialize());
    console.log("✅ Passport initialized");
  } else {
    console.log("⚠️ Google OAuth skipped");
  }
} catch (err) {
  console.error("❌ Passport error:", err.message);
}

/* ================== MIDDLEWARE ================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== UPLOADS ================== */
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📁 uploads folder created");
}
app.use("/uploads", express.static(uploadsPath));

/* ================== FRONTEND ================== */
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  console.log("✅ Serving frontend");
}

/* ================== HEALTH ================== */
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server running" });
});

/* ================== API ROUTES ================== */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin/stats", require("./routes/adminStatsRoutes"));
app.use("/api/stats", require("./routes/publicStatsRoutes"));
app.use("/api/supervisor/blogs", require("./routes/supervisorBlogRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));

/* ================== SPA ROUTES ================== */
const routes = [
  "/",
  "/about",
  "/contact",
  "/projects",
  "/blogs",
  "/login",
  "/register",
  "/profile",
  "/add-project",
  "/project-details"
];

routes.forEach(route => {
  app.get(route, (req, res) => {
    if (fs.existsSync(frontendIndex)) {
      return res.sendFile(frontendIndex);
    } else {
      return res.status(404).send("Frontend not found");
    }
  });
});

/* ================== 404 HANDLER ================== */
app.use((req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ error: "API Not Found" });
  }

  if (fs.existsSync(frontendIndex)) {
    return res.sendFile(frontendIndex);
  }

  return res.status(404).send("Page Not Found");
});

/* ================== ERROR HANDLER ================== */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || "Internal Server Error"
    });
  }

  res.status(err.status || 500).send("Server Error");
});

/* ================== START SERVER ================== */
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running: http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ DB Error:", err.message);
    process.exit(1);
  }
};

startServer();

/* ================== PROCESS ERRORS ================== */
process.on("unhandledRejection", err => {
  console.error("❌ Unhandled Rejection:", err.message);
});

process.on("uncaughtException", err => {
  console.error("❌ Uncaught Exception:", err.message);
});