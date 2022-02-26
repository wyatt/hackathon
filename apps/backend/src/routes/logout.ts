import {resource} from '../utils/api';
import {
	generateCookie,
	revokeSession,
	sessionKeyFromRequest,
} from '../utils/session';

export const logout = resource<'OK'>({
	async POST(req, res) {
		await revokeSession(sessionKeyFromRequest(req));

		res.setHeader('Set-Cookie', generateCookie('', new Date()));

		return 'OK';
	},
});
