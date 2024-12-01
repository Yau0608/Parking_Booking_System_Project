import express from 'express';
import { checkAuth } from '../middleware/auth.js';
import { getBookingById, updateBookingStatus, updateParkingSpace, getRelatedBookings } from '../models/parking.js';
import { updateEventSpots } from '../models/event.js';
const router = express.Router();

router.post('/process-payment', checkAuth, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      throw new Error('Missing booking ID');
    }

    // Get all related bookings
    const relatedBookings = await getRelatedBookings(bookingId);

    // Update status for all bookings
    const transactionId = 'TRANS_' + Date.now();
    await updateBookingStatus(bookingId, 'confirmed', transactionId);

    res.json({
      success: true,
      message: 'Payment processed successfully',
      transactionId: transactionId
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing payment'
    });
  }
});

// Add a new route for canceling payment
router.post('/cancel-payment', async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Get all related bookings
    const relatedBookings = await getRelatedBookings(bookingId);

    if (!relatedBookings || relatedBookings.length === 0) {
      throw new Error('Bookings not found');
    }

    // Update all parking spaces back to available
    const spaceUpdates = relatedBookings.map(booking =>
      updateParkingSpace(booking.spaceNumber, booking.venue, 'available')
    );
    await Promise.all(spaceUpdates);

    // Update all bookings to cancelled
    await updateBookingStatus(bookingId, 'cancelled');

    // Only update event spots if there's an eventId
    if (relatedBookings[0].eventId) {
      await updateEventSpots(relatedBookings[0].eventId, relatedBookings.length);
      res.json({
        success: true,
        eventId: relatedBookings[0].eventId
      });
    } else {
      res.json({
        success: true
      });
    }

  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router; 