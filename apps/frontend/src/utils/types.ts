import {HttpResponse} from './api';
import {PrivateUser} from '@todor/shared';

// Helper types

//Types for client objects
export interface LoginValues {
	email: string;
	password: string;
}

export type RegisterValues = LoginValues & {
	name: string;
};

//Useless types to please the TS gods
export type AuthFormText = {
	title: string;
	changeQuestion: string;
	linkAddress: string;
};

export type Actions = {
	auth<T>(mode: string, form: T): Promise<HttpResponse<PrivateUser>>;
	logout(): Promise<HttpResponse<'OK'>>;
};
