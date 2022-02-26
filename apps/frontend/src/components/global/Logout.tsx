import {Flex, HStack, Icon, Text, useColorMode} from '@chakra-ui/react';
import {useActions} from '../../utils/actions';
import {toast} from 'react-hot-toast';
import {toastOptions} from '../../utils/toast';
import {useRouter} from 'next/router';
import {mutate} from 'swr';
import {RiLogoutBoxLine} from 'react-icons/ri';
import * as React from 'react';

export const Logout = () => {
	const {setColorMode} = useColorMode();
	const actions = useActions();

	const router = useRouter();

	return (
		<Flex
			transition="border 0.1s ease"
			cursor="pointer"
			alignItems={'center'}
			onClick={() =>
				toast.promise(
					actions
						.logout()
						.then(async () => {
							await mutate('/@me', null, true);
							await router.replace('/');
						})
						.then(() => 'Successfully logged out'),
					toastOptions
				)
			}
		>
			<HStack spacing={1}>
				<Icon as={RiLogoutBoxLine} />
				<Text>Logout</Text>
			</HStack>
		</Flex>
	);
};
