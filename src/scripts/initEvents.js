import { client } from '../dbclient.js';
const db = client.db("parkingSystem");
const events = db.collection("events");

async function initializeEvents() {
  try {
    // First check if events already exist
    const count = await events.countDocuments();
    if (count > 0) {
      console.log('Events already exist, skipping initialization');
      return;
    }

    // Create test events
    const testEvents = [
      {
        title: "Morning Parking Session",
        date: "2024-11-30",
        timeSlot: "8:00 AM - 2:00 PM",
        venue: "Ground Floor",
        price: 50,
        description: "Standard morning parking slot",
        totalSpots: 30,
        availableSpots: 30,
        status: "active",
        createdAt: new Date()
      },
      {
        title: "Afternoon Parking Session",
        date: "2024-11-30",
        timeSlot: "2:00 PM - 8:00 PM",
        venue: "First Floor",
        price: 50,
        description: "Standard afternoon parking slot",
        totalSpots: 30,
        availableSpots: 30,
        status: "active",
        createdAt: new Date()
      }
    ];

    const result = await events.insertMany(testEvents);
    console.log(`Successfully initialized ${result.insertedCount} events`);
    return result;
  } catch (error) {
    console.error('Error initializing events:', error);
    throw error;
  }
}

// Connect and initialize
async function main() {
  try {
    console.log('Starting event initialization...');
    await initializeEvents();
    console.log('Event initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize events:', error);
    process.exit(1);
  }
}

main(); 