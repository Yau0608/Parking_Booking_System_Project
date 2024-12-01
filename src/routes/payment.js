import express from 'express';
import { checkAuth } from '../middleware/auth.js';
import { getBookingById, updateBookingStatus, updateParkingSpace, getRelatedBookings } from '../models/parking.js';
import { updateEventSpots } from '../models/event.js';
import { client } from '../dbclient.js';

// Add this middleware function
const checkAdmin = (req, res, next) => {
  if (req.session.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin authentication required'
    });
  }
  next();
};

const router = express.Router();
const db = client.db("parkingSystem");
const bookings = db.collection("bookings");

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

// Get transaction history
router.get('/transactions', checkAuth, async (req, res) => {
  try {
    const isAdmin = req.session.role === 'admin';
    let query = {};

    // If not admin, only show user's own transactions
    if (!isAdmin) {
      query.userId = req.session.username;
    }

    // Group by transactionId to show related bookings together
    const transactions = await bookings.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            transactionId: '$transactionId',
            primaryBookingId: { $ifNull: ['$primaryBookingId', '$_id'] }
          },
          bookings: { $push: '$$ROOT' },
          totalPrice: { $first: '$price' },
          status: { $first: '$status' },
          date: { $first: '$date' },
          createdAt: { $first: '$createdAt' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    res.json({
      success: true,
      transactions: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching transactions'
    });
  }
});

// Add the admin transactions route with checkAdmin middleware
router.get('/admin/users/:username/transactions', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { username } = req.params;

    const transactions = await bookings.aggregate([
      { $match: { userId: username } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            transactionId: '$transactionId',
            primaryBookingId: { $ifNull: ['$primaryBookingId', '$_id'] }
          },
          bookings: { $push: '$$ROOT' },
          totalPrice: { $first: '$price' },
          status: { $first: '$status' },
          date: { $first: '$date' },
          createdAt: { $first: '$createdAt' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    res.json({
      success: true,
      transactions: transactions
    });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user transactions'
    });
  }
});

export default router; 