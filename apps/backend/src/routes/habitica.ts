import {HttpException, resource} from '../utils/api';
import {getSession} from '../utils/session';
import {habiticaSchema} from '../schemas/user';
import {prisma} from '../prisma';
import fetch from 'node-fetch';
import {PrivateUser} from '@todor/shared';
import {redis} from '../utils/wrap-redis';

export const habitica = resource<'OK' | PrivateUser>({
	async POST(req) {
		const {user: id} = await getSession(req);
		const {userId, apiKey} = habiticaSchema.parse(req.body);

		const habticaUser = (await fetch('https://habitica.com/api/v3/user', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-api-user': userId,
				'x-api-key': apiKey,
				'x-client': `${userId}-Todor`,
			},
		}).then(res => res.json())) as {success: boolean};
		if (!habticaUser.success)
			throw new HttpException(401, 'Invalid credentials');

		const {habiticaApiKey, password, ...user} = await prisma.user.update({
			where: {id},
			data: {
				habiticaUserId: userId,
				habiticaApiKey: apiKey,
			},
		});

		await redis.del(`@me:${id}`);

		return user;
	},
	async DELETE(req) {
		const {user: id} = await getSession(req);

		const {password, habiticaApiKey, ...user} = await prisma.user.update({
			where: {id},
			data: {
				habiticaUserId: null,
				habiticaApiKey: null,
			},
		});

		await redis.del(`@me:${id}`);

		return user;
	},
});
