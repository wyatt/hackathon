import {HttpException, resource} from '../utils/api';
import {getSession} from '../utils/session';
import {taskSchema, updateTaskSchema} from '../schemas/task';
import {prisma} from '../prisma';
import dayjs from 'dayjs';
import {TaskInfo} from '@prisma/client';
import {APITask} from '@todor/shared/src/index';
import {object, string} from 'zod';
import signale from 'signale';
import fetch from 'node-fetch';

export const tasks = resource<TaskInfo | APITask[]>({
	async GET(req) {
		const {user: id} = await getSession(req);
		const tasks = await prisma.taskInfo.findMany({
			where: {
				userId: id,
			},
			include: {
				tasks: true,
			},
		});

		return tasks;
	},
	async PUT(req) {
		const {user: id} = await getSession(req);
		const {tags, ...params} = taskSchema.parse(req.body);

		const task = await prisma.taskInfo.create({
			data: {
				...params,
				user: {
					connect: {id},
				},
				tags: {
					connect: tags.map(t => ({
						id: t,
					})),
				},
				tasks: {
					createMany: {
						data: [
							{
								due: dayjs().toDate(),
							},
						],
					},
				},
			},
			include: {
				tasks: true,
			},
		});

		const user = (await prisma.user.findUnique({where: {id}}))!;

		if (user.habiticaUserId && user.habiticaApiKey) {
			await fetch('https://habitica.com/api/v3/tasks/user', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-api-user': user.habiticaUserId,
					'x-api-key': user.habiticaApiKey,
					'x-client': `${user.habiticaUserId}-Todor`,
				},
				body: JSON.stringify({
					text: `${task.name} (${task.priority})`,
					type: 'todo',
					notes: task.description,
					date: dayjs().toDate(),
				}),
			});
		}

		return task;
	},
	async PATCH(req) {
		const {user: userId} = await getSession(req);
		const {id, q} = updateTaskSchema.parse(req.body);

		const taskInfoToUpdate = await prisma.taskInfo.findFirst({
			where: {
				id,
				userId,
			},
			include: {
				tasks: true,
			},
		});

		if (!taskInfoToUpdate || !taskInfoToUpdate.tasks.length) {
			throw new HttpException(404, 'Task not found');
		}

		const user = (await prisma.user.findUnique({
			where: {id: userId},
		}))!;

		// 1. Find the task that the user is completing. This will be the most recent task that it is possible for the user to complete
		// 1.1 What happens if a user has a task that is overdue and a task scheduled for the next day?
		// 1.2 Solution: Only create a task for the next day once the user has completed their task

		const taskBeingCompleted = taskInfoToUpdate.tasks
			.reverse()
			.find(t => dayjs(t.due).isBefore(dayjs().add(1, 'day').startOf('day')));

		if (!taskBeingCompleted) {
			throw new HttpException(400, 'Invalid task to update');
		}

		const updatedTask = await prisma.task.update({
			where: {
				id: taskBeingCompleted.id,
			},
			data: {
				q,
				completed: dayjs().toDate(),
			},
		});

		if (
			updatedTask.habiticaTaskId &&
			user.habiticaUserId &&
			user.habiticaApiKey
		) {
			await fetch(
				`https://habitica.com/api/v3/tasks/${updatedTask.habiticaTaskId}/score/up`
			);
		}

		const idx =
			taskInfoToUpdate.tasks
				.sort((a, b) => dayjs(a.due).diff(dayjs(b.due)))
				.findIndex(t => t.id === updatedTask.id) + 1;

		const nextTask = taskInfoToUpdate.tasks[idx];
		const interRepInterval =
			idx <= 2
				? ([1, 6][idx - 1] as number)
				: dayjs(updatedTask.due).diff(
						dayjs(taskInfoToUpdate.tasks[idx - 2]!.due),
						'days'
				  ) *
				  Math.max(
						updatedTask.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
						1.3
				  );

		let habiticaTaskId = null;

		if (user.habiticaUserId && user.habiticaApiKey) {
			const existingTask = await prisma.task.findFirst({
				where: {
					id: nextTask?.id || '',
				},
			});

			if (existingTask?.habiticaTaskId) {
				await fetch(`https://habitica.com/api/v3/tasks/${habiticaTaskId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'x-api-user': user.habiticaUserId,
						'x-api-key': user.habiticaApiKey,
						'x-client': `${user.habiticaUserId}-Todor`,
					},
					body: JSON.stringify({
						date: dayjs(updatedTask.due).add(interRepInterval, 'days').toDate(),
					}),
				});
			} else {
				const res = (await fetch('https://habitica.com/api/v3/tasks/user', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'x-api-user': user.habiticaUserId,
						'x-api-key': user.habiticaApiKey,
						'x-client': `${user.habiticaUserId}-Todor`,
					},
					body: JSON.stringify({
						text: `${taskInfoToUpdate.name} (${taskInfoToUpdate.priority})`,
						notes: taskInfoToUpdate.description,
						date: dayjs(updatedTask.due).add(interRepInterval, 'days').toDate(),
					}),
				}).then(res => res.json())) as {success: boolean; data: {_id: string}};

				if (res.success) {
					habiticaTaskId = res.data._id;
				}
			}
		}

		await prisma.task.upsert({
			where: {
				id: nextTask?.id || '',
			},
			create: {
				due: dayjs(updatedTask.due).add(interRepInterval, 'days').toDate(),
				ef: Math.max(
					updatedTask.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
					1.3
				),
				info: {connect: {id: taskInfoToUpdate.id}},
				habiticaTaskId,
			},
			update: {
				due: dayjs(updatedTask.due).add(interRepInterval, 'days').toDate(),
				ef: Math.max(
					updatedTask.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
					1.3
				),
				habiticaTaskId,
			},
		});

		return (await prisma.taskInfo.findFirst({
			where: {id, userId},
			include: {tasks: true},
		}))!;
	},
	async DELETE(req) {
		const {user: userId} = await getSession(req);
		const {id} = object({id: string()}).parse(req.body);

		const taskExistsOnUser = await prisma.taskInfo.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!taskExistsOnUser)
			throw new HttpException(404, 'Task could not be found');

		const task = await prisma.taskInfo.delete({
			where: {
				id,
			},
		});

		return task;
	},
});
