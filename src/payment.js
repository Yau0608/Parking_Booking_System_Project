import express from 'express';
import { client } from './dbclient.js';
const route = express.Router();

route.use(express.json());

route.get('/payment', (req, res) => {
    const parkNums = req.session.parkNums;
    const totalPrice = req.session.totalPrice;

    if (!parkNums) {
        return res.redirect('/floor'); // Redirect if no parking spot is selected
    }
    res.json({ parkNums: parkNums, totalPrice: totalPrice });
});

export default route;