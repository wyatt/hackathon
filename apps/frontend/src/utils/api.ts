export type Method = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
export interface HttpResponse<T> {
	data: T;
	code: number;
}
