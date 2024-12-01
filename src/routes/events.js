import express from 'express';
import { getActiveEvents, getEventById } from '../models/event.js';

const router = express.Router();

// Get all active events
router.get('/events', async (req, res) => {
  try {
    const events = await getActiveEvents();
    res.json({
      success: true,
      events: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching events'
    });
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