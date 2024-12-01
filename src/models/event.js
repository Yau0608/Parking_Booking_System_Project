//Created by
//Ho Cheuk Wing 21106121d
//Wong Hiu Yau 21092461d


import { client } from '../dbclient.js';
import { ObjectId } from 'mongodb';
const db = client.db("parkingSystem");
const events = db.collection("events");

export async function createEvent(eventData) {
  try {
    const event = {
      title: eventData.title,
      description: eventData.description,
      venue: eventData.venue,
      dateTime: new Date(eventData.dateTime),
      createdAt: new Date(),
      status: 'active'
    };

    // Handle image data
    if (eventData.image) {
      // If it's already a Buffer, use it directly
      if (Buffer.isBuffer(eventData.image)) {
        event.image = eventData.image;
      }
      // If it's a Base64 string, convert to Buffer
      else if (typeof eventData.image === 'string') {
        event.image = Buffer.from(eventData.image, 'base64');
      }
      // If it's a Binary object from MongoDB
      else if (eventData.image.buffer) {
        event.image = Buffer.from(eventData.image.buffer);
      }
    }

    const result = await events.insertOne(event);
    console.log('Created event with image:', {
      eventId: result.insertedId,
      hasImage: !!event.image,
      imageSize: event.image?.length,
      imageType: event.image instanceof Buffer ? 'Buffer' : typeof event.image
    });
    return result;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

export async function getActiveEvents(filters = {}) {
  try {
    let query = { status: 'active' };

    if (filters.title) {
      query.title = { $regex: filters.title, $options: 'i' };
    }
    if (filters.venue) {
      query.venue = { $regex: filters.venue, $options: 'i' };
    }
    if (filters.date) {
      const date = new Date(filters.date);
      query.dateTime = {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      };
    }

    return await events.find(query).sort({ dateTime: 1 }).toArray();
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

export async function getEventById(id) {
  try {
    const event = await events.findOne({ _id: new ObjectId(id) });
    if (event?.image) {
      // Convert MongoDB Binary to Buffer
      event.image = Buffer.from(event.image.buffer || event.image);
    }
    return event;
  } catch (error) {
    console.error('Error getting event by id:', error);
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

export async function updateEvent(eventId, eventData) {
  try {
    const objectId = new ObjectId(eventId);
    const updateData = {
      ...eventData,
      updatedAt: new Date()
    };
    delete updateData._id;

    return await events.updateOne(
      { _id: objectId },
      { $set: updateData }
    );
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

export async function deleteEvent(eventId) {
  try {
    const objectId = new ObjectId(eventId);
    return await events.deleteOne({ _id: objectId });
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}