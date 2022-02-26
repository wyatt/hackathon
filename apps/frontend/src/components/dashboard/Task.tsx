import {
	Button,
	FormControl,
	FormLabel,
	HStack,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Tag,
	Text,
	useBoolean,
	useDisclosure,
} from '@chakra-ui/react';
import {useState} from 'react';
import {TaskType} from '@todor/shared/src/index';
import {taskSchema} from '../../utils/schemas/task';
import {useTags} from '../../utils/hooks';

export const Task = (props: {name: string}) => {
	return (
		<HStack
			p={4}
			border="4px"
			borderColor="purple.700"
			w={'full'}
			justifyContent={'space-between'}
		>
			<Text>{props.name}</Text>
			<HStack>
				<Tag>!!!</Tag>
			</HStack>
		</HStack>
	);
};

export const CreateTaskModal = () => {
	const {data: allTags} = useTags();
	const {isOpen, onOpen, onClose} = useDisclosure();
	const [disabled, setDisabled] = useState(false);
	const [task, setTask] = useState({
		name: '',
		description: '',
		priority: 0,
		tags: [],
	});

	if (!allTags) return null;

	console.log(allTags);

	const taskParser = (key: keyof TaskType, value: TaskType[keyof TaskType]) => {
		setTask(p => ({...p, [key]: value}));
		const parsed = taskSchema.safeParse({...task, [key]: value});
		console.log(parsed);
		setDisabled(!parsed.success);
	};

	return (
		<>
			<Button colorScheme={'purple'} onClick={onOpen}>
				Create Task
			</Button>

			<Modal isOpen={isOpen} onClose={onClose} colorScheme={'purple'}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Create task</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<FormControl>
							<FormLabel>Name</FormLabel>
							<Input
								placeholder="Task name"
								onChange={e => taskParser('name', e.target.value)}
							/>
						</FormControl>
						{/* TODO: Add markdown support */}
						<FormControl mt={4} isRequired>
							<FormLabel>Description</FormLabel>
							<Input
								placeholder="Description"
								onChange={e => taskParser('description', e.target.value)}
							/>
						</FormControl>
						<FormControl mt={4}>
							<FormLabel>Tags</FormLabel>
							<Input
								placeholder="Tags"
								onChange={e => taskParser('tags', e.target.value)}
							/>
						</FormControl>
					</ModalBody>

					<ModalFooter>
						<Button onClick={onClose}>Cancel</Button>
						<Button colorScheme="purple" ml={3} disabled={disabled}>
							Create Task
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};
