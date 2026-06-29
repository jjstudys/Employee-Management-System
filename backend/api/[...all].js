require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/database');
const { connectRedis } = require('../src/config/redis');

let connectionPromise = null;

const ensureConnected = async () => {
  if (connectionPromise) return connectionPromise;

  connectionPromise = connectDB()
    .then(() => {
      connectRedis();
    })
    .catch((error) => {
      connectionPromise = null;
      console.error('MongoDB connection failed:', error.message);
      throw error;
    });

  return connectionPromise;
};

module.exports = async (req, res) => {
  try {
    await ensureConnected();
    app(req, res);
  } catch (error) {
    console.error('Backend initialization failed:', error);
    res.status(500).json({ success: false, message: 'Backend initialization failed' });
  }
};
