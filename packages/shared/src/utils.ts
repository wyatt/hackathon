export type StrictOmit<T, E extends keyof T> = Omit<T, E> & {
	[key in E]?: never;
};
