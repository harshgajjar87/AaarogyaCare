import axios from '../utils/axios';

// Create a Razorpay order
export const createPaymentOrder = async (amount) => {
  try {
    console.log("Creating payment order with amount:", amount);
    const response = await axios.post('/payment/order', { amount });
    console.log("Payment order created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating payment order:", error);
    console.error("Error response:", error.response);
    throw error;
  }
};

// Verify payment and book appointment
export const verifyPaymentAndBook = async (paymentData) => {
  try {
    console.log("Verifying payment with data:", paymentData);
    const response = await axios.post('/payment/verify-and-book', paymentData);
    console.log("Payment verified successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error verifying payment:", error);
    console.error("Error response:", error.response);
    throw error;
  }
};
