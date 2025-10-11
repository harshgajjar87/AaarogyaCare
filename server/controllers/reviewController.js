const mongoose = require('mongoose');
const Review = require('../models/Review');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Create a new review
const createReview = async (req, res) => {
  try {
    const { rating, description, doctorId, appointmentId, isAnonymous } = req.body;

    // Check if user has already reviewed this doctor
    const existingReview = await Review.findOne({
      patientId: req.user.id,
      doctorId: doctorId
    });

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this doctor'
      });
    }

    // Get patient details
    const patient = await User.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Verify appointment exists and belongs to patient (if provided)
    // This is now optional - reviews can be submitted without an appointment
    if (appointmentId) {
      try {
        const appointment = await Appointment.findOne({
          _id: appointmentId,
          patientId: req.user.id,
          doctorId: doctorId,
          status: 'approved'
        });

        if (!appointment) {
          console.log('Invalid appointment provided, but continuing with review submission');
        }
      } catch (appointmentError) {
        console.log('Error validating appointment, but continuing with review submission:', appointmentError.message);
      }
    }

    // Create review
    const review = new Review({
      rating,
      description,
      patientId: req.user.id,
      doctorId,
      appointmentId: appointmentId || null,
      patientName: isAnonymous ? 'Anonymous' : patient.name,
      isAnonymous
    });

    await review.save();

    // Populate the review with patient details for response
    const populatedReview = await Review.findById(review._id)
      .populate('patientId', 'name profileImage')
      .populate('doctorId', 'name');

    res.status(201).json({
      message: 'Review submitted successfully',
      review: populatedReview
    });

  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all reviews for a doctor
const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find({ doctorId })
      .populate('patientId', 'name profileImage')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ doctorId });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Error fetching doctor reviews:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get reviews by a specific user
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Handle special case where userId is "me" - use the authenticated user's ID
    const targetUserId = userId === 'me' ? req.user.id : userId;

    const reviews = await Review.find({ patientId: targetUserId })
      .populate('doctorId', 'name doctorDetails.specialization')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ patientId: targetUserId });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, description, isAnonymous } = req.body;

    const review = await Review.findOne({
      _id: reviewId,
      patientId: req.user.id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update review
    if (rating !== undefined) review.rating = rating;
    if (description !== undefined) review.description = description;
    if (isAnonymous !== undefined) {
      review.isAnonymous = isAnonymous;
      review.patientName = isAnonymous ? 'Anonymous' : req.user.name;
    }

    await review.save();

    const updatedReview = await Review.findById(reviewId)
      .populate('patientId', 'name profileImage')
      .populate('doctorId', 'name');

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({
      _id: reviewId,
      patientId: req.user.id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({ message: 'Review deleted successfully' });

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get review statistics for a doctor
const getReviewStatistics = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const statistics = await Review.aggregate([
      { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
      {
        $group: {
          _id: '$doctorId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (statistics.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    statistics[0].ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });

    res.json({
      averageRating: parseFloat(statistics[0].averageRating.toFixed(1)),
      totalReviews: statistics[0].totalReviews,
      ratingDistribution: distribution
    });

  } catch (error) {
    console.error('Error fetching review statistics:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all reviews for home page (public)
const getAllReviews = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const reviews = await Review.find({})
      .populate('doctorId', 'name doctorDetails.specialization')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      reviews,
      total: reviews.length
    });

  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getDoctorReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getReviewStatistics,
  getAllReviews
};
