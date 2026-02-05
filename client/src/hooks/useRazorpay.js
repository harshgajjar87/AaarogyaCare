import { useState } from 'react';
import { loadScript } from '../utils/scriptLoader';
import { createPaymentOrder, verifyPaymentAndBook } from '../api/paymentAPI';

const useRazorpay = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const processPayment = (bookingDetails) => {
        return new Promise(async (resolve, reject) => {
            setIsProcessing(true);
            try {
                console.log("Starting payment process with booking details:", bookingDetails);
                
                // Load Razorpay script
                console.log("Loading Razorpay script...");
                const isScriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

                if (!isScriptLoaded) {
                    setIsProcessing(false);
                    console.error("Failed to load Razorpay script");
                    return reject(new Error('Failed to load payment gateway'));
                }
                console.log("Razorpay script loaded successfully");

                // 1. Create a Razorpay order
                console.log("Creating payment order with amount:", bookingDetails.fees);
                const orderResponse = await createPaymentOrder(bookingDetails.fees);
                console.log("Order response:", orderResponse);
                
                // Check if order was created successfully
                if (!orderResponse || !orderResponse.order) {
                    setIsProcessing(false);
                    console.error("Invalid order response:", orderResponse);
                    return reject(new Error('Failed to create payment order'));
                }
                
                const { order } = orderResponse;

                // 2. Configure Razorpay options
                console.log("Configuring Razorpay options with order ID:", order.id);
                const options = {
                    key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_RbbXXNYeUDInu0',
                    amount: order.amount,
                    currency: "INR",
                    name: "AarogyaCare",
                    description: `Appointment with Dr. ${bookingDetails.doctorName}`,
                    order_id: order.id,
                    handler: async (response) => {
                        console.log("Payment successful, verifying payment with response:", response);
                        // 3. Verify payment and book appointment
                        try {
                            const verificationData = {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                bookingDetails: { ...bookingDetails, patientId: bookingDetails.patientId }
                            };
                            console.log("Sending verification data:", verificationData);
                            const verificationResponse = await verifyPaymentAndBook(verificationData);
                            console.log("Verification response:", verificationResponse);
                            
                            // Check if verification was successful
                            if (!verificationResponse || !verificationResponse.success) {
                                console.error("Payment verification failed:", verificationResponse);
                                return reject(verificationResponse?.message || "Payment verification failed");
                            }
                            
                            resolve(verificationResponse);
                        } catch (error) {
                            console.error("Error during payment verification:", error);
                            reject(error.response?.data || { message: "Payment verification failed" });
                        }
                    },
                    prefill: {
                        name: bookingDetails.name,
                        email: bookingDetails.email,
                    },
                    theme: {
                        color: "#3399cc"
                    },
                    modal: {
                        ondismiss: function() {
                            setIsProcessing(false);
                            console.log("Payment modal dismissed by user");
                            reject(new Error('Payment cancelled'));
                        }
                    }
                };

                // 4. Open Razorpay checkout
                console.log("Opening Razorpay checkout with options:", options);
                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (error) {
                setIsProcessing(false);
                console.error("Error in payment process:", error);
                console.error("Error response:", error.response);
                reject(error.response?.data || { message: "An error occurred during payment" });
            }
        });
    };

    return { processPayment, isProcessing };
};

export default useRazorpay;
