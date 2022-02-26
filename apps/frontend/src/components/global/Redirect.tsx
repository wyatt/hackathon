import {useRouter} from 'next/router';
import {useEffect} from 'react';

export function Redirect({to}: {to: string}) {
	const router = useRouter();

	useEffect(() => {
		void router.push(to);
	}, [to]);

	return null;
}
