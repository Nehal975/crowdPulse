HostMyShow - Event Management & Ticketing Platform
Overview

HostMyShow is a full-featured event management and ticket booking platform built using the MERN stack. It allows users to explore and book events, while organizers can create and manage their shows. Admins oversee event approvals, ensuring a smooth and trusted experience. The platform includes OTP-based login, role-based access, and a clean, responsive UI using modern design principles like glassmorphism.

Table of Contents
Tech Stack
Features
Installation and Setup
Project Structure
Environment Variables
Known Issues
Future Improvements
About Me
License
Tech Stack
Frontend
React + Vite
Tailwind CSS (Glassmorphism UI)
React Router DOM
Context API / Zustand
Lucide React
Radix UI & shadcn/ui
Backend
Node.js + Express.js
MongoDB + Mongoose
JWT Authentication
Axios
Nodemailer for OTP verification
Features
User Features
Browse upcoming events
Search and filter events
Book tickets online
OTP-based secure login
View booking history and tickets
Organizer Features
Organizer registration and login
Create, update, and delete events
Manage bookings and attendees
View analytics and booking statistics
Admin Features
Approve or reject events
Manage users and organizers
Monitor overall platform activities
Common Features
Role-based authentication and routing
Responsive glassmorphism UI
Toast notifications
Secure API integration
Smooth navigation experience
Installation and Setup
Prerequisites

Before starting, make sure you have:

Node.js (v14 or higher)
MongoDB Atlas account or local MongoDB setup
Git installed on your system



# Project Structure
hostmyshow/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── assets/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── config/
│
└── README.md
