import {fetcher} from './network';
import {PrivateUser, TaskType} from '@todor/shared';
import {TaskInfo} from '@prisma/client';

export function useActions() {
	return {
		auth<T>(mode: string, form: T) {
			return fetcher<PrivateUser>(
				mode === 'login' ? 'POST' : 'PUT',
				'/user',
				form
			);
		},
		logout() {
			return fetcher<'OK'>('POST', '/logout');
		},
		taskCreate(params: TaskType) {
			return fetcher<TaskInfo>('PUT', '/tasks', params);
		},
	};
}
