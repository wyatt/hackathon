import {HttpException, resource} from '../utils/api';
import {PrivateUser} from '@todor/shared';
import {getSession} from '../utils/session';
import {wrapRedis} from '../utils/wrap-redis';
import {prisma} from '../prisma';
import md5 from 'md5';

export const me = resource<PrivateUser>({
	async GET(req) {
		const session = await getSession(req);

		const user = await wrapRedis(`@me:${session.user}`, () => {
			return prisma.user.findFirst({where: {id: session.user}});
		});

		if (!user) {
			throw new HttpException(500, 'Unknown User');
		}

		const {password, ...rest} = user;

		return {...rest, avatar_hash: md5(rest.email)};
	},
});
