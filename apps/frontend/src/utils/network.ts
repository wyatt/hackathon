import {Method} from './api';

export async function fetcher<T>(
	method: Method,
	endpoint: string,
	body?: unknown
): Promise<{data: T; code: number}> {
	const request = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
		method,
		headers: body ? {'Content-Type': 'application/json'} : undefined,
		body: body ? JSON.stringify(body) : undefined,
		credentials: 'include',
	});

	const json = await request.json();

	if (request.status >= 400) {
		throw new Error(`${json.data}`);
	}

	return json;
}
