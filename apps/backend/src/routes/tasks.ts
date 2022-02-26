import {resource} from '../utils/api';
import {getSession} from '../utils/session';
import {taskSchema} from '../schemas/task';
import {prisma} from '../prisma';

export const tasks = resource({
	async PUT(req) {
		const {user: id} = await getSession(req);
		const params = taskSchema.parse(req.body);

		const task = await prisma.task
	},
});
