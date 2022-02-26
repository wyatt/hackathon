import {compare, hash, hashSync} from 'bcrypt';
import dayjs from 'dayjs';
import {HttpException, resource} from '../utils/api';
import md5 from 'md5';
import {loginUserSchema, registerUserSchema, userSchema} from '../schemas/user';
import {prisma} from '../prisma';
import {generateCookie, getSession, saveSession} from '../utils/session';
import {PrivateUser} from '@todor/shared';

export const users = resource<PrivateUser>({
	async PATCH(req) {
		const {user: id} = await getSession(req);
		const updatedUser = userSchema.parse(req.body);
		const {password, ...user} = await prisma.user.update({
			where: {
				id,
			},
			data: {
				...updatedUser,
				...(updatedUser.password
					? {password: hashSync(updatedUser.password, 12)}
					: {}),
			},
		});
		return {...user, avatar_hash: md5(user.email)};
	},
	async DELETE(req) {
		const {user: id} = await getSession(req);

		//TODO: Add custom task_info deletion
		const [{password, ...user}] = await prisma.$transaction([
			prisma.user.delete({
				where: {
					id,
				},
			}),
		]);
		return {...user, avatar_hash: md5(user.email)};
	},
	async POST(req, res) {
		const reqUser = loginUserSchema.parse(req.body);
		const queryUser = await prisma.user.findUnique({
			where: {email: reqUser.email},
		});
		if (!queryUser)
			throw new HttpException(404, 'No user found with that email');
		if (!(await compare(reqUser.password, queryUser.password)))
			throw new HttpException(401, 'Incorrect username or password');

		const useExtendedToken = reqUser.remember === true;

		const token = await saveSession(
			{user: queryUser.id, at: new Date()},
			useExtendedToken ? 'week' : 'day'
		);

		const expiry = dayjs()
			.add(1, useExtendedToken ? 'week' : 'day')
			.toDate();

		const cookie = generateCookie(token, expiry);
		res.setHeader('Set-Cookie', cookie);
		const {password, ...user} = queryUser;

		return {...user, avatar_hash: md5(user.email)};
	},
	async PUT(req) {
		const newUser = registerUserSchema.parse(req.body);
		const existingUser = await prisma.user.findUnique({
			where: {
				email: newUser.email,
			},
		});
		if (existingUser) throw new HttpException(409, 'Email already in use');

		const {password, ...user} = await prisma.user.create({
			data: {
				name: newUser.name,
				email: newUser.email,
				password: await hash(newUser.password, 12),
			},
		});
		return {...user, avatar_hash: md5(newUser.email)};
	},
});
