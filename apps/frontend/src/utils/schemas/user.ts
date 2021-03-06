import {boolean, object, string} from 'zod';

const name = string().transform(n => n.trim());
const email = string()
	.email()
	.transform(e => e.trim().toLowerCase());

const password = string();
const remember = boolean().optional();

export const loginUserSchema = object({email, password, remember});
export const registerUserSchema = object({name, email, password});

export const habiticaSchema = object({
	userId: string().nonempty(),
	apiKey: string().nonempty(),
});
