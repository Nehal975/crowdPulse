import React, { useEffect } from 'react'
import { Calendar, MapPin, Ticket } from 'lucide-react'
import { useState } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { userStore } from '@/context/userContext';

const Checkout = () => {
  const { id } = useParams();
  const location = useLocation();
  const [event, setEvent] = useState({})
  const user = userStore((state) => state.user);

  // Get data passed from Seats page
  const {
    selectedSeats = [],
    selectedTiming = '',
    totalAmount = 0,
    ticketCost = 0,
    eventData = null
  } = location.state || {};
  
  const [amount, setamount] = useState(totalAmount);
  const [ticketData, setTicketData] = useState(null); 
  const [showTicketOptions, setShowTicketOptions] = useState(false); 
  if (!location.state) {
    console.log('No data received, redirecting to events');
    window.location.href = '/events';
    return null;
  }

  // Free booking handler
  const handleFreeBooking = async () => {
  try {
    let checkSeats = await axios.post(`${import.meta.env.VITE_API}/events/check-seats`, {
      event_id: id,
      seats: selectedSeats
    }, { withCredentials: true }); // <-- Add this if check-seats also needs auth

    const ticket = await axios.post(`${import.meta.env.VITE_API}/events/book-ticket`, {
      event_id: id,
      booking_dateTime: new Date().toISOString(),
      seats: selectedSeats.join(','),
      payment_id: "FREE_EVENT",
      paymentAmt: 0
    }, { withCredentials: true }); // <-- THIS IS IMPORTANT

    if (!ticket.data.success) {
      toast.error(ticket.data.message);
      return;
    }
    toast.success(ticket.data.message || "Ticket booked successfully!");
    setTicketData(ticket.data.booking);
    setShowTicketOptions(true);
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to book free ticket");
  }
};

  const handlePayment = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API}/payment/order`, {
        amount,
        eventId: id,
        userId: user?._id
      }, { withCredentials: true });
      
      if (res.data.freeEvent) {
        // Free event - handle directly
        handleFreeBooking();
        return;
      }
      
      handlePaymentVerify(res.data.order);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to create payment order");
    }
  }
  
  const handlePaymentVerify = async (data) => {
    try {
      // First check seat availability
      let checkSeats = await axios.post(`${import.meta.env.VITE_API}/events/check-seats`, {
        event_id : id,
        seats : selectedSeats
      }, { withCredentials: true });
      
      if (!checkSeats.data.success) {
        toast.error(checkSeats.data.message);
        return;
      }
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "HostMyShow",
        description: "Event Booking Payment",
        image: "https://cdn-icons-png.flaticon.com/512/2534/2534204.png",
        order_id: data.id,
        theme: {
          color: "#6366f1",
          hide_topbar: false
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        handler: async (response) => {
          try {
            // First book the ticket
            const ticket = await axios.post(`${import.meta.env.VITE_API}/events/book-ticket`, {
              event_id: id,
              booking_dateTime: new Date().toISOString(),
              seats: selectedSeats.join(','),
              payment_id: response.razorpay_payment_id,
              paymentAmt: finalTotal
            }, { withCredentials: true });

            if(!ticket.data.success){
              toast.error(ticket.data.message);
              return;
            }
            
            // Then verify the payment
            const res = await axios.post(`${import.meta.env.VITE_API}/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              eventId: id,
              userId: user?._id,
              amount: finalTotal
            }, { withCredentials: true });

            if (res.data.success) {
              toast.success("Payment successful!");
              setTicketData(ticket.data.booking); 
              setShowTicketOptions(true); 
            }
          } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Payment verification failed");
          }
        },
        "modal": {
          "ondismiss": function() {
            console.log("Payment modal dismissed");
          }
        },
        theme: {
          color: "#5f63b8"
        }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
      
      // Handle payment failure
      rzp1.on('payment.failed', function (response) {
        toast.error(response.error.description || "Payment failed");
        console.log(response.error);
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Payment initialization failed");
    }
  }
  const fetchEvent = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/events/get-events/${id}`);
      setEvent(response.data.event);
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(()=> {
    fetchEvent();
  },[])
  
  // Allow seatPrice to be 0 if ticketCost is 0
  const seatPrice = ticketCost !== undefined && ticketCost !== null ? ticketCost : 0;
  // No extra fees for free events
  const convenienceFee = 0;
  const finalTotal = selectedSeats.length * seatPrice + convenienceFee;

  const formatDate = (date) => {
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }
  const formatTime = (date) => {
    const dateObj = new Date(date);
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    let seconds = dateObj.getSeconds();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return `${hours}:${minutes}:${seconds}`;
  };

  // PDF generation function
  const generatePDF = () => {
    if (!ticketData) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#3b82f6');
    doc.text('Host', 40, 60);
    doc.setTextColor('#22223b');
    doc.text('MyShow', 100, 60);

    doc.setFontSize(20);
    doc.setTextColor('#22223b');
    doc.text(ticketData.event_title || 'Event', 40, 100);

    doc.setFontSize(12);
    let y = 130;
    doc.text(`Date & Time: ${formatDate(event.eventDateTime)} ${formatTime(event.eventDateTime)}`, 40, y);
    y += 20;
    doc.text(`Venue: ${event.location}`, 40, y);
    y += 20;
    doc.text(`Screen: SCREEN 1`, 40, y);
    y += 20;
    doc.text(`Seats: ${ticketData.seats}`, 40, y);
    y += 20;
    doc.text(`Booking ID: ${ticketData._id || ticketData.booking_id || ''}`, 40, y);
    y += 20;
    doc.text(`Amount Paid: ₹${ticketData.paymentAmt}`, 40, y);
    y += 30;

    if (ticketData.ticket_qr) {
      doc.text('Scan for entry:', 40, y);
      y += 10;
      doc.addImage(ticketData.ticket_qr, 'PNG', 40, y, 100, 100);
      y += 110;
    }

    doc.setFontSize(13);
    doc.setTextColor('#3b82f6');
    doc.text('Enjoy your show! Please arrive 15 minutes early. For support, contact HostMyShow.', 40, y + 30);

    doc.save(`HostMyShow_Ticket_${ticketData._id || 'booking'}.pdf`);
  };

  // Web Share API for PDF
  const sharePDF = async () => {
    if (!ticketData) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#3b82f6');
    doc.text('Host', 40, 60);
    doc.setTextColor('#22223b');
    doc.text('MyShow', 100, 60);
    doc.setFontSize(20);
    doc.setTextColor('#22223b');
    doc.text(ticketData.event_title || 'Event', 40, 100);
    doc.setFontSize(12);
    let y = 130;
    doc.text(`Date & Time: ${event.date} ${event.time}`, 40, y);
    y += 20;
    doc.text(`Venue: ${event.location}`, 40, y);
    y += 20;
    doc.text(`Screen: SCREEN 1`, 40, y);
    y += 20;
    doc.text(`Seats: ${ticketData.seats}`, 40, y);
    y += 20;
    doc.text(`Booking ID: ${ticketData._id || ticketData.booking_id || ''}`, 40, y);
    y += 20;
    doc.text(`Amount Paid: ₹${ticketData.paymentAmt}`, 40, y);
    y += 30;
    if (ticketData.ticket_qr) {
      doc.text('Scan for entry:', 40, y);
      y += 10;
      doc.addImage(ticketData.ticket_qr, 'PNG', 40, y, 100, 100);
      y += 110;
    }
    doc.setFontSize(13);
    doc.setTextColor('#3b82f6');
    doc.text('Enjoy your show! Please arrive 15 minutes early. For support, contact HostMyShow.', 40, y + 30);
    const pdfBlob = doc.output('blob');
    if (navigator.share) {
      const file = new File([pdfBlob], `HostMyShow_Ticket_${ticketData._id || 'booking'}.pdf`, { type: 'application/pdf' });
      try {
        await navigator.share({
          files: [file],
          title: 'Your HostMyShow Ticket',
          text: 'Here is your ticket!'
        });
      } catch (err) {
        toast.error('Sharing cancelled or failed.');
      }
    } else {
      toast.error('Sharing not supported on this device.');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 ">
      <div className="glass rounded-2xl shadow-xl p-8 w-full max-w-2xl flex flex-col items-center border border-blue-400/20">
        <h2 className="text-3xl font-bold text-white mb-8">Confirm Your Booking</h2>

        {/* Event Details Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 w-full mb-8 pb-8 border-b border-blue-400/20">
          <img src={event.banner} alt={event.title} className="w-32 h-44 object-cover rounded-lg shadow-lg border-2 border-blue-500" />
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
            <p className="text-blue-200 text-sm flex items-center justify-center md:justify-start gap-2 mb-1">
              <Calendar className="w-4 h-4" /> {formatDate(event.eventDateTime)}
            </p>
            <p className="text-blue-200 text-sm flex items-center justify-center md:justify-start gap-2 mb-1">
              <MapPin className="w-4 h-4" /> {event.location}
            </p>
            <p className="text-blue-300 text-xs mt-2"> Category : {event.eventType}</p>
          </div>
        </div>

        {/* Booking Summary Section */}
        <div className="w-full mb-8">
          <h4 className="text-xl font-semibold text-white mb-4">Booking Summary</h4>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-blue-200">
              <span>Seats ({selectedSeats.length})</span>
              <span className="font-semibold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4" /> {selectedSeats.join(', ')}
              </span>
            </div>
            <div className="flex justify-between text-blue-200">
              <span>Price per seat</span>
              <span className="font-semibold text-white">₹{seatPrice}</span>
            </div>
            <div className="flex justify-between text-blue-200">
              <span>Convenience Fee</span>
              <span className="font-semibold text-white">₹{convenienceFee}</span>
            </div>
          </div>

          <div className="w-full flex justify-between items-center text-white font-bold text-2xl pt-4 border-t border-blue-400/20">
            <span>Total Payable</span>
            <span className="flex items-center gap-2">
              <span className="w-5 h-5" /> ₹{finalTotal}
            </span>
          </div>
        </div>

        {/* Payment or Free Booking Button */}
        {!showTicketOptions && (
        <div className="relative w-full p-1 rounded-lg overflow-hidden shining-border">
          {finalTotal === 0 ? (
            <button
              type="button" // Prevent form submit
              onClick={handleFreeBooking}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors shadow-lg text-xl relative z-10"
            >
              Book Free Ticket
            </button>
          ) : (
            <button
              type="button" // Prevent form submit
              onClick={handlePayment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors shadow-lg text-xl relative z-10"
            >
              Proceed to Payment
            </button>
          )}
        </div>
        )}


        {showTicketOptions && (
          <div className="flex flex-col items-center mt-8">
            <button onClick={generatePDF} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg mb-3">Download Ticket (PDF)</button>
            <button onClick={sharePDF} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">Share Ticket</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;