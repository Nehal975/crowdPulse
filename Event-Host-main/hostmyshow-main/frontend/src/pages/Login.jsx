import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { userStore } from "@/context/userContext";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, Sparkles, Calendar, Users } from "lucide-react";
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleSignInButton = ({ onSuccess, onError }) => {
  const login = useGoogleLogin({
    onSuccess,
    onError,
    clientId: GOOGLE_CLIENT_ID,
    scope: 'email profile',
    prompt: 'select_account',
  });

  return (
    <Button
      type="button"
      variant="outline-modern"
      className="flex-1 h-11"
      onClick={() => login()}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Google
    </Button>
  );
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isAuth = userStore((state) => state.isAuth);
  const login = userStore((state) => state.login);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API}/auth/google`,
        { token: credentialResponse.credential },
        { withCredentials: true }
      );

      const user = response.data.user;
      const token = response.data.token;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      await login(user);
      toast.success(response.data.message);

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Google login failed");
    }
    setIsLoading(false);
  };

  const handleGoogleError = (error) => {
    console.error("Google login error:", error);
    toast.error("Google login failed. Please try again.");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API}/user/login`,
        formData,
        { withCredentials: true }
      );

      const user = response.data.user;
      const token = response.data.token;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      await login(user);
      toast.success(response.data.message);

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (isAuth) {
      const user = JSON.parse(localStorage.getItem("user"));
      navigate(user?.role === "admin" ? "/admin" : "/");
    }
  }, [isAuth, navigate]);

  if (isAuth) {
    return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, -100, 0], 
            y: [0, -50, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-gradient-to-l from-blue-500/15 to-cyan-500/15 rounded-full blur-3xl"
          animate={{ 
            x: [0, -80, 80, 0], 
            y: [0, 40, -40, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative backdrop-blur-2xl bg-black/40 border border-white/10 rounded-3xl p-10 shadow-2xl w-[960px] flex gap-20 max-lg:w-full max-lg:flex-col max-lg:gap-10 max-lg:p-8"
      >

        {/* Left Image */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="hidden lg:flex lg:w-1/2 items-center justify-center"
        >
          <motion.img
            src="/images/login.svg"
            alt="Login"
            className="max-w-[400px] drop-shadow-2xl"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Form */}
        <div className="w-full lg:w-1/2 text-white">

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
                Welcome Back
              </h1>
            </div>
            <p className="text-white/50">Sign in to continue your journey</p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <motion.div whileFocus={{ scale: 1.01 }}>
              <label className="text-sm text-white/70 mb-2 block">Email Address</label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                type="email"
                required
                className="h-12 bg-white/5 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </motion.div>

            {/* Password with toggle */}
            <div className="relative">
              <label className="text-sm text-white/70 mb-2 block">Password</label>
              <Input
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                required
                className="h-12 bg-white/5 border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20 pr-12"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-9 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] hover:bg-[length:100%_100%] text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </motion.div>
                ) : (
                  <motion.span
                    key="signin"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Sign In
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black/40 text-white/40">or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <div className="flex gap-4">
                <GoogleSignInButton 
                  onSuccess={handleGoogleLogin} 
                  onError={handleGoogleError} 
                />
                <Button
                  type="button"
                  variant="outline-modern"
                  className="flex-1 h-11"
                >
                  <Users className="w-5 h-5" />
                  Continue as Guest
                </Button>
              </div>
            </GoogleOAuthProvider>

            {/* Sign Up Link */}
            <p className="text-center text-white/50 mt-6">
              Don't have an account?{" "}
              <Link 
                to="/sign-up" 
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Sign up now
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
