//Created by
//Ho Cheuk Wing 21106121d
//Wong Hiu Yau 21092461d


import dotenv from "dotenv";

dotenv.config();

// Check if CONNECTION_STR is defined
if (!process.env.CONNECTION_STR) {
  console.error("CONNECTION_STR is not defined");
  process.exit(1);
}

export default {
  CONNECTION_STR: process.env.CONNECTION_STR
};
