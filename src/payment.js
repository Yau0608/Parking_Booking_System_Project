import express from 'express';
import { client } from './dbclient.js';
const route = express.Router();

route.use(express.json());

route.get('/payment', (req, res) => {
    const parkNums = req.session.parkNum;
    const totalPrice = req.session.totalPrice;

    if (!parkNum) {
        return res.redirect('/floor'); // Redirect if no parking spot is selected
    }
    res.json({ parkNum: parkNums, totalPrice: totalPrice });
});

export default route;