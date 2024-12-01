//Created by
//Ho Cheuk Wing 21106121d
//Wong Hiu Yau 21092461d


import { client } from '../dbclient.js';
import { ObjectId } from 'mongodb';
import { updateEventSpots } from './event.js';

const db = client.db("parkingSystem");
const parkingSpaces = db.collection("parkingSpaces");
const bookings = db.collection("bookings");

// Function to update parking space status
async function updateParkingSpace(spaceNumber, venue, status, session = null) {
  try {
    const updateOperation = {
      $set: {
        status: status,
        lastUpdated: new Date()
      }
    };

    const options = session ? { session } : {};

    const result = await parkingSpaces.updateOne(
      { spaceNumber: spaceNumber, venue: venue },
      updateOperation,
      options
    );

    if (result.modifiedCount !== 1) {
      throw new Error('Failed to update parking space status');
    }

    return true;
  } catch (error) {
    console.error('Error updating parking space:', error);
    throw error;
  }
}

// Other functions...
async function createBooking(bookingData) {
  const session = client.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const { spaceNumbers, ...bookingDetails } = bookingData;

      // Verify all spaces are available
      const spaces = await parkingSpaces.find({
        spaceNumber: { $in: spaceNumbers },
        venue: bookingDetails.venue,
        status: 'available'
      }).toArray();

      if (spaces.length !== spaceNumbers.length) {
        throw new Error('One or more selected parking spaces are not available');
      }

      // Create individual bookings for each space
      const bookingPromises = spaceNumbers.map(async (spaceNumber) => {
        const singleBooking = {
          ...bookingDetails,
          spaceNumber,
          status: 'pending',
          createdAt: new Date(),
          pricePerSpace: bookingDetails.price / spaceNumbers.length
        };
        return await bookings.insertOne(singleBooking, { session });
      });

      const bookingResults = await Promise.all(bookingPromises);

      // Update all spaces to occupied
      await parkingSpaces.updateMany(
        {
          spaceNumber: { $in: spaceNumbers },
          venue: bookingDetails.venue
        },
        {
          $set: {
            status: 'occupied',
            lastUpdated: new Date()
          }
        },
        { session }
      );

      const primaryBookingId = bookingResults[0].insertedId;

      // Update all bookings to reference the primary booking
      if (bookingResults.length > 1) {
        const secondaryBookingIds = bookingResults.slice(1).map(result => result.insertedId);
        await bookings.updateMany(
          { _id: { $in: secondaryBookingIds } },
          {
            $set: {
              primaryBookingId: primaryBookingId
            }
          },
          { session }
        );
      }

      // Store the result to return after transaction
      result = {
        insertedId: primaryBookingId,
        totalSpaces: spaceNumbers.length,
        totalPrice: bookingDetails.price
      };
    });

    return result; // Return the stored result
  } catch (error) {
    console.error('Error creating bookings:', error);
    throw error;
  } finally {
    await session.endSession();
  }
}

async function updateBookingStatus(bookingId, status, transactionId = null) {
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      const objectId = new ObjectId(bookingId);

      // Get all related bookings
      const relatedBookings = await getRelatedBookings(bookingId);
      const bookingIds = relatedBookings.map(booking => booking._id);

      // Update status for all related bookings
      const result = await bookings.updateMany(
        { _id: { $in: bookingIds } },
        {
          $set: {
            status: status,
            transactionId: transactionId,
            updatedAt: new Date()
          }
        },
        { session }
      );

      if (result.modifiedCount !== bookingIds.length) {
        throw new Error('Failed to update all booking statuses');
      }

      // If cancelled, update parking spaces
      if (status === 'cancelled') {
        const spaceUpdates = relatedBookings.map(booking =>
          updateParkingSpace(booking.spaceNumber, booking.venue, 'available', session)
        );
        await Promise.all(spaceUpdates);
      }
    });

    return true;
  } catch (error) {
    console.error('Error updating booking statuses:', error);
    throw error;
  } finally {
    await session.endSession();
  }
}

async function getBookingById(bookingId) {
  try {
    const objectId = new ObjectId(bookingId);
    const booking = await bookings.findOne({ _id: objectId });

    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
}

async function getParkingStatus(venue) {
  try {
    let query = {};
    if (venue) {
      query.venue = venue;
    }

    const spaces = await parkingSpaces.find(query).toArray();

    if (!spaces || spaces.length === 0) {
      throw new Error('No parking spaces found');
    }

    return spaces;
  } catch (error) {
    console.error('Error getting parking status:', error);
    throw error;
  }
}

async function initializeParkingSpaces() {
  try {
    // First check if parking spaces already exist
    const count = await parkingSpaces.countDocuments();
    if (count > 0) {
      console.log('Parking spaces already exist, skipping initialization');
      return;
    }

    // Create 60 parking spaces (30 for each floor)
    const spaces = [];

    // Ground Floor (1-30)
    for (let i = 1; i <= 30; i++) {
      spaces.push({
        spaceNumber: i,
        venue: 'Ground Floor',
        status: 'available',
        lastUpdated: new Date()
      });
    }

    // First Floor (31-60)
    for (let i = 31; i <= 60; i++) {
      spaces.push({
        spaceNumber: i,
        venue: 'First Floor',
        status: 'available',
        lastUpdated: new Date()
      });
    }

    const result = await parkingSpaces.insertMany(spaces);
    console.log(`Successfully initialized ${result.insertedCount} parking spaces`);
    return result;
  } catch (error) {
    console.error('Error initializing parking spaces:', error);
    throw error;
  }
}

// Function to reset all parking spaces to available
async function resetParkingSpaces() {
  try {
    const result = await parkingSpaces.updateMany(
      {}, // Match all documents
      {
        $set: {
          status: 'available',
          lastUpdated: new Date()
        }
      }
    );

    console.log(`Reset ${result.modifiedCount} parking spaces to available`);
    return result;
  } catch (error) {
    console.error('Error resetting parking spaces:', error);
    throw error;
  }
}

// Add a new function to get all related bookings
async function getRelatedBookings(primaryBookingId) {
  try {
    const objectId = new ObjectId(primaryBookingId);
    return await bookings.find({
      $or: [
        { _id: objectId },
        { primaryBookingId: objectId }
      ]
    }).toArray();
  } catch (error) {
    console.error('Error fetching related bookings:', error);
    throw error;
  }
}

// Add or modify this function
async function getCurrentBookings() {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Get bookings that are not cancelled and are for today or future
    const currentBookings = await bookings.find({
      date: { $gte: currentDate },
      status: { $in: ['pending', 'confirmed', 'paid'] }
    }).toArray();

    // Map the bookings to ensure ObjectId is properly stringified
    const mappedBookings = currentBookings.map(booking => ({
      ...booking,
      _id: booking._id.toString(),
      primaryBookingId: booking.primaryBookingId ? booking.primaryBookingId.toString() : null
    }));

    console.log('Found current bookings:', mappedBookings);
    return mappedBookings;
  } catch (error) {
    console.error('Error in getCurrentBookings:', error);
    throw error;
  }
}

// Export all functions at the end of the file
export {
  initializeParkingSpaces,
  resetParkingSpaces,
  getParkingStatus,
  createBooking,
  getBookingById,
  getRelatedBookings,
  updateBookingStatus,
  updateParkingSpace,
  getCurrentBookings
};