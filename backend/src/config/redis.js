const Redis = require('ioredis');
const config = require('./index');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = () => {
  if (!config.redis.enabled) {
    logger.info('Redis disabled - using in-memory token store');
    return null;
  }

  try {
    redisClient = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => logger.error(`Redis error: ${err.message}`));

    redisClient.connect().catch((err) => {
      logger.warn(`Redis connection failed, falling back to in-memory: ${err.message}`);
      redisClient = null;
    });

    return redisClient;
  } catch (error) {
    logger.warn(`Redis init failed: ${error.message}`);
    return null;
  }
};

const getRedis = () => redisClient;

module.exports = { connectRedis, getRedis };
