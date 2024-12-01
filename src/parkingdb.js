//Created by
//Ho Cheuk Wing 21106121d
//Wong Hiu Yau 21092461d


import express from 'express';
import { client } from './dbclient.js';
const router = express.Router();

async function fetch_user(username) {
    try {
      const users = client.db('parkingSystem').collection('parking');
      const user = await users.findOne({ username });
  
      return user;
    } catch (err) {
      console.error('Unable to fetch from database:', err);
      return null;
    }
}

async function username_exist(username) {
    try {
      const user = await fetch_user(username);
  
      if (user !== null) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Unable to fetch from database:', err);
      return false;
    }
}

export {fetch_user, username_exist};