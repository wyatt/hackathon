import {HttpException, resource} from '../utils/api';
import {getSession} from '../utils/session';
import {habiticaSchema} from '../schemas/user';
import {prisma} from '../prisma';
import fetch from 'node-fetch';

export const habitica = resource({
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

		await prisma.user.update({
			where: {id},
			data: {
				habiticaUserId: userId,
				habiticaApiKey: apiKey,
			},
		});
	},
});
