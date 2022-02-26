import {resource} from '../utils/api';
import {getSession} from '../utils/session';
import {prisma} from '../prisma';

export const tags = resource({
	async GET(req) {
		const {user: id} = await getSession(req);

		return await prisma.tag.findMany({
			where: {
				userId: id,
			},
		});
	},
});
