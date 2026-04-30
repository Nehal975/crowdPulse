import React from 'react'
import { Sparkles, Github, Twitter, Linkedin, Instagram, Mail } from "lucide-react"
import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="border-t border-white/10 py-12 glass-dark">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:grid md:grid-cols-4 gap-8 items-start justify-between">
          <div className="flex flex-col items-center md:items-start space-y-2 col-span-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CrowdPulse</span>
            </div>
            <p className="text-white/60 text-sm text-center md:text-left">Your ultimate platform for seamless event experiences.</p>
            <div className="flex items-center gap-3 mt-3">
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Platform</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/events" className="text-white/60 hover:text-white transition-colors text-sm">Events</Link>
              <Link to="/organizer/dashboard" className="text-white/60 hover:text-white transition-colors text-sm">For Organizers</Link>
              <Link to="/about-us" className="text-white/60 hover:text-white transition-colors text-sm">About Us</Link>
              <a href="#features" className="text-white/60 hover:text-white transition-colors text-sm">Features</a>
            </nav>
          </div>

          <div className="flex flex-col items-center md:items-start col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Documentation</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">API Reference</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Help Center</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Community</a>
            </nav>
          </div>

          <div className="flex flex-col items-center md:items-start col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Cookie Policy</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Contact</a>
            </nav>
          </div>
        </div>
        <div className="mt-10 text-center text-white/40 text-sm border-t border-white/10 pt-8">
          © {new Date().getFullYear()} CrowdPulse. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
