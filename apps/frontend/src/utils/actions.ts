import {fetcher} from './network';
import {APITask, PrivateUser, TaskType} from '@todor/shared';
import {TaskInfo} from '@prisma/client';
import {QType} from '../components/dashboard/Task';

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
			return fetcher<APITask>('PUT', '/tasks', params);
		},
		taskDelete(params: {id: string}) {
			return fetcher<TaskInfo>('DELETE', '/tasks', params);
		},
		taskUpdate(params: {id: string; q: QType}) {
			return fetcher<APITask>('PATCH', '/tasks', params);
		},
		linkHabitica(params: {userId: string; apiKey: string}) {
			return fetcher<PrivateUser>('POST', '/habitica', params);
		},
		unlinkHabitica() {
			return fetcher<PrivateUser>('DELETE', '/habitica');
		},
	};
}
