
import { SPORTRADAR_CONFIG } from './config';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

const cache: Record<string, CacheEntry<any>> = {};

export async function getCached<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number
): Promise<T> {
    const now = Date.now();
    const entry = cache[key];

    if (entry && now - entry.timestamp < entry.ttl * 1000) {
        console.log(`[Cache Hit] ${key}`);
        return entry.data;
    }

    console.log(`[Cache Miss] ${key}`);
    try {
        const data = await fetchFn();
        cache[key] = {
            data,
            timestamp: now,
            ttl: ttlSeconds,
        };
        return data;
    } catch (error) {
        console.error(`[Cache Error] Failed to fetch for key ${key}:`, error);
        // If we have stale data, return it as fallback? 
        // For now, re-throw to handle upstream
        throw error;
    }
}

export function clearCache(pattern?: string) {
    if (!pattern) {
        for (const key in cache) delete cache[key];
        return;
    }
    for (const key in cache) {
        if (key.includes(pattern)) delete cache[key];
    }
}
