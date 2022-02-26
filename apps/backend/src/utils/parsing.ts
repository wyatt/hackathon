import {Request} from 'express';
import {customNewTask, publicNewTask, TaskUpdate} from '@revisio/shared';
import {getSession} from './session';
import {HttpException} from './api';
import {
	approveTaskSchema,
	customTaskAddSchema,
	publicTaskAddSchema,
	taskUpdateSchema,
} from '../schemas/tasks';
import {lessonSubscriptionSchema} from '../schemas/lessons';
import {followeeSchemaEmail, followeeSchemaId} from '../schemas/friends';
import {serviceUpdateSchema} from '../schemas/serivces';
import {object, string} from 'zod';
import {prisma} from '../prisma';

export const taskIsLegitimate = async (req: Request): Promise<TaskUpdate> => {
	const update = taskUpdateSchema.parse(req.body);
	const taskExistsOnUser = await prisma.task.findFirst({
		where: {
			id: update.id,
			userId: (await getSession(req)).user,
		},
	});
	if (!taskExistsOnUser) {
		throw new HttpException(401, 'Task not present on user');
	}
	return update;
};

export const taskDeleteIsLegitimate = async (
	req: Request
): Promise<{id: string}> => {
	const update = object({id: string()}).parse(req.body);
	const taskExistsOnUser = await prisma.taskInfo.findFirst({
		where: {
			id: update.id,
			scope: 'user',
			userId: (await getSession(req)).user,
		},
	});
	if (!taskExistsOnUser) {
		throw new HttpException(401, 'Task not present on user');
	}
	return update;
};

export const newTaskIsLegitimate = async (
	req: Request,
	userId: string
): Promise<customNewTask | publicNewTask> => {
	if (!req.body.scope) throw new HttpException(400, 'Scope was not provided');

	const update = (
		req.body.scope === 'global' ? publicTaskAddSchema : customTaskAddSchema
	).parse(req.body) as customNewTask | publicNewTask;

	// Paywall check
	if (update.scope === 'user') {
		const user = await prisma.user.findUnique({where: {id: userId}});
		if (user!.plan < 1) throw new HttpException(402, 'Pay for a plan! 💸');
	}

	// ID corresponds to a lessonInfo Object
	const correspondingLesson = await prisma.lessonInfo.findUnique({
		where: {id: update.id},
		include: {
			tasks: true,
		},
	});

	if (!correspondingLesson)
		throw new HttpException(404, 'Lesson does not exist');

	// Check if empty or if user is subscribed to lesson
	const userLessonValid = !!(
		(await prisma.lesson.findUnique({
			where: {
				userId_infoId: {
					userId,
					infoId: update.id,
				},
			},
		})) ||
		correspondingLesson.tasks.filter(t => t.status === 'global').length === 0
	);

	if (!userLessonValid)
		throw new HttpException(
			403,
			`You're not subscribed to this lesson ${correspondingLesson.tasks.map(
				t => t.id
			)}`
		);

	// Task is not in backlog
	if (update.scope === 'global') {
		const taskInBacklog = await prisma.taskInfo.findUnique({
			where: {
				url: update.url,
			},
		});

		if (!taskInBacklog)
			throw new HttpException(404, 'Task is not in backlog. Sorry!');
	}

	// Task already exists (url based)
	const taskAlreadyExistsOnLesson = await prisma.taskSubmissions.findFirst({
		where: {
			lesson: {id: update.id},
			task: {url: update.url},
			OR: [{status: 'active'}, {users: {some: {userId}}}],
		},
	});

	if (taskAlreadyExistsOnLesson)
		throw new HttpException(401, 'Task already exists');

	return update;
};

export const lessonSubscriptionIsLegitimate = async (
	req: Request
): Promise<{id: string}> => {
	const update = lessonSubscriptionSchema.parse(req.body);
	const lessonExists = await prisma.lessonInfo.findUnique({
		where: {
			id: update.id,
		},
	});

	if (!lessonExists) {
		throw new HttpException(404, 'No lesson found with that id');
	}
	return update;
};

export const followeeIsLegitimate = async (
	req: Request,
	userId: string,
	email: boolean
): Promise<{id: string}> => {
	const schema = email ? followeeSchemaEmail : followeeSchemaId;
	const update = schema.parse(req.body);
	const followeeExists = await prisma.user.findUnique({
		where: update,
		include: {
			followers: true,
		},
	});
	if (!followeeExists) {
		throw new HttpException(404, 'No user with that email.');
	}
	if (followeeExists.id === userId) {
		throw new HttpException(409, "You can't add yourself as a friend 😢");
	}

	return {id: followeeExists.id};
};

export const serviceIsLegitimate = async (req: Request, userId: string) => {
	const {id, enabled} = serviceUpdateSchema.parse(req.body);
	const serviceExistsOnUser = await prisma.service.findFirst({
		where: {
			id,
			users: {
				some: {
					id: userId,
				},
			},
		},
	});
	if ((enabled && serviceExistsOnUser) || (!enabled && !serviceExistsOnUser)) {
		throw new HttpException(409, 'Service update is already correct');
	}
	return {id, enabled};
};

export const approvalIsLegitimate = async (
	req: Request
): Promise<{id: string}> => {
	const {id} = approveTaskSchema.parse(req.body);

	const submissionExists = await prisma.taskSubmissions.findUnique({
		where: {id},
	});
	if (!submissionExists) {
		throw new HttpException(404, 'No submission found with that id');
	}

	return {id};
};

// scope: global, user
// status: active, pending (only if scope global)
