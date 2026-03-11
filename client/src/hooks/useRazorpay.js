import { useState } from 'react';
import { loadScript } from '../utils/scriptLoader';
import { createPaymentOrder, verifyPaymentAndBook } from '../api/paymentAPI';

const useRazorpay = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const processPayment = (bookingDetails) => {
        return new Promise(async (resolve, reject) => {
            setIsProcessing(true);
            try {
                // Load Razorpay script
                const isScriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

                if (!isScriptLoaded) {
                    setIsProcessing(false);
                    console.error("Failed to load Razorpay script");
                    return reject(new Error('Failed to load payment gateway'));
                }

                // 1. Create a Razorpay order
                const orderResponse = await createPaymentOrder(bookingDetails.fees);
                
                // Check if order was created successfully
                if (!orderResponse || !orderResponse.order) {
                    setIsProcessing(false);
                    console.error("Invalid order response");
                    return reject(new Error('Failed to create payment order'));
                }
                
                const { order } = orderResponse;

                // 2. Configure Razorpay options
                const options = {
                    key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_RbbXXNYeUDInu0',
                    amount: order.amount,
                    currency: "INR",
                    name: "AarogyaCare",
                    description: `Appointment with Dr. ${bookingDetails.doctorName}`,
                    order_id: order.id,
                    handler: async (response) => {
                        // 3. Verify payment and book appointment
                        try {
                            const verificationData = {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                bookingDetails: { ...bookingDetails, patientId: bookingDetails.patientId }
                            };
                            const verificationResponse = await verifyPaymentAndBook(verificationData);
                            
                            // Check if verification was successful
                            if (!verificationResponse || !verificationResponse.success) {
                                console.error("Payment verification failed");
                                return reject(verificationResponse?.message || "Payment verification failed");
                            }
                            
                            resolve(verificationResponse);
                        } catch (error) {
                            console.error("Error during payment verification:", error.message);
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
                            reject(new Error('Payment cancelled'));
                        }
                    }
                };

                // 4. Open Razorpay checkout
                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (error) {
                setIsProcessing(false);
                console.error("Error in payment process:", error.message);
                reject(error.response?.data || { message: "An error occurred during payment" });
            }
        });
    };

    return { processPayment, isProcessing };
};

export default useRazorpay;
