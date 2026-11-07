import Redis from 'ioredis';

export default class CronService {
  private redis: Redis;
  private readonly lockKey: string;
  private readonly lockTTL: number;

  constructor(lockKey: string, ttlSeconds: number = 60) {
    this.lockKey = `cron:lock:${lockKey}`;
    this.lockTTL = ttlSeconds;
    this.redis   = new Redis({
      host: process.env.REDIS_HOST        || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
    });

    this.redis.on('connect', () => console.log('⚡️ Redis connected'));
    this.redis.on('error', err => console.error('Redis error', err));
  }

  async acquireLock(): Promise<boolean> {
    return await this.redis.set(this.lockKey, 'locked', 'EX', 60*30, 'NX') === 'OK'
  }

  async releaseLock(): Promise<void> {
    await this.redis.del(this.lockKey);
  }
}
