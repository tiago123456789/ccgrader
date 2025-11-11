import Redis from 'ioredis';
import { logger } from './logger';

interface RedisConfig {
  host: string;
  port: number;
  password: string;
  database: number;
  keyPrefix?: string;
}

const defaultConfig: RedisConfig = {
  // @ts-ignore
  host: process.env.REDIS_HOST,
  // @ts-ignore
  port: parseInt(process.env.REDIS_PORT),
  // @ts-ignore
  password: process.env.REDIS_PASSWORD,
  // @ts-ignore
  database: parseInt(process.env.REDIS_DATABASE),
  retryStrategy: (times: number) => {
    if (times > 3) {
      return null;
    }
    const delay = Math.min(times * 200, 2000);
    return delay;
  }
};

let redisClient: Redis | null = null;

export const createRedisClient = (config: RedisConfig = defaultConfig): Redis => {
  const clientOptions: any = {
    host: config.host,
    port: config.port,
    db: config.database,
    enableReadyCheck: true,
    maxRetriesPerRequest: null
  };

  if (config.password) {
    clientOptions.password = config.password;
  }

  const client = new Redis(clientOptions);

  client.on('error', (err) => {
    logger.error('❌ Redis Client Error:', err);
  });

  client.on('connect', () => {
    logger.info('🔗 Redis client connected');
  });

  client.on('ready', () => {
    logger.info('✅ Redis client ready');
  });

  client.on('end', () => {
    logger.info('🔌 Redis client disconnected');
  });

  client.on('reconnecting', () => {
    logger.info('🔄 Redis client reconnecting...');
  });

  return client;
};

export const initRedis = async (config: RedisConfig = defaultConfig): Promise<Redis> => {
  if (redisClient && redisClient.status !== 'end') {
    logger.info('🔄 Redis client already connected');
    return redisClient;
  }

  try {
    redisClient = createRedisClient(config);
    await redisClient.ping();
    
    logger.info(`🚀 Redis connected to ${config.host}:${config.port} (DB: ${config.database})`);
    return redisClient;
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
};

export const getRedisClient = (): Redis => {
  if (!redisClient || redisClient.status === 'end') {
    throw new Error('Redis client not initialized. Call initRedis() first.');
  }
  return redisClient;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('🔌 Redis connection closed gracefully');
  }
};

initRedis()

export default {
  getRedisClient,
  closeRedisConnection,
  createRedisClient,
};