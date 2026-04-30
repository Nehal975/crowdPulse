import mongoose from 'mongoose';
import { Booking } from "../models/bookings.model.js";
import { Event } from "../models/events.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import QRCode from 'qrcode';
import { areArraysEqual } from "../utils/arrayUtils.js";
import { confirmationFormat, mail } from "../utils/email.js";
import dayjs from 'dayjs';

// Get analytics for a specific event ( registrations vs capacity, day-wise graph, check-in rate, repeat attendees )
const getEventAnalytics = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  
  // Get the event to find total capacity
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }
  
  // Calculate total capacity from seatMap
  const totalCapacity = event.seatMap ? event.seatMap.length : 0;
  
  // MongoDB aggregation for various analytics
  const bookingAggregation = await Booking.aggregate([
    { $match: { event_id: mongoose.Types.ObjectId.createFromHexString(eventId) } },
    {
      $group: {
        _id: null,
        totalRegistrations: { $sum: 1 },
        checkedInCount: { $sum: { $cond: ["$ticket_redeem", 1, 0] } },
        totalRevenue: { $sum: "$paymentAmt" }
      }
    }
  ]);
  
  const totalRegistrations = bookingAggregation[0]?.totalRegistrations || 0;
  const checkedInCount = bookingAggregation[0]?.checkedInCount || 0;
  const totalRevenue = bookingAggregation[0]?.totalRevenue || 0;
  
  // Check-in rate (percentage)
  const checkInRate = totalRegistrations > 0 ? ((checkedInCount / totalRegistrations) * 100).toFixed(2) : 0;
  
  // Day-wise registration data for the graph
  const dayWiseRegistrations = await Booking.aggregate([
    { $match: { event_id: mongoose.Types.ObjectId.createFromHexString(eventId) } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$booking_dateTime" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  // Repeat attendees count (users who booked more than once for this event)
  const repeatAttendeesAggregation = await Booking.aggregate([
    { $match: { event_id: mongoose.Types.ObjectId.createFromHexString(eventId) } },
    {
      $group: {
        _id: "$user_id",
        bookingCount: { $sum: 1 }
      }
    },
    { $match: { bookingCount: { $gt: 1 } } },
    { $count: "repeatAttendees" }
  ]);
  
  const repeatAttendees = repeatAttendeesAggregation[0]?.repeatAttendees || 0;
  
  // Format day-wise data for Chart.js
  const registrationGraphData = dayWiseRegistrations.map(item => ({
    date: item._id,
    count: item.count
  }));
  
  return res.status(200).json({
    success: true,
    analytics: {
      totalRegistrations,
      totalCapacity,
      checkedInCount,
      checkInRate: parseFloat(checkInRate),
      repeatAttendees,
      totalRevenue,
      registrationGraphData
    }
  });
});

const getEvents = asyncHandler(async (req, res) => {
  let events = await Event.find({})
    .select("-users -totalBookings -totalRevenue -certificate")
    .populate("organizer", "username email");
  if (!events.length) {
    return res.status(400).send({
      message: "No Events Found",
      success: true,
    });
  }
  return res.status(200).send({
    events,
    message: "Events Found",
    success: true,
  });
});

const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await Event.findById(id).select(
    "-users -totalbookings -totalRevenue -certificate"
  );
  if (!event) {
    return res.status(400).send({
      message: "Event Not Found",
      success: false,
    });
  }
  return res.status(200).send({
    event,
    message: "Event Sent",
    success: true,
  });
});

const getEventSeatsAndTimings = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id).select("seats seatMap eventDateTime cost");

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found.",
    });
  }

  const formattedTimings = event.eventDateTime.map((dt) => {
    const dateObj = new Date(dt);
    return {
      date: dateObj.toLocaleDateString("en-CA"),
      time: dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  });

  return res.status(200).json({
    seats: event.seats,
    cost : event.cost,
    seatMap: event.seatMap,
    eventDateTime: formattedTimings,
    success: true,
    message: "Event seats and timings fetched successfully",
  });
});

const getMyEvents = asyncHandler(async(req , res) => {
  const userId = req.user.id ;
  const events = await Event.find({organizer : userId}).select("-seatMap")
  if(!events.length)
{
  return res.status(404).json({
    success : false , 
    message : "You have not created any events yet"
  }) ;
}
    return res.status(200).json({
    success: true,
    events,
    message: "Events you organized fetched successfully"
  });

});

