import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const navigate = useNavigate();

  // Handle request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API}/user/forgot-password`,
        { email },
        { withCredentials: true }
      );

      if (response.data.success) {
        setOtpSent(true);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    }

    setIsLoading(false);
  };

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API}/user/reset-password`,
        { email, otp, newPassword },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/login");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reset password");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 pt-12 px-8">
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl w-[960px] flex justify-between gap-24">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl"></div>

        {/* Left Image */}
        <div className="relative z-10 hidden lg:flex lg:w-1/2 items-center justify-center">
          <img
            src="/images/login.svg"
            alt="Forgot Password"
            className="w-full h-auto max-w-[400px]"
          />
        </div>

        {/* Form */}
        <div className="relative z-10 w-full lg:w-1/2">
          <div className="text-center mb-8">
            <h1 className="text-white text-4xl font-bold mb-2">
              {otpSent ? "Reset Password" : "Forgot Password"}
            </h1>
            <p className="text-white/70 text-sm">
              {otpSent
                ? "Enter the OTP sent to your email and set a new password"
                : "Enter your email to receive OTP"}
            </p>
          </div>

          {!otpSent ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <Input
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                type="email"
                required
                className="text-white h-14 bg-white/10 border-white/20 placeholder:text-white/50"
              />

              <Button
                type="submit"
                disabled={isLoading}
                variant="brand"
                size="lg"
                className="w-full h-14"
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="text-center text-white/70 mb-4">
                <p>OTP sent to: {email}</p>
              </div>

              <Input
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                type="text"
                required
                className="text-white h-14 bg-white/10 border-white/20 placeholder:text-white/50"
              />

              <Input
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                type="password"
                required
                className="text-white h-14 bg-white/10 border-white/20 placeholder:text-white/50"
              />

              <Input
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                type="password"
                required
                className="text-white h-14 bg-white/10 border-white/20 placeholder:text-white/50"
              />

              <Button
                type="submit"
                disabled={isLoading}
                variant="brand"
                size="lg"
                className="w-full h-14"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-blue-300 hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;