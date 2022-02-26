import {boolean, date, object, string} from 'zod';

const name = string().transform(n => n.trim());
const email = string()
	.email()
	.transform(e => e.trim().toLowerCase());

const password = string();
const registeredAt = date();
const remember = boolean().optional();

export const userSchema = object({
	name,
	email,
	password,
	registeredAt,
}).partial();

export const loginUserSchema = object({email, password, remember});
export const registerUserSchema = object({name, email, password});
export const updateUserSchema = object({name, email, password}).partial();
