const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

/* ================== ENV CHECK ================== */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

/* ================== PATHS ================== */
const uploadsPath = path.join(__dirname, "uploads");
const frontendPath = path.join(__dirname, "../frontend");
const frontendIndex = path.join(frontendPath, "index.html");

/* ================== ENV VALIDATION ================== */
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in environment variables");
  process.exit(1);
}

/* ================== DEBUG LOGS ================== */
console.log("🔍 NODE_ENV:", process.env.NODE_ENV || "development");
console.log("🔍 PORT:", PORT);
console.log("🔍 MONGO_URI exists:", !!MONGO_URI);
console.log(
  "🔍 MONGO_URI preview:",
  MONGO_URI ? MONGO_URI.substring(0, 30) + "..." : "NOT FOUND"
);
console.log("🔍 Frontend path:", frontendPath);
console.log("🔍 Frontend exists:", fs.existsSync(frontendPath));
console.log("🔍 index.html exists:", fs.existsSync(frontendIndex));

/* ================== PASSPORT ================== */
const hasGoogleOAuth =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET;

if (hasGoogleOAuth) {
  require("./config/passport");
  app.use(passport.initialize());
  console.log("✅ Passport Google OAuth initialized");
} else {
  console.log("⚠️ Google OAuth skipped (missing env vars)");
}

/* ================== MIDDLEWARE ================== */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== ENSURE UPLOADS FOLDER ================== */
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📁 uploads folder created");
}

/* ================== STATIC FOLDERS ================== */
app.use("/uploads", express.static(uploadsPath));

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  console.log("✅ Frontend static folder served");
} else {
  console.log("⚠️ Frontend folder not found, skipping static serving");
}

/* ================== HEALTH ROUTES ================== */
app.get("/", (req, res) => {
  if (fs.existsSync(frontendIndex)) {
    return res.sendFile(frontendIndex);
  }
  return res.status(200).send("API is running...");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    uptime: process.uptime(),
  });
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

/* ================== FRONTEND ROUTES ================== */
const frontendRoutes = [
  "/about",
  "/contact",
  "/projects",
  "/blogs",
  "/login",
  "/register",
  "/profile",
  "/add-project",
  "/project-details",
];

frontendRoutes.forEach((route) => {
  app.get(route, (req, res) => {
    if (fs.existsSync(frontendIndex)) {
      return res.sendFile(frontendIndex);
    }
    return res.status(404).send("Frontend not found");
  });
});

/* ================== 404 HANDLER ================== */
app.use((req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({
      success: false,
      error: "API Route Not Found",
    });
  }

  if (fs.existsSync(frontendIndex)) {
    return res.sendFile(frontendIndex);
  }

  return res.status(404).send("Page Not Found");
});

/* ================== GLOBAL ERROR HANDLER ================== */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack || err.message);

  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || "Internal Server Error",
    });
  }

  res.status(err.status || 500).send("Internal Server Error");
});

/* ================== DATABASE + SERVER START ================== */
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

startServer();

/* ================== HANDLE PROCESS ERRORS ================== */
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.stack || err.message);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.stack || err.message);
  process.exit(1);
});