import {Router} from 'express';
import {env} from '../utils/env';
import {users} from './user';
import {me} from './@me';
import {logout} from './logout';
import {tags} from './tags';
// import { router as lessons } from "./lessons";

export const api = Router();

api.use('/user', users);
api.use('/logout', logout);
api.use('/@me', me);
api.use('/tags', tags);

api.get('/logout', (req, res) => {
	res.cookie('token', '', {
		httpOnly: true,
		sameSite: 'lax',
		secure: env.NodeEnv === 'production',
		expires: new Date(),
	});

	res.end();
});
