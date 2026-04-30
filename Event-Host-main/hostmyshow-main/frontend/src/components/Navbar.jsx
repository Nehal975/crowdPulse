import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { userStore } from "@/context/userContext";
import axios from "axios";
import toast from "react-hot-toast";
import { ChevronDown, User, LogOut, LayoutDashboard, Menu, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const isAuth = userStore((state) => state.isAuth);
  const user = userStore((state) => state.user);
  const logout = userStore((state) => state.logout);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API}/user/logout`);
      if(res.data.success){
          logout();
          toast.success("Logout Successful");
          navigate("/login");
      }
    } catch (error) {
        console.log(error);
        toast.error("Error Occured");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
      <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/">
            <motion.span 
              className="text-2xl font-bold text-white tracking-tight hover:scale-105 transition-transform duration-300 inline-block cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-indigo-400">Crowd</span>Pulse
            </motion.span>
          </Link>
        </div>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-1">
          <Link 
            to="/" 
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            Home
          </Link>
          <Link 
            to="/events" 
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            Events
          </Link>
          <Link 
            to="/my-bookings" 
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            Bookings
          </Link>
          {isAuth && user?.role === "admin" && (
            <Link 
              to="/admin" 
              className="px-4 py-2 text-sm font-semibold text-yellow-400 hover:text-yellow-300 hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              Admin Dashboard
            </Link>
          )}
          <Link 
            to="/about-us" 
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            About Us
          </Link>
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-white/70 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* If NOT logged in */}
          {!isAuth && (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white/90 hover:text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button 
                  variant="brand" 
                  size="sm"
                  className="shadow-md"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* If logged in */}
          {isAuth && (
            <div className="relative" ref={dropdownRef}>
              {/* Profile Button */}
              <motion.button
                onClick={() => setShowDropdown(!showDropdown)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </div>
                <ChevronDown className="w-4 h-4 mr-1 opacity-70" />
              </motion.button>

              {/* Dropdown menu */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-64 rounded-xl shadow-xl glass border border-white/10 overflow-hidden"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3.5 border-b border-white/10 bg-white/5">
                      <p className="text-sm text-white/60">Welcome back,</p>
                      <p className="font-semibold text-white truncate">{user?.username}</p>
                      <p className="text-xs text-white/50 truncate">{user?.email}</p>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-yellow-400 hover:text-yellow-300 hover:bg-white/10 transition-all"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      
                      {user?.role === "Organizer" && (
                        <Link
                          to="/organizer/dashboard"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Organizer Dashboard
                        </Link>
                      )}
                    </div>
                    
                    {/* Logout Button */}
                    <div className="border-t border-white/10 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-2">
              <Link 
                to="/" 
                className="block px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/events" 
                className="block px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link 
                to="/my-bookings" 
                className="block px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bookings
              </Link>
              <Link 
                to="/about-us" 
                className="block px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              
              {!isAuth && (
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                  </Link>
                  <Link to="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="brand" className="w-full justify-start">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
