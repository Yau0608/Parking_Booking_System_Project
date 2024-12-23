//Created by
//Ho Cheuk Wing 21106121d
//Wong Hiu Yau 21092461d


import { client } from '../dbclient.js';
import { hashPassword, comparePassword } from '../utils/password.js';
const db = client.db("parkingSystem");
const users = db.collection("users");

// Validation functions
export function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username) {
  // 4-20 characters, letters, numbers, and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
  return usernameRegex.test(username);
}

export async function createUser(userData) {
  try {
    // Validate all required fields
    const requiredFields = ['username', 'password', 'email', 'nickname', 'gender', 'birthdate'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate password
    if (!validatePassword(userData.password)) {
      throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
    }

    // Validate email
    if (!validateEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate username
    if (!validateUsername(userData.username)) {
      throw new Error('Username must be 4-20 characters long and contain only letters, numbers, and underscores');
    }

    // Check for duplicate username
    const existingUser = await findUserByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await hashPassword(userData.password);

    // Add default status to new users
    userData.status = 'active';
    userData.createdAt = new Date();

    const result = await users.insertOne({
      ...userData,
      password: hashedPassword, // Store the hashed password
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

export async function updateUserProfile(username, updates) {
  const result = await users.updateOne(
    { username },
    { $set: updates }
  );
  return result;
}

export async function updateUserPassword(username, hashedPassword) {
  const result = await users.updateOne(
    { username },
    { $set: { password: hashedPassword } }
  );
  return result;
}