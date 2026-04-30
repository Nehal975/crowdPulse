import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { mail, otpFormat } from "../utils/email.js";
import { generateOTP } from "../utils/generateOTP.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Booking } from "../models/bookings.model.js";
import Review from "../models/review.model.js";
import { Event } from "../models/events.model.js";

// Update user interests
const updateUserInterests = asyncHandler(async (req, res) => {
    const { interests } = req.body;

    if (!Array.isArray(interests)) {
        return res.status(400).send({
            success: false,
            message: "Interests must be an array"
        });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).send({
            success: false,
            message: "User not found"
        });
    }

    user.interests = interests;
    await user.save();

    return res.status(200).send({
        success: true,
        message: "Interests updated successfully",
        interests: user.interests
    });
});

// Request password reset - send OTP to user's email
const requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send({
            message: "Email is required",
            success: false
        });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpires');

    if (!user) {
        return res.status(404).send({
            message: "User not found with this email",
            success: false
        });
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    
    user.otp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send OTP via email
    const content = {
        to: user.email,
        subject: "HostMyShow Password Reset OTP",
        html: otpFormat(user.username, otp)
    };

    const sent = await mail(content);
    if (!sent) {
        return res.status(400).send({
            message: "Failed to send OTP email",
            success: false
        });
    }

    return res.status(200).send({
        message: "OTP sent to your email for password reset",
        success: true,
        email: user.email // Return masked email for display
    });
});

// Verify OTP and reset password
const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).send({
            message: "All fields are required (email, otp, newPassword)",
            success: false
        });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpires');

    if (!user) {
        return res.status(404).send({
            message: "User not found",
            success: false
        });
    }

    // Verify OTP
    if (user.otp !== otp) {
        return res.status(400).send({
            message: "Invalid OTP",
            success: false
        });
    }

    // Check if OTP is expired
    if (Date.now() > user.otpExpires) {
        return res.status(400).send({
            message: "OTP has expired. Please request a new one",
            success: false
        });
    }

    // Hash new password
    const hashPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    user.password = hashPassword;
    user.otp = "";
    user.otpExpires = null;
    await user.save();

    return res.status(200).send({
        message: "Password reset successful. You can now login with your new password",
        success: true
    });
});

const register = asyncHandler(async (req, res) => {
    const { email, username, password, role, interests } = req.body;

    if (!email || !username || !password || !role) {
        return res.status(400).send({
            message: "All fields are required",
            success: false
        });
    }

    let user = await User.findOne({ email });
    if (user) {
        return res.status(400).send({
            message: "User already exists",
            success: false
        });
    }

    const otp = generateOTP();
    const hashPassword = await bcrypt.hash(password, 10);

    // Only accept interests for Attendees
    const userInterests = role === "Attendee" && Array.isArray(interests) ? interests : [];

    user = new User({
        username,
        email,
        password: hashPassword,
        role,
        interests: userInterests,
        otp,
        otpExpires: Date.now() + 15 * 60 * 1000 // 15 minutes from now
    });

    await user.save();

    // TODO: Send OTP via email here
    const content = {
        to : user.email,
        subject : "HostMyShow OTP Verification",
        html : otpFormat(user.username , otp)
    };

    const sent = await mail(content);
    if(!sent){
        return res.status(400).send({
            message : "Problem with sending OTP",
            success : false
        })
    }
  
    return res.status(200).send({
        message: "OTP sent to your email",
        success: true
    });
});

const verifyOtp = asyncHandler(async (req, res) => {
    const { otp, email } = req.body;

    if (!otp || !email) {
        return res.status(400).send({
            message: "OTP missing",
            success: false
        });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpires');

    // Check if OTP is invalid or expired
    if (user.otp !== otp) {
        return res.status(400).send({
            message: "Invalid OTP",
            success: false
        });
    }

    if (Date.now() > user.otpExpires) {
        return res.status(400).send({
            message: "OTP has expired. Please request a new one",
            success: false
        });
    }

    // OTP is valid - clear OTP and save
    user.otp = "";
    user.otpExpires = null;
    await user.save();

    return res.status(200).send({
        user,
        message: "OTP verified. Registration successful",
        success: true
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({
            message: "All fields are required",
            success: false
        });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).send({
            message: "User does not exist",
            success: false
        });
    }

    if (user.otp) {
        if (Date.now() > user.otpExpires) {
            await User.findOneAndDelete({ email });
            return res.status(400).send({
                message: "OTP was not verified in time. Account deleted",
                success: false
            });
        } else {
            return res.status(400).send({
                message: "Please verify your OTP to activate your account",
                success: false
            });
        }
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).send({
            message: "Incorrect email or password",
            success: false
        });
    }

    const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return res.status(200)
        .cookie("token", token, {
            httpOnly: true,
            sameSite : "None",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000 
        })
        .send({
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            },
            token,
            message: "Login successful",
            success: true
        });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
   .populate("eventsOrganized", "title banner  status eventDateTime")
    .populate("eventsAttended", "title banner status eventDateTime")


  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    user,
    message: "User profile fetched successfully",
  });
});

const logout = asyncHandler(async (req ,res) => {
    res.clearCookie("token" , {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });
    return res.status(200).send({
        message : "Logout Successfull", 
        success : true
    })
})

export { register, verifyOtp, login , logout , getUserProfile, requestPasswordReset, resetPassword, registerAdmin, getAdminDashboardStats, getAllUsers, updateUser, deleteUser, updateUserInterests };

