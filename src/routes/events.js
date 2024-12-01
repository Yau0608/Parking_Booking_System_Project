//Created by
//Ho Cheuk Wing 21106121d
//Wong Hiu Yau 21092461d


import express from 'express';
import { upload } from '../middleware/upload.js';
import { processImage } from '../middleware/imageProcess.js';
import { checkAuth, checkAdmin } from '../middleware/auth.js';
import {
  createEvent,
  getActiveEvents,
  getEventById,
  updateEvent,
  deleteEvent
} from '../models/event.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all events (with optional filters)
router.get('/events', async (req, res) => {
  try {
    const filters = {
      title: req.query.title,
      venue: req.query.venue,
      date: req.query.date
    };
    const events = await getActiveEvents(filters);
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching events'
    });
  }
});

// Create new event (admin only)
router.post('/events', checkAuth, checkAdmin, upload.single('image'), async (req, res) => {
  try {
    let processedImageData = null;
    if (req.file) {
      console.log('Processing image:', {
        originalSize: req.file.size,
        mimeType: req.file.mimetype
      });

      processedImageData = await processImage(req.file.buffer, 'event');
      console.log('Image processed:', {
        processedSize: processedImageData.length
      });
    }

    const eventData = {
      ...req.body,
      image: processedImageData,
      dateTime: new Date(req.body.dateTime)
    };

    const result = await createEvent(eventData);
    res.json({ success: true, eventId: result.insertedId });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event'
    });
  }
});

// Update event (admin only)
router.put('/events/:id', checkAuth, checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const eventData = { ...req.body };

    if (req.file) {
      const processedBuffer = await processImage(req.file.buffer, 'event');
      eventData.image = processedBuffer;
    }

    if (eventData.dateTime) {
      eventData.dateTime = new Date(eventData.dateTime);
    }

    await updateEvent(req.params.id, eventData);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event'
    });
  }
});

// Delete event (admin only)
router.delete('/events/:id', checkAuth, checkAdmin, async (req, res) => {
  try {
    await deleteEvent(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting event'
    });
  }
});

// Get event image with proper content type
router.get('/events/image/:id', async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    console.log('Event image request:', {
      eventId: req.params.id,
      hasImage: !!event?.image,
      imageSize: event?.image?.length || 0,
      imageType: event?.image ? (Buffer.isBuffer(event.image) ? 'Buffer' : typeof event.image) : 'none'
    });

    if (!event?.image) {
      console.log('No image found, serving default');
      return res.sendFile(path.join(__dirname, '../../../static/images/default-event.jpg'));
    }

    // Ensure we have a Buffer
    let imageBuffer;
    if (Buffer.isBuffer(event.image)) {
      imageBuffer = event.image;
    } else if (event.image.buffer) {
      imageBuffer = Buffer.from(event.image.buffer);
    } else if (typeof event.image === 'string') {
      imageBuffer = Buffer.from(event.image, 'base64');
    } else {
      console.log('Invalid image format, serving default');
      return res.sendFile(path.join(__dirname, '../../../static/images/default-event.jpg'));
    }

    res.set('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error fetching event image:', error);
    return res.sendFile(path.join(__dirname, '../../../static/images/default-event.jpg'));
  }
});

// Get single event by ID
router.get('/events/:id', async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    res.json({
      success: true,
      event: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching event details'
    });
  }
});

export default router; 