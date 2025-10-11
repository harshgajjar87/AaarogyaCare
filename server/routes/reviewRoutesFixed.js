const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewControllerFixed');
const { protect } = require('../middleware/authMiddleware');

// Public route for home page reviews
router.get('/all', reviewController.getAllReviews);

// All other routes are protected
router.use(protect);

// Create a new review
router.post('/', reviewController.createReview);

// Get all reviews for a doctor
router.get('/doctor/:doctorId', reviewController.getDoctorReviews);

// Get reviews by a specific user
router.get('/user/:userId', reviewController.getUserReviews);

// Get review statistics for a doctor
router.get('/statistics/:doctorId', reviewController.getReviewStatistics);

// Update a review
router.put('/:reviewId', reviewController.updateReview);

// Delete a review
router.delete('/:reviewId', reviewController.deleteReview);

module.exports = router;
