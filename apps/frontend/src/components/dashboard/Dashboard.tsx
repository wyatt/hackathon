import {useMe} from '../../utils/hooks';
import {
	Button,
	chakra,
	Container,
	Heading,
	HStack,
	Text,
	VStack,
} from '@chakra-ui/react';
import {Logout} from '../global/Logout';
import {CreateTaskModal, Task} from './Task';

export const Dashboard = () => {
	const {data: me} = useMe();
	if (!me) return null;
	return (
		<Container maxW={'5xl'} w={'full'}>
			<HStack w={'full'} justifyContent={'space-between'} py={4}>
				<Text>
					Logged in as <chakra.span color={'purple.500'}>{me.name}</chakra.span>
				</Text>
				<Logout />
			</HStack>
			<HStack w={'full'} justifyContent={'space-between'} mt={24}>
				<Heading>You have 5 tasks due today</Heading>
				<CreateTaskModal />
			</HStack>
			<VStack mt={10}>
				<Task name={'Test task 1'} />
				<Task name={'Test task 2'} />
				<Task name={'Test task 3'} />
			</VStack>
		</Container>
	);
};
