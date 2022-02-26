import {array, number, object, string} from 'zod';

export const taskSchema = object({
	name: string().nonempty(),
	description: string().nonempty(),
	priority: number().max(3).min(0),
	tags: array(string()),
});

export const updateTaskSchema = object({
	id: string().nonempty(),
	q: number().max(5).min(0),
});
