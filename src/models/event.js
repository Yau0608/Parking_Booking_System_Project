import { client } from '../dbclient.js';
import { ObjectId } from 'mongodb';
const db = client.db("parkingSystem");
const events = db.collection("events");

export async function createEvent(eventData) {
  try {
    const event = {
      ...eventData,
      createdAt: new Date(),
      totalSpots: 20,
      availableSpots: 20,
      status: 'active'
    };
    return await events.insertOne(event);
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

export async function getActiveEvents() {
  try {
    // Get current date at start of day for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await events.find({
      status: 'active',
      date: { $gte: today.toISOString().split('T')[0] }
    }).toArray();
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

export async function getEventById(eventId) {
  try {
    const objectId = new ObjectId(eventId);
    return await events.findOne({ _id: objectId });
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
}

export async function updateEventSpots(eventId, change) {
  try {
    const objectId = new ObjectId(eventId);

    // First get current spots
    const event = await events.findOne({ _id: objectId });
    const newSpots = Math.max(0, Math.min(20, event.availableSpots + change));

    const result = await events.updateOne(
      { _id: objectId },
      {
        $set: {
          availableSpots: newSpots,
          lastUpdated: new Date()
        }
      }
    );

    if (result.modifiedCount !== 1) {
      throw new Error('Failed to update event spots');
    }
    return true;
  } catch (error) {
    console.error('Error updating event spots:', error);
    throw error;
  }
}