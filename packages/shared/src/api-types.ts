import type {User} from '@prisma/client';
import {StrictOmit} from './utils';

export type PrivateUser = StrictOmit<User, 'password'> & {
	avatar_hash: string;
};

export type TaskType = {
	name: string;
	description: string;
	priority: 0 | 1 | 2 | 3;
	tags: string[];
};
