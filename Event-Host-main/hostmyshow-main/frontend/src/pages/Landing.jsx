import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { 
  ArrowRight, 
  Play, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Shield, 
  BarChart3,
  Users,
  Award,
  Zap,
  Ticket,
  MessageSquare,
  TrendingUp,
  CheckCircle2
} from "lucide-react"
import { Link } from "react-router-dom"
import axios from "axios"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const Landing = () => {
  const [testimonials , setTestimonials] = useState([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API}/review/top`);
        console.log("fetched testimonials : " , response.data);
        setTestimonials(response.data.reviews || []);
      } catch (error) {
        console.error("failed to fetch testimonials", error);
      }
    };

    fetchTestimonials();
  }, []);


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative">
        {/* Animated background elements */}
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-40 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <motion.div 
          className="max-w-4xl mx-auto relative z-10"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <Badge 
              variant="secondary" 
              className="mb-6 px-4 py-2 glass text-indigo-300 border-indigo-500/30 hover:border-indigo-500/50 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              AI-Powered Event Management
            </Badge>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold mb-6 text-white">
            Plan. Host. Experience.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              The Future of Events.
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            AI-powered platform to create, manage, and elevate events like never before. From hackathons to conferences,
            make every moment extraordinary.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/organizer/dashboard">
              <Button
                size="lg"
                variant="gradient"
                className="px-8 py-6 text-lg hover:scale-105 transition-transform duration-300"
              >
                Create Event
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to='/events'>
              <Button
                variant="outline-modern"
                size="lg"
                className="px-8 py-6 text-lg"
              >
                <Play className="mr-2 w-5 h-5" />
                Join Event
              </Button>
            </Link>
          </motion.div>

          {/* Platform Preview */}
          <motion.div variants={fadeInUp} className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 blur-3xl -z-10" />
            <Card className="p-8 glass border-indigo-500/20 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="glass-dark rounded-lg p-4 border border-indigo-500/20">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                      <div className="w-3 h-3 bg-red-400 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-indigo-500/20 rounded w-3/4" />
                      <div className="h-4 bg-indigo-500/20 rounded w-1/2" />
                      <div className="h-6 bg-indigo-500/30 rounded w-full" />
                    </div>
                  </div>
                  <p className="text-sm text-white/60">Web Dashboard</p>
                </div>
                <div className="space-y-4">
                  <div className="glass-dark rounded-2xl p-4 border border-indigo-500/20 max-w-xs mx-auto">
                    <div className="space-y-3">
                      <div className="h-3 bg-indigo-500/20 rounded w-full" />
                      <div className="h-3 bg-indigo-500/20 rounded w-2/3" />
                      <div className="h-8 bg-indigo-500/30 rounded-lg w-full" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-6 bg-indigo-500/20 rounded" />
                        <div className="h-6 bg-indigo-500/20 rounded" />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-white/60">Mobile App</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-white">Everything you need to create extraordinary events</h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Comprehensive tools to manage your events from start to finish
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 glass border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Event Tiers</h3>
                <p className="text-white/60">
                  Choose from Elite, Prime, Spotlight, and Sponsored tiers to get the perfect visibility
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 glass border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Smart Ticketing</h3>
                <p className="text-white/60">
                  Secure QR-based tickets, flexible seat selection, and automated confirmations
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 glass border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Marketing & Analytics</h3>
                <p className="text-white/60">
                  Email campaigns, feedback system, and comprehensive booking analytics
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 glass border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Organizer Dashboard</h3>
                <p className="text-white/60">
                  Manage events, track bookings, and access revenue insights
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 glass border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Certificates & Custom Sites</h3>
                <p className="text-white/60">
                  Generate certificates and create custom event pages
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 glass border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">AI Assistant</h3>
                <p className="text-white/60">
                  AI-powered chatbot for attendee support
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 border border-white/10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Ticket className="w-8 h-8 mx-auto text-indigo-400" />
              <div className="text-4xl font-bold text-white">10K+</div>
              <div className="text-white/60">Events Hosted</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Users className="w-8 h-8 mx-auto text-purple-400" />
              <div className="text-4xl font-bold text-white">50K+</div>
              <div className="text-white/60">Active Users</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <TrendingUp className="w-8 h-8 mx-auto text-green-400" />
              <div className="text-4xl font-bold text-white">1M+</div>
              <div className="text-white/60">Tickets Sold</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <Star className="w-8 h-8 mx-auto text-yellow-400" />
              <div className="text-4xl font-bold text-white">98%</div>
              <div className="text-white/60">Satisfaction</div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="max-w-3xl mx-auto glass rounded-3xl p-12 border border-indigo-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
            <div className="relative z-10">
              <Zap className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
              <h2 className="text-4xl font-bold mb-4 text-white">Ready to get started?</h2>
              <p className="text-xl text-white/60 mb-8">
                Join thousands of event organizers who have transformed their events with CrowdPulse
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/sign-up">
                  <Button size="xl" variant="gradient" className="px-8">
                    Create Free Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/about-us">
                  <Button size="xl" variant="outline-modern" className="px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