const getMyEventById = asyncHandler(async(req , res) => {

  const userId = req.user.id ;
  const {id} = req.params ;

  const event = await Event.findOne({_id : id , organizer : userId});

  if(!event)
  {
    return res.status(404).json({
      success : false ,
      message : "Event not found"
    });
  }

  return res.status(200).json({
    success : true ,
    event ,
    message : "Event fetched successfully !"
  })
})

const postEvent = asyncHandler(async (req, res) => {
  if (req.user.role != "Organizer") {
    return res.status(400).send({
      message: "You need to create a new account for organizing events",
      success: false,
    });
  }
  const {
    title,
    description,
    location,
    eventType,
    banner,
    image ,
    eventDateTime,
    seats,
    seatMap,
    cost,
    certificate,
    special,
  } = req.body;

  if (
    !title ||
    !description ||
    !location ||
    !eventType ||
    !banner ||
    !eventDateTime ||
    !seats ||
    !cost
  ) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be provided.",
    });
  }

  let finalSeatMap = [];

  if (seats.type === "RowColumns") {
    const [rows, cols] = seats.value.split("x").map(Number);

    if (isNaN(rows) || isNaN(cols)) {
      return res.status(400).json({
        success: false,
        message: "Invalid RowColumns format. Use format like '10x8'.",
      });
    }

    for (let r = 0; r < rows; r++) {
      const rowLabel = String.fromCharCode(65 + r); // 'A' + r
      for (let c = 1; c <= cols; c++) {
        finalSeatMap.push({ seatLabel: `${rowLabel}${c}`, isBooked: false });
      }
    }
  } else if (seats.type === "direct") {
    if (!Array.isArray(seatMap) || seatMap.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Seat map is required when seats.type is 'direct'.",
      });
    }
    finalSeatMap = seatMap;
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid seats.type. Must be 'RowColumns' or 'direct'.",
    });
  }
  const user = await User.findById(req.user.id);
  const event = await Event.create({
    title,
    description,
    location,
    eventType,
    banner,
    image,
    eventDateTime,
    seats,
    seatMap: finalSeatMap,
    cost,
    certificate,
    special,
    organizer: req.user.id,
  });

  user.eventsOrganized.push(event._id);
  await user.save();

  return res.status(201).json({
    event,
    message: "Event Created Successfully",
    success: true,
  });
});

const updateMyEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const event = await Event.findOne({ _id: id, organizer: userId });

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event Not Found or you're not authorized to edit it."
    });
  }

  const updateData = { ...req.body };

  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true}
  );

  if (!updatedEvent) {
    return res.status(404).json({
      success: false,
      message: "Event could not be updated."
    });
  }

  return res.status(200).json({
    success: true,
    event: updatedEvent,
    message: "Event Updated Successfully"
  });
});

// Admin - Update any event
const updateEventByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event Not Found"
    });
  }

  const updateData = { ...req.body };

  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  );

  if (!updatedEvent) {
    return res.status(404).json({
      success: false,
      message: "Event could not be updated."
    });
  }

  return res.status(200).json({
    success: true,
    event: updatedEvent,
    message: "Event Updated Successfully by Admin"
  });
});

const deleteMyEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const event = await Event.findOne({ _id: id, organizer: userId });

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found "
    });
  }

  if (event.status !== 'upcoming') {
    return res.status(400).json({
      success: false,
      message: "Only upcoming events can be deleted",
    });
  }
  const existingBookings = await Booking.find({ event_id: id });

  if (existingBookings.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Event cannot be deleted because bookings already exist",
    });
  }
  
  await Event.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "Event deleted successfully",
  });
});

// Admin - Delete any event
const deleteEventByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const event = await Event.findById(id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found"
    });
  }
  
  // Delete associated bookings
  const bookings = await Booking.find({ event_id: id });
  const bookingIds = bookings.map(b => b._id);
  
  // Delete reviews for this event
  await Review.deleteMany({ event_id: id });
  
  // Delete the event
  await Event.findByIdAndDelete(id);
  
  return res.status(200).json({
    success: true,
    message: "Event deleted successfully by admin"
  });
});


//Organizer
const getBookings = asyncHandler(async(req , res) => {
  const userId = req.user.id ;

  const bookings = await Booking.find({ organizer_id : userId})
  .populate("user_id" , )
  .populate("event_id" , "title");

  if(!bookings.length)
  {
    return res.status(404).json({
      success : false , 
      message : "No bookings" 
    })
  }
    return res.status(200).json({
    success: true,
    bookings,
    message: "Bookings fetched successfully",
  });
});

