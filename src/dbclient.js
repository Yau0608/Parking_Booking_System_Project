//Created by
//Ho Cheuk Wing 21106121d
//Wong Hiu Yau 21092461d


import { MongoClient, ServerApiVersion } from 'mongodb';
import config from './config.js';
const connect_uri = config.CONNECTION_STR;
const client = new MongoClient(connect_uri, {
  connectTimeoutMS: 2000,
  serverSelectionTimeoutMS: 2000,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function connectDB() {
  try {
    // Establish connection to the database
    await client.connect();

    // Test the connection by pinging the database
    await client.db("parkingSystem").command({ ping: 1 });

    console.log('Successfully connected to the database!');
    return true;
  } catch (err) {
    console.error('Unable to establish connection to the database!');
    return false;
  }
}
const db = client.db("parkingSystem");
const events = db.collection("events");
export { client, connectDB };
