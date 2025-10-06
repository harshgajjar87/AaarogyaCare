import axios from '../utils/axios';

// Create a new review
export const createReview = async (reviewData) => {
  try {
    const response = await axios.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create review';
  }
};

// Get all reviews for a doctor
export const getDoctorReviews = async (doctorId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') => {
  try {
    const response = await axios.get(`/reviews/doctor/${doctorId}`, {
      params: { page, limit, sortBy, sortOrder }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch doctor reviews';
  }
};

// Get reviews by a specific user
export const getUserReviews = async (userId, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`/reviews/user/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch user reviews';
  }
};

// Update a review
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await axios.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update review';
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    const response = await axios.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete review';
  }
};

// Get review statistics for a doctor
export const getReviewStatistics = async (doctorId) => {
  try {
    const response = await axios.get(`/reviews/statistics/${doctorId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch review statistics';
  }
};

// Check if user has already reviewed a doctor
export const checkUserReview = async (doctorId) => {
  try {
    // This will be handled by checking the user's reviews list
    const userReviews = await getUserReviews('me');
    return userReviews.reviews.some(review => review.doctorId._id === doctorId);
  } catch (error) {
    // If user has no reviews, return false
    return false;
  }
};

// Get all reviews for home page
export const getAllReviews = async (limit = 10) => {
  try {
    const response = await axios.get('/reviews/all', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch reviews';
  }
};
