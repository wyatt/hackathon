import express, {NextFunction, Request, Response} from 'express';
import 'express-async-errors';
import signale from 'signale';

import {api} from './routes';

import cookieParser from 'cookie-parser';
import {HttpException} from './utils/api';
import cors from 'cors';
import {ZodError} from 'zod';
import {redis} from './utils/wrap-redis';
import {env} from './utils/env';
import * as http from 'http';
import {prisma} from './prisma';

const app = express();

app.use(cookieParser());
app.use((req, res, next) => {
	express.json({
		verify: (
			req: http.IncomingMessage & {rawBody: Buffer},
			res: http.ServerResponse,
			buf: Buffer
		) => {
			req.rawBody = buf;
		},
	})(req, res, err => {
		if (err) {
			signale.error(err);
			res.sendStatus(400);
			return;
		}
		next();
	});
});

app.use(
	cors({
		origin:
			env.NodeEnv === 'development'
				? 'http://localhost:3000'
				: 'https://www.revisio.app',
		credentials: true,
	})
);

app.use(api);

app.get('/', (_req, res) => {
	res.json({info: 'Something is working at least'});
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
	if (err instanceof HttpException) {
		return res.status(err.code).json({message: err.message});
	} else if (err instanceof ZodError) {
		return res.status(422).json({message: err.errors});
	} else {
		signale.error(err);
		return res.status(500).json({message: 'Something went wrong on our side'});
	}
});

(async () => {
	await prisma.$connect();
	await redis.connect();
	app.listen(env.Port, () => {
		signale.success(`Launched on port ${env.Port}`);
	});
})().catch(e => {
	console.error(e);
	signale.error(e);
	process.exit(1);
});
