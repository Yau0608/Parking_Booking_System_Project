//Created by
//Ho Cheuk Wing 21106121d
//Wong Hiu Yau 21092461d


import express from 'express';
import { checkAuth } from '../middleware/auth.js';
import {
  getParkingStatus,
  createBooking,
  getBookingById,
  getRelatedBookings,
  getCurrentBookings,
  updateParkingSpace
} from '../models/parking.js';

const router = express.Router();

// Move this route to the top, before other booking routes
router.get('/bookings/current', checkAuth, async (req, res) => {
  try {
    const currentBookings = await getCurrentBookings();

    if (!currentBookings) {
      return res.json({
        success: true,
        bookings: []
      });
    }

    res.json({
      success: true,
      bookings: currentBookings
    });
  } catch (error) {
    console.error('Error in /bookings/current:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching current bookings',
      error: error.message
    });
  }
});

// Get parking status
router.get('/parking-status/:venue?', async (req, res) => {
  try {
    const spaces = await getParkingStatus(req.params.venue);
    res.json({
      success: true,
      spaces: spaces
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching parking status'
    });
  }
});

// Create new booking
router.post('/bookings', checkAuth, async (req, res) => {
  try {
    const bookingData = {
      userId: req.session.username,
      spaceNumbers: req.body.spaceNumbers.map(num => parseInt(num)),
      duration: req.body.duration,
      price: parseFloat(req.body.price),
      date: new Date(req.body.date),
      venue: req.body.venue
    };

    const result = await createBooking(bookingData);

    res.json({
      success: true,
      bookingId: result.insertedId,
      totalSpaces: result.totalSpaces,
      totalPrice: result.totalPrice,
      message: 'Bookings created successfully'
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating bookings'
    });
  }
});

// Get booking details
router.get('/bookings/:id', checkAuth, async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking details'
    });
  }
});

// Get related bookings
router.get('/bookings/:bookingId/related', checkAuth, async (req, res) => {
  try {
    const bookings = await getRelatedBookings(req.params.bookingId);
    res.json({
      success: true,
      bookings: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching related bookings'
    });
  }
});

export default router; 