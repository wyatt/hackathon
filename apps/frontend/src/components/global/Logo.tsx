import {Heading, HeadingProps} from '@chakra-ui/react';
import Link from 'next/link';
import * as React from 'react';
import {useMe} from '../../utils/hooks';

export const Logo = (props: HeadingProps) => {
	const {data} = useMe();

	return (
		<Link href={data ? '/home' : '/'}>
			<Heading
				fontSize={'lg'}
				fontWeight={'600'}
				color={'purple.700'}
				_hover={{
					bgPos: '-65px',
				}}
				cursor={'pointer'}
				{...props}
			>
				Todor
			</Heading>
		</Link>
	);
};
