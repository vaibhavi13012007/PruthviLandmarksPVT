const passport = require("passport");
const User = require("../models/User");

/* ======================
   GOOGLE STRATEGY
====================== */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const GoogleStrategy = require("passport-google-oauth20").Strategy;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "/api/auth/google/callback",
      },
      async (_, __, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email }],
          });

          if (!user) {
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email,
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }

          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );

  console.log("✅ Google OAuth configured");
} else {
  console.log("⚠️ Google OAuth skipped (missing env vars)");
}

module.exports = passport;