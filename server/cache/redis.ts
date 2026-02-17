import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redis: Redis | null = null;

try {
    redis = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy: (times) => {
            if (times > 3) {
                console.warn('⚠️  Redis connection failed after 3 retries');
                return null;
            }
            return Math.min(times * 100, 3000);
        },
    });

    redis.on('connect', () => {
        console.log('✅ Redis connected');
    });

    redis.on('error', (err) => {
        console.warn('⚠️  Redis error:', err.message);
        console.log('   Caching will be disabled');
    });
} catch (error) {
    console.warn('⚠️  Redis not available - caching disabled');
    console.log('   To enable Redis caching:');
    console.log('   1. Install Redis: brew install redis');
    console.log('   2. Start Redis: brew services start redis');
    console.log('   3. Or set REDIS_URL in .env for cloud Redis');
}

/**
 * Get cached value
 */
export async function get(key: string): Promise<any> {
    if (!redis) return null;

    try {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error('Redis GET error:', error);
        return null;
    }
}

/**
 * Set cached value with optional TTL (in seconds)
 */
export async function set(key: string, value: any, ttl?: number): Promise<void> {
    if (!redis) return;

    try {
        const serialized = JSON.stringify(value);
        if (ttl) {
            await redis.setex(key, ttl, serialized);
        } else {
            await redis.set(key, serialized);
        }
    } catch (error) {
        console.error('Redis SET error:', error);
    }
}

/**
 * Delete cached value
 */
export async function del(key: string): Promise<void> {
    if (!redis) return;

    try {
        await redis.del(key);
    } catch (error) {
        console.error('Redis DEL error:', error);
    }
}

/**
 * Delete all keys matching a pattern
 */
export async function delPattern(pattern: string): Promise<void> {
    if (!redis) return;

    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (error) {
        console.error('Redis DEL PATTERN error:', error);
    }
}

/**
 * Cache helper: get from cache or execute function and cache result
 */
export async function cacheOrExecute<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = 300 // 5 minutes default
): Promise<T> {
    const cached = await get(key);
    if (cached !== null) {
        return cached as T;
    }

    const result = await fn();
    await set(key, result, ttl);
    return result;
}

export { redis };
