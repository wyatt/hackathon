import {ZodError} from 'zod';
import {env} from './env';
import {Request, RequestHandler, Response} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';

type HandlerFn<T> = (
	req: Request & {rawBody: Buffer},
	res: Response
) => Promise<T>;

export interface HttpResponse<T> {
	data: T;
	code: number;
}

export function wrapCatch<T>(
	handler: HandlerFn<T>
): RequestHandler<ParamsDictionary, HttpResponse<T>> {
	return async function (req, res) {
		try {
			// @ts-ignore
			const data = await handler(req, res);
			res.json({data, code: req.statusCode || 200});
		} catch (e) {
			if (e instanceof Redirect) {
				return void res.redirect(e.to);
			}

			const code =
				e instanceof HttpException ? e.code : e instanceof ZodError ? 400 : 500;

			const message =
				e instanceof HttpException
					? e.message
					: e instanceof ZodError
					? `Validation error: ${e.errors[0]!.message} for ${e.errors[0]!.path}`
					: env.NodeEnv === 'development'
					? (e as {message: T}).message
					: 'Something went wrong';

			res.status(code).json({data: message, code} as HttpResponse<T>);
		}
	};
}

export type Method = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';

export function resource<T>(handlers: Partial<Record<Method, HandlerFn<T>>>) {
	return wrapCatch((req, res) => {
		const method = req.method as Method;
		const handler = handlers[method];

		if (!handler) {
			throw new HttpException(405, `Cannot ${method} this route.`);
		}

		return handler(req, res);
	});
}

export class HttpException extends Error {
	constructor(public readonly code: number, message: string) {
		super(message);
	}
}

export class Redirect extends Error {
	constructor(public readonly to: string) {
		super('Redirecting...');
	}
}