//attendee
const getMyBookings = asyncHandler(async(req , res) => {
  const userId = req.user.id ;
  const bookings = await Booking.find({ user_id: userId })
    .populate("event_id", "title eventDateTime location image eventType");

    if (!bookings.length) {
    return res.status(404).json({
      success: false,
      message: "You have not booked any events",
    });
  }

  return res.status(200).json({
    success: true,
    bookings,
    message: "Your bookings fetched successfully",
  });
})

const getOrganizerSummary = asyncHandler(async (req , res) => {
  const organizerId =  req.user.id;

  let events = await Event.find({ organizer : organizerId });
  let sum = 0;
  for(let a of events){
      sum += a.totalBookings;
  }
  const bookings = await Booking.find({ organizer_id: organizerId }).select("paymentAmt");

  let totalRevenue = 0;
  for (let b of bookings) 
  {
    totalRevenue += b.paymentAmt;
  }
  const totalActiveEvents = await Event.countDocuments({
    organizer: organizerId,
    status: "active"
  });
  const totalUsers = await User.countDocuments({
    role : "Attendee"
  })

  return res.status(200).json({
    success: true,
    message: "Dashboard stats fetched",
    counts: {
      totalBookings : sum,
      totalRevenue,
      activeShows : totalActiveEvents,
      totalUsers
    }
  });
})


const checkSeatsAvailability = asyncHandler(async (req, res) => {
  const { event_id, seats } = req.body; // seats: array of seat labels, e.g. ['A1', 'A2']

  if (!event_id || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Event ID and seats array are required."
    });
  }

  const event = await Event.findById(event_id).select("seatMap");
  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found."
    });
  }

  const seatSet = new Set(seats);
  const alreadyBooked = event.seatMap
    .filter(seatObj => seatSet.has(seatObj.seatLabel) && seatObj.isBooked)
    .map(seatObj => seatObj.seatLabel);

  if (alreadyBooked.length > 0) {
    return res.status(400).json({
      success: true,
      available: false,
      alreadyBooked,
      message: `Some seats are already booked: ${alreadyBooked.join(', ')}`
    });
  }
  return res.status(200).json({
    success: true,
    available: true,
    message: "All selected seats are available."
  });
});
  
const generateTicketQR = async (data) => {
  const qrContent = JSON.stringify(data);
  return await QRCode.toDataURL(qrContent); // base64 image
};

const bookTicket = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { event_id, booking_dateTime, seats, payment_id, paymentAmt } = req.body;
  if (!event_id || !booking_dateTime || !seats || !payment_id || paymentAmt=== undefined || paymentAmt === null) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    });
  }

  const event = await Event.findById(event_id);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found.',
    });
  }

  const seatList = seats.split(',').map(s => s.trim());

  const invalidSeats = [];
  const updatedSeatMap = event.seatMap.map(seatObj => {
    if (seatList.includes(seatObj.seatLabel)) {
      if (seatObj.isBooked) {
        invalidSeats.push(seatObj.seatLabel);
      }
      return { ...seatObj, isBooked: true };
    }
    return seatObj;
  });

  if (invalidSeats.length > 0) {
    return res.status(400).json({
      success: false,
      message: `These seats are already booked: ${invalidSeats.join(', ')}`,
    });
  }

  // Save updated seat status
  event.seatMap = updatedSeatMap;
  await event.save();
  const organizer_id = event.organizer;
  const qrCodeData = {
    event: event_id,
    user: user_id,
    seats: seatList,
    time: booking_dateTime,
    payment: payment_id
  };
  const qrCode = await generateTicketQR(qrCodeData);
  const booking = await Booking.create({
    user_id,
    event_id,
    event_title : event.title,
    organizer_id,
    booking_dateTime,
    seats: seatList.join(','),
    ticket_qr: qrCode,
    payment_id,
    paymentAmt
  });
  event.totalBookings = (event.totalBookings || 0) + seatList.length;
  event.totalRevenue = (event.totalRevenue || 0) + Number(paymentAmt);
  await event.save();

  res.status(201).json({
    success: true,
    message: 'Booking successful!',
    booking
  });
const base64Data = booking.ticket_qr.split(',')[1]; 

const htmlContent = confirmationFormat(
  event.title,
  booking.booking_dateTime,
  booking.seats,
  req.user.email,
  booking.ticket_qr, 
  booking.payment_id,
  booking.paymentAmt
);

const finalHtml = htmlContent.replace(
  "{{TICKET_QR}}",
  `<img src="cid:ticketqr" alt="Ticket QR" style="width: 200px;" />`
);


const content = {
  to: req.user.email,
  subject: "Confirmation of Ticket",
  html: finalHtml,
  attachments: [
    {
      filename: "ticketqr.png",
      content: base64Data,
      encoding: "base64",
      cid: "ticketqr", 
    },
  ],
};

  await mail(content);
});

