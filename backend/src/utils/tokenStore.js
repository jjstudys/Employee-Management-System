const { getRedis } = require('../config/redis');
const crypto = require('crypto');

const memoryStore = new Map();

const parseExpiry = (expiry) => {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60;
  const [, num, unit] = match;
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return parseInt(num, 10) * multipliers[unit];
};

class TokenStore {
  async set(key, value, ttlSeconds) {
    const redis = getRedis();
    if (redis) {
      await redis.setex(key, ttlSeconds, value);
      return;
    }
    memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async get(key) {
    const redis = getRedis();
    if (redis) return redis.get(key);

    const entry = memoryStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memoryStore.delete(key);
      return null;
    }
    return entry.value;
  }

  async delete(key) {
    const redis = getRedis();
    if (redis) {
      await redis.del(key);
      return;
    }
    memoryStore.delete(key);
  }

  async deletePattern(pattern) {
    const redis = getRedis();
    if (redis) {
      const keys = await redis.keys(pattern);
      if (keys.length) await redis.del(...keys);
      return;
    }
    const prefix = pattern.replace('*', '');
    for (const key of memoryStore.keys()) {
      if (key.startsWith(prefix)) memoryStore.delete(key);
    }
  }
}

const tokenStore = new TokenStore();

const tokenKey = (userId, token) => {
  const digest = crypto.createHash('sha256').update(token).digest('hex');
  return `refresh:${userId}:${digest}`;
};

const storeRefreshToken = async (userId, token, expiresIn) => {
  const ttl = parseExpiry(expiresIn);
  await tokenStore.set(tokenKey(userId, token), 'valid', ttl);
};

const validateRefreshToken = async (userId, token) => {
  const value = await tokenStore.get(tokenKey(userId, token));
  return value === 'valid';
};

const revokeRefreshToken = async (userId, token) => {
  await tokenStore.delete(tokenKey(userId, token));
};

const revokeAllUserTokens = async (userId) => {
  await tokenStore.deletePattern(`refresh:${userId}:*`);
};

module.exports = {
  tokenStore,
  storeRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
