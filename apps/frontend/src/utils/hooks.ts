import useSWR from 'swr';
import {PrivateUser} from '@todor/shared';
import {Tag} from '@prisma/client';

export function useMe() {
	return useSWR<PrivateUser | null>('/@me');
}

export function useTags() {
	return useSWR<Tag[] | null>('/tags');
}
