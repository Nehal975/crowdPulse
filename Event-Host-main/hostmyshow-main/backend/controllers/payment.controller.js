import { razorpayInstance } from "../index.js";
import { Payment } from "../models/payment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";


// ✅ CREATE ORDER
const createOrder = asyncHandler(async (req, res) => {

    const { amount, eventId, userId } = req.body;

    try {

        // ✅ FREE EVENT BOOKING (₹0)
        if (Number(amount) === 0) {

            const payment = new Payment({

                razorpay_order_id: "FREE_" + crypto.randomBytes(5).toString("hex"),

                razorpay_payment_id: "FREE_PAYMENT",

                razorpay_signature: "FREE_SIGNATURE",

                amount: 0,

                event: eventId,

                user: userId,

                status: "completed"

            });

            await payment.save();

            return res.status(200).json({

                success: true,

                freeEvent: true,

                message: "Free event booked successfully",

                payment

            });

        }


        // ✅ PAID EVENT → Razorpay
        const options = {

            amount: Number(amount * 100),

            currency: "INR",

            receipt: crypto.randomBytes(10).toString("hex"),

        };

        razorpayInstance.orders.create(options, (error, order) => {

            if (error) {

                console.log(error);

                return res.status(500).json({

                    success: false,

                    message: "Razorpay order creation failed",

                });

            }

            res.status(200).json({

                success: true,

                freeEvent: false,

                order,

            });

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

        console.log(error);

    }

});



// ✅ VERIFY PAYMENT (ONLY FOR PAID EVENTS)
const verifyPayment = asyncHandler(async (req, res) => {

    const {

        razorpay_order_id,

        razorpay_payment_id,

        razorpay_signature,

        eventId,

        userId,

        amount

    } = req.body;

    try {

        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(sign.toString())
            .digest("hex");

        const isAuthentic = expectedSign === razorpay_signature;

        if (isAuthentic) {

            const payment = new Payment({

                razorpay_order_id,

                razorpay_payment_id,

                razorpay_signature,

                event: eventId,

                user: userId,

                amount,

                status: "completed"

            });

            await payment.save();

            return res.status(200).json({

                success: true,

                message: "Payment successful",

                payment

            });

        } else {

            return res.status(400).json({

                success: false,

                message: "Invalid signature"

            });

        }

    } catch (error) {

        res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

        console.log(error);

    }

});


export { createOrder, verifyPayment };