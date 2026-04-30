import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { bookTicket, checkSeatsAvailability, deleteMyEvent, deleteEventByAdmin, getBookings, getEventAnalytics, getEventById, getEvents, getEventSeatsAndTimings, getMyBookings, getMyEventById, getMyEvents, postEvent, updateMyEvent, updateEventByAdmin, getOrganizerSummary, getBookedEvents, getHostAnalysis } from "../controllers/events.controller.js";
import { geminiChatBot } from "../controllers/gemini.controller.js";

const router = Router();

// Public routes - no authentication required
router.get('/' , getEvents); // Root route for /api/events
router.get('/get-events' , getEvents);
router.get('/events' , getEvents); // Alias for frontend
router.get('/get-events/:id' , getEventById);
router.get('/get-seats-times/:id' , getEventSeatsAndTimings);
router.post('/check-seats' , checkSeatsAvailability);

// Protected routes - authentication required
router.post('/add-events' , authenticate , postEvent);
router.get('/get-my-bookings' , authenticate , getMyBookings)
router.get('/get-my-events' , authenticate , getMyEvents);
router.get('/get-my-events/:id' , authenticate , getMyEventById);
router.post('/update-my-event/:id' , authenticate , updateMyEvent);
router.delete('/delete-my-event/:id' , authenticate , deleteMyEvent);
router.get('/get-bookings' , authenticate , getBookings);
router.get('/get-booked-events' , authenticate , getBookedEvents);
router.get('/getOrganizerSummary' ,authenticate , getOrganizerSummary );
router.get('/analytics/:eventId' , authenticate , getEventAnalytics);
router.get('/host-analysis' , authenticate , getHostAnalysis);
router.post('/book-ticket' , authenticate , bookTicket);
router.post('/ask' , geminiChatBot)

// Admin routes
router.delete('/delete-event/:id' , authenticate , deleteEventByAdmin);
router.put('/update-event/:id' , authenticate , updateEventByAdmin);

export default router;