const getBookedEvents = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const bookings = await Booking.find({ user_id: userId }).populate({
    path: 'event_id',
    select: 'title banner status eventDateTime'
  });

  const validEvents = bookings
    .filter(b => b.event_id)
    .map(b => b.event_id); 

  res.status(200).send({
    success: true,
    message: 'Booked events fetched successfully',
    count: validEvents.length,
    data: validEvents,
  });
});

const getHostAnalysis = asyncHandler(async (req, res) => {
  const hostId = req.user.id;

  // Get all events hosted by this organizer
  const events = await Event.find({ organizer: hostId });

  if (!events || events.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No events found",
      analysis: {
        totalEvents: 0,
        totalRevenue: 0,
        totalBookings: 0,
        totalAttendees: 0,
        averageTicketPrice: 0,
        revenueByEvent: [],
        bookingsByEvent: [],
        eventStatusBreakdown: { upcoming: 0, active: 0, completed: 0 },
        revenueTrend: [],
        topPerformingEvent: null,
        lowestPerformingEvent: null,
        capacityUtilization: 0
      }
    });
  }

  // Get all bookings for all events hosted by this organizer
  const eventIds = events.map(e => e._id);
  const bookings = await Booking.find({ event_id: { $in: eventIds } });

  // Calculate total revenue (from events collection for accuracy)
  const totalRevenue = events.reduce((sum, e) => sum + (e.totalRevenue || 0), 0);

  // Calculate total bookings
  const totalBookings = events.reduce((sum, e) => sum + (e.totalBookings || 0), 0);

  // Get unique attendees
  const uniqueAttendees = new Set(bookings.map(b => b.user_id?.toString())).size;

  // Calculate average ticket price
  const averageTicketPrice = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Revenue and bookings by event
  const revenueByEvent = events.map(e => ({
    eventId: e._id,
    title: e.title,
    revenue: e.totalRevenue || 0,
    bookings: e.totalBookings || 0
  })).sort((a, b) => b.revenue - a.revenue);

  // Event status breakdown
  const eventStatusBreakdown = {
    upcoming: events.filter(e => e.status === 'upcoming').length,
    active: events.filter(e => e.status === 'active').length,
    completed: events.filter(e => e.status === 'completed').length
  };

  // Revenue trend (month-wise for last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyRevenue = {};
  const monthlyBookings = {};

  bookings.forEach(booking => {
    if (booking.booking_dateTime) {
      const monthKey = new Date(booking.booking_dateTime).toISOString().slice(0, 7); // YYYY-MM
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (booking.paymentAmt || 0);
      monthlyBookings[monthKey] = (monthlyBookings[monthKey] || 0) + 1;
    }
  });

  const revenueTrend = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
    month,
    revenue,
    bookings: monthlyBookings[month] || 0
  })).sort((a, b) => a.month.localeCompare(b.month));

  // Top and lowest performing events
  const sortedByRevenue = [...revenueByEvent].sort((a, b) => b.revenue - a.revenue);
  const topPerformingEvent = sortedByRevenue[0] || null;
  const lowestPerformingEvent = sortedByRevenue[sortedByRevenue.length - 1] || null;

  // Capacity utilization
  let totalCapacity = 0;
  let totalBookedSeats = 0;
  events.forEach(event => {
    if (event.seatMap) {
      totalCapacity += event.seatMap.length;
      totalBookedSeats += event.seatMap.filter(seat => seat.isBooked).length;
    }
  });
  const capacityUtilization = totalCapacity > 0 ? ((totalBookedSeats / totalCapacity) * 100).toFixed(2) : 0;

  return res.status(200).json({
    success: true,
    message: "Host analysis fetched successfully",
    analysis: {
      totalEvents: events.length,
      totalRevenue,
      totalBookings,
      totalAttendees: uniqueAttendees,
      averageTicketPrice: parseFloat(averageTicketPrice.toFixed(2)),
      revenueByEvent,
      eventStatusBreakdown,
      revenueTrend,
      topPerformingEvent,
      lowestPerformingEvent,
      capacityUtilization: parseFloat(capacityUtilization)
    }
  });
});


export { getEvents, getEventById, postEvent, getEventSeatsAndTimings , getMyEvents , getMyEventById , updateMyEvent , updateEventByAdmin , deleteMyEvent , deleteEventByAdmin , getBookings , getMyBookings , getOrganizerSummary ,  bookTicket , checkSeatsAvailability  , getBookedEvents, getHostAnalysis, getEventAnalytics};