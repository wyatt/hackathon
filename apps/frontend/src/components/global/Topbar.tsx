import {chakra, HStack, Text} from '@chakra-ui/react';
import {Logout} from './Logout';
import Link from 'next/link';
import {RiHome2Line, RiSettings2Line} from 'react-icons/ri';
import {useMe} from '../../utils/hooks';

export const TopBar = () => {
	const {data: me} = useMe();
	if (!me) return null;
	return (
		<HStack w={'full'} justifyContent={'space-between'} py={4}>
			<Text>
				Logged in as <chakra.span color={'purple.500'}>{me.name}</chakra.span>
			</Text>
			<HStack spacing={4}>
				<Logout />
				<Link href={'/home'}>
					<HStack alignItems={'center'} cursor={'pointer'}>
						<RiHome2Line />
						<Text ml={1}>Home</Text>
					</HStack>
				</Link>
				<Link href={'/settings'}>
					<HStack alignItems={'center'} cursor={'pointer'}>
						<RiSettings2Line />
						<Text ml={1}>Settings</Text>
					</HStack>
				</Link>
			</HStack>
		</HStack>
	);
};