// Admin registration - max 2 admins allowed
const registerAdmin = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return res.status(400).send({
            message: "All fields are required",
            success: false
        });
    }

    // Check if admin limit (2) is reached
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount >= 2) {
        return res.status(403).send({
            message: "Maximum of 2 admin accounts allowed. Please contact existing admin.",
            success: false
        });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).send({
            message: "Email already registered",
            success: false
        });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await User.create({
        username,
        email,
        password: hashedPassword,
        role: "admin",
        isVerified: true
    });

    return res.status(201).send({
        message: "Admin registered successfully",
        success: true,
        admin: {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role
        }
    });
});

// Get admin dashboard stats
const getAdminDashboardStats = asyncHandler(async (req, res) => {
    // Debug: Check what roles exist in the database
    const allUsers = await User.find().select('role username email');
    console.log('=== USER DEBUG INFO ===');
    console.log('All users in DB:', JSON.stringify(allUsers, null, 2));
    console.log('Total users count:', allUsers.length);
    
    // Group users by role for debugging
    const usersByRole = {};
    allUsers.forEach(user => {
      const role = user.role || 'undefined';
      usersByRole[role] = (usersByRole[role] || 0) + 1;
    });
    console.log('Users by role:', usersByRole);
    
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalOrganizers = await User.countDocuments({ role: "Organizer" });
    console.log('Total Organizers query result:', totalOrganizers);
    const totalAttendees = await User.countDocuments({ role: "Attendee" });
    console.log('Total Attendees query result:', totalAttendees);
    const totalAdmins = await User.countDocuments({ role: "admin" });
    console.log('Total Admins query result:', totalAdmins);
    console.log('=======================');
    const totalEvents = await Event.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
        { $group: { _id: null, total: { $sum: "$paymentAmt" } } }
    ]);

    // Get all organizers with their stats
    const organizers = await User.find({ role: "Organizer" }).select("username email");
    
    const organizerStats = await Promise.all(organizers.map(async (organizer) => {
        // Get tickets sold by this organizer
        const ticketsSold = await Booking.countDocuments({ organizer_id: organizer._id });
        
        // Get revenue from this organizer
        const revenue = await Booking.aggregate([
            { $match: { organizer_id: organizer._id } },
            { $group: { _id: null, total: { $sum: "$paymentAmt" } } }
        ]);

        // Get events count
        const eventsCount = await Event.countDocuments({ organizer: organizer._id });

        // Get reviews for events organized by this organizer
        const organizerEvents = await Event.find({ organizer: organizer._id }).select("_id");
        const eventIds = organizerEvents.map(e => e._id);
        
        const reviews = await Review.find({ event_id: { $in: eventIds } });
        const positiveReviews = reviews.filter(r => r.sentiment === "positive").length;
        const negativeReviews = reviews.filter(r => r.sentiment === "negative").length;
        const neutralReviews = reviews.filter(r => r.sentiment === "neutral").length;

        return {
            organizerId: organizer._id,
            username: organizer.username,
            email: organizer.email,
            ticketsSold,
            revenue: revenue[0]?.total || 0,
            eventsCount,
            positiveReviews,
            negativeReviews,
            neutralReviews,
            totalReviews: reviews.length
        };
    }));

    return res.status(200).send({
        success: true,
        stats: {
            totalUsers,
            totalOrganizers,
            totalAttendees,
            totalAdmins,
            totalEvents,
            totalBookings,
            totalRevenue: totalRevenue[0]?.total || 0
        },
        organizerStats
    });
});

// Get all users for admin management
const getAllUsers = asyncHandler(async (req, res) => {
    const { role, search } = req.query;
    
    let query = {};
    
    // Filter by role if provided
    if (role && role !== 'all') {
        query.role = role;
    }
    
    // Search by username or email
    if (search) {
        query.$or = [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }
    
    const users = await User.find(query).select('-password -otp -otpExpires').sort({ createdAt: -1 });
    
    // Get additional stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
        let eventsCount = 0;
        let bookingsCount = 0;
        
        if (user.role === 'Organizer') {
            eventsCount = await Event.countDocuments({ organizer: user._id });
        }
        
        bookingsCount = await Booking.countDocuments({ user: user._id });
        
        return {
            ...user.toObject(),
            eventsCount,
            bookingsCount
        };
    }));
    
    return res.status(200).send({
        success: true,
        users: usersWithStats,
        total: usersWithStats.length
    });
});

// Update user by admin
const updateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { username, email, role, status } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
        return res.status(404).send({
            success: false,
            message: "User not found"
        });
    }
    
    // Prevent changing own admin role
    if (req.user._id.toString() === userId && role && role !== 'admin') {
        return res.status(400).send({
            success: false,
            message: "Cannot change your own admin role"
        });
    }
    
    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;
    
    await user.save();
    
    return res.status(200).send({
        success: true,
        message: "User updated successfully",
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status
        }
    });
});

// Delete user by admin
const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
        return res.status(404).send({
            success: false,
            message: "User not found"
        });
    }
    
    // Prevent deleting own account
    if (req.user._id.toString() === userId) {
        return res.status(400).send({
            success: false,
            message: "Cannot delete your own account"
        });
    }
    
    // Delete associated data based on role
    if (user.role === 'Organizer') {
        // Delete events created by this organizer
        const events = await Event.find({ organizer: userId });
        const eventIds = events.map(e => e._id);
        
        // Delete bookings for these events
        await Booking.deleteMany({ event: { $in: eventIds } });
        
        // Delete reviews for these events
        await Review.deleteMany({ event_id: { $in: eventIds } });
        
        // Delete events
        await Event.deleteMany({ organizer: userId });
    }
    
    // Delete user's bookings
    await Booking.deleteMany({ user: userId });
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    return res.status(200).send({
        success: true,
        message: "User deleted successfully"
    });
});
