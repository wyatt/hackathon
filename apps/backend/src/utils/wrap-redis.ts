import IORedis from 'ioredis';

export const redis: IORedis.Redis = new IORedis(process.env.REDIS_URL, {
	lazyConnect: true,
});

export async function wrapRedis<T>(
	key: string,
	fn: () => Promise<T>,
	seconds = 60
): Promise<T> {
	const cached = await redis.get(key);
	if (cached) return JSON.parse(cached);
	const recent = await fn();

	await redis.set(key, JSON.stringify(recent), 'ex', seconds);

	return recent;
}
