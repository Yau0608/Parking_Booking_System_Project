import express from 'express';
import { client } from './dbclient.js';
const route = express.Router();

route.use(express.json());

route.get('/parking-spot/:spotNumber', async (req, res) => {
    try {
        await client.connect();
        const database = await client.db('parkingSystem');
        const collection = await database.collection('parking');
        const parkingSpot = await collection.findOne({ "parking-spot": req.params.spotNumber });
        
        if (parkingSpot) {
            res.json(parkingSpot);
        } else {
            res.status(404).json({ error: 'Parking spot not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching parking spot' });
    }
});

route.post('/toggle-spot/:spotNumber', async (req, res) => {
    try {
        await client.connect();
        const database = await client.db('parkingSystem');
        const collection = await database.collection('parking');
        
        const parkingSpot = await collection.findOne({ "parking-spot": req.params.spotNumber });
        
        if (parkingSpot) {
            const newStatus = parkingSpot.status === 'booked' ? 'available' : 'booked';
            
            const result = await collection.updateOne(
                { "parking-spot": req.params.spotNumber },
                { $set: { status: newStatus } }
            );
            
            if (result.modifiedCount === 1) {
                res.json({ success: true, status: newStatus });
            } else {
                res.status(500).json({ error: 'Failed to update parking spot' });
            }
        } else {
            res.status(404).json({ error: 'Parking spot not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error updating parking spot' });
    }
});

route.post('/select-spot', (req, res) => {
    try{
        const parkNums = req.body.parkNums;
        const totalPrice = req.body.totalPrice; // Assuming the park number is sent in the request body
        req.session.parkNums = parkNums;
        req.session.totalPrice = totalPrice;
        res.json({ success: true, message: 'Parking spot selected' });
    } catch (error) {
        res.status(500).json({ error: 'Error selecting parking spot' });
    }
});

export default route;