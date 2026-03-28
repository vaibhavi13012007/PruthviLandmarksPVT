const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const path = require("path");
require("dotenv").config();

const app = express();

/* ================== PASSPORT ================== */
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
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== STATIC FOLDERS ================== */
// Uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

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
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "contact.html"));
});

app.get("/projects", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "project.html"));
});

app.get("/blogs", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "blogs.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "register.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "profile.html"));
});

app.get("/add-project", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "add-project.html"));
});

app.get("/project-details", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "project-details.html"));
});

/* ================== 404 HANDLER ================== */
app.use((req, res) => {
  res.status(404).json({
    error: "Route Not Found"
  });
});

/* ================== DATABASE CONNECTION ================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Failed:", err);
  });