import {
	Button,
	Container,
	FormControl,
	FormLabel,
	HStack,
	Input,
	Text,
	VStack,
} from '@chakra-ui/react';
import {HabitcaCredentials} from '@todor/shared/src/index';
import {taskSchema} from '../utils/schemas/task';
import {useState} from 'react';
import {habiticaSchema} from '../utils/schemas/user';
import {TopBar} from '../components/global/Topbar';
import * as React from 'react';
import {useActions} from '../utils/actions';
import {useMe} from '../utils/hooks';
import {mutate} from 'swr';

export default () => {
	return (
		<Container maxW={'5xl'} w={'full'} textAlign={'left'}>
			<TopBar />
			<LinkHabitica />
		</Container>
	);
};

const LinkHabitica = () => {
	const {data: me} = useMe();
	const [credentials, setCredentials] = useState({
		userId: '',
		apiKey: '',
	});
	const actions = useActions();
	const [disabled, setDisabled] = useState<boolean>(true);

	if (!me) return null;

	const credentialParser = (
		key: keyof HabitcaCredentials,
		value: HabitcaCredentials[keyof HabitcaCredentials]
	) => {
		setCredentials(c => ({...c, [key]: value}));
		const parsed = habiticaSchema.safeParse({...credentials, [key]: value});
		setDisabled(!parsed.success);
	};

	const submitHabitica = async () => {
		const user = await actions.linkHabitica(credentials);
		await mutate('/@me', user);
		setCredentials({userId: '', apiKey: ''});
	};

	const unlinkHabitica = async () => {
		const user = await actions.unlinkHabitica();
		await mutate('/@me', user);
		setCredentials({userId: '', apiKey: ''});
	};

	return (
		<VStack w={'96'}>
			<FormControl mt={4} isRequired>
				<FormLabel>User ID</FormLabel>
				<Input
					placeholder={me.habiticaUserId ?? 'User ID'}
					onChange={e => credentialParser('userId', e.target.value)}
				/>
			</FormControl>
			<FormControl mt={4} isRequired>
				<FormLabel>API Key</FormLabel>
				<Input
					placeholder={me.habiticaUserId ? 'Unchanged' : 'API Key'}
					onChange={e => credentialParser('apiKey', e.target.value)}
				/>
			</FormControl>

			<HStack w="full" justifyContent={'flex-end'} pt={2}>
				{me.habiticaUserId && (
					<Button
						colorScheme={'red'}
						variant={'outline'}
						onClick={unlinkHabitica}
					>
						Unlink
					</Button>
				)}
				<Button
					colorScheme={'purple'}
					disabled={disabled}
					onClick={submitHabitica}
				>
					Link Habitica
				</Button>
			</HStack>
			<Text color={'red'}>
				⚠️ Warning: Your tasks will not be <strong>deleted</strong> in Habitica.
				This is an issue with the Habitica API
			</Text>
		</VStack>
	);
};
