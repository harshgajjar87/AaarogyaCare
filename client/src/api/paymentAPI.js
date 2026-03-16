import axios from '../utils/axios';

// Get payment fee breakdown preview
export const getPaymentPreview = async (fees) => {
  const response = await axios.get(`/payment/preview?fees=${fees}`);
  return response.data;
};

// Create a Razorpay order
export const createPaymentOrder = async (amount) => {
  try {
    const response = await axios.post('/payment/order', { amount });
    return response.data;
  } catch (error) {
    console.error("Error creating payment order:", error.response?.data || error.message);
    throw error;
  }
};

// Verify payment and book appointment
export const verifyPaymentAndBook = async (paymentData) => {
  try {
    const response = await axios.post('/payment/verify-and-book', paymentData);
    return response.data;
  } catch (error) {
    console.error("Error verifying payment:", error.response?.data || error.message);
    throw error;
  }
};
