import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    eventsOrganized: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],

    eventsAttended: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],

    otp: {
      type: String,
      select: false, // Not returned in queries
    },

    otpExpires: {
      type: Date,
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["Attendee", "Organizer", "admin"], // ✅ lowercase standard
      default: "Attendee",
    },

    // Interests for attendees (e.g., Music, Sports, Tech, etc.)
    interests: {
      type: [String],
      default: [],
    },

    // Google OAuth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

/* ===========================
   OPTIONAL: Allow Only ONE ADMIN
   =========================== */
// userSchema.index(
//   { role: 1 },
//   {
//     unique: true,
//     partialFilterExpression: { role: "admin" },
//   }
// );

export const User = mongoose.model("User", userSchema);
