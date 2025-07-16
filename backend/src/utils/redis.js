const redis = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    // Check if REDIS_URL is provided (for Render and other cloud platforms)
    if (process.env.REDIS_URL) {
      console.log('Using Redis URL connection string');
      redisClient = redis.createClient({
        url: process.env.REDIS_URL
      });
    } else {
      // Fallback to traditional configuration for local development
      console.log('Using Redis host/port configuration');
      redisClient = redis.createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379
        },
        password: process.env.REDIS_PASSWORD || undefined,
      });
    }

    // Set up event handlers
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    // Connect to Redis
    await redisClient.connect();
    console.log('Redis Connected Successfully');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
};

const getRedisClient = () => {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis client not connected');
  }
  return redisClient;
};

module.exports = {
  connectRedis,
  getRedisClient,
}; 