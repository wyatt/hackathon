import {StrictOmit} from './utils';
import {Task, TaskInfo, User} from '@prisma/client';

export type PrivateUser = StrictOmit<User, 'password' | 'habiticaApiKey'>;
export type TaskType = {
	name: string;
	description: string;
	priority: 0 | 1 | 2 | 3;
	tags: string[];
};

export type APITask = TaskInfo & {tasks: Task[]};

export type HabitcaCredentials = {
	userId: string;
	apiKey: string;
};
