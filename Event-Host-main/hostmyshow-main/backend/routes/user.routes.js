import { Router } from "express";
import { getUserProfile, login, register, verifyOtp , logout, requestPasswordReset, resetPassword, registerAdmin, getAdminDashboardStats, getAllUsers, updateUser, deleteUser, updateUserInterests } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();
router.post("/register" , register);
router.post("/otp-verify" , verifyOtp);
router.post("/login" , login);
router.get("/getUserProfile" , authenticate ,  getUserProfile);
router.post('/logout' , logout);

// Update user interests
router.put('/interests', authenticate, updateUserInterests);

// Password reset routes
router.post("/forgot-password" , requestPasswordReset);
router.post("/reset-password" , resetPassword);

// Admin routes
router.post("/admin-register", registerAdmin);
router.get("/admin-dashboard-stats", authenticate, getAdminDashboardStats);
router.get("/all", authenticate, getAllUsers);
router.put("/:userId", authenticate, updateUser);
router.delete("/:userId", authenticate, deleteUser);

export default router;
