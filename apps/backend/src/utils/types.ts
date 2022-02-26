import {Lesson, Task, TaskInfo} from '@prisma/client';

export type StrictOmit<T, E extends keyof T> = Omit<T, E> & {
	[key in E]?: never;
};

export type ExtendedUser<T> = T & {
	lessons: (Lesson & {
		tasks: (Task & {info: TaskInfo})[];
	})[];
};
