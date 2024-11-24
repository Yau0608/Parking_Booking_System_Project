import { client } from '../dbclient.js';

const db = client.db("parkingSystem");
const users = db.collection("users");

export async function createUser(userData) {
  try {
    const result = await users.insertOne({
      ...userData,
      createdAt: new Date(),
      role: 'user'
    });
    return result;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function findUserByUsername(username) {
  return users.findOne({ username });
}