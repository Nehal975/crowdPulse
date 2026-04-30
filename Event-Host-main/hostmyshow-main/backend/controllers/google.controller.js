import { OAuth2Client } from "google-auth-library";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ GOOGLE LOGIN
const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        username: name,
        email,
        googleId: sub,
        avatar: picture,
        role: "Attendee",
        isVerified: true,
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = sub;
      if (!user.avatar) user.avatar = picture;
      user.isVerified = true;
      await user.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Set cookie
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token: jwtToken,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid Google token",
    });
  }
});

export { googleLogin };
