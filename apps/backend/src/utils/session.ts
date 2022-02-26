import {serialize} from 'cookie';
import {redis} from './wrap-redis';
import {Request} from 'express';
import {HttpException} from './api';
import crypto from 'crypto';
import {User} from '@prisma/client';

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const ONE_WEEK_IN_SECONDS = ONE_DAY_IN_SECONDS * 7;

interface Session {
	user: User['id'];
	at: Date | string;
}

const cookieName = '_revisio_sess';

export async function getSession(req: Request): Promise<Session> {
	const key = sessionKeyFromRequest(req);
	const result = await redis.get(`session:${key}`);

	if (!result) {
		throw new HttpException(401, 'You are not logged in');
	}

	return JSON.parse(result);
}

export async function getSessionSafe(req: Request): Promise<Session | null> {
	const result = await getSession(req).catch(e => null);
	return result;
}

async function generateUniqueSessionKey(): Promise<string> {
	const key = crypto.randomBytes(128).toString('hex');
	const exists = (await redis.exists(`session:${key}`)) > 0;

	if (exists) return generateUniqueSessionKey();

	return key;
}

export async function saveSession(session: Session, expiry: 'week' | 'day') {
	const key = await generateUniqueSessionKey();

	await redis.set(
		`session:${key}`,
		JSON.stringify(session),
		'ex',
		expiry === 'week' ? ONE_WEEK_IN_SECONDS : ONE_DAY_IN_SECONDS
	);

	return key;
}

export function sessionKeyFromRequest(req: Request): string {
	if (!req.cookies[cookieName]) {
		throw new HttpException(401, 'You are not logged in');
	}

	return req.cookies[cookieName];
}

export async function revokeSession(key: string) {
	await redis.del(`session:${key}`);
}

export function generateCookie(key: string, expires: Date) {
	return serialize(cookieName, key, {
		httpOnly: true,
		secure: process.env.NODE_ENV !== 'development',
		path: '/',
		sameSite: 'strict',
		expires,
	});
}
