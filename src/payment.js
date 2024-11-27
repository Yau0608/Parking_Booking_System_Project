import express from 'express';
import { client } from './dbclient.js';
const route = express.Router();

route.use(express.json());

route.get('/payment', (req, res) => {
    const parkNum = req.session.parkNum;
    if (!parkNum) {
        return res.redirect('/floor'); // Redirect if no parking spot is selected
    }
    res.json({ parkNum: parkNum });
});

export default route;