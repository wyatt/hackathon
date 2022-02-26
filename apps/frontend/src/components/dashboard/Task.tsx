import {
	Box,
	Button,
	ButtonGroup,
	Checkbox,
	FormControl,
	FormLabel,
	Heading,
	HStack,
	Input,
	Link,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Tag,
	Text,
	Textarea,
	theme,
	useDisclosure,
	VStack,
} from '@chakra-ui/react';
import {useState} from 'react';
import {APITask, TaskType} from '@todor/shared/src/index';
import {taskSchema} from '../../utils/schemas/task';
import {useTags} from '../../utils/hooks';
import {useActions} from '../../utils/actions';
import {toast} from 'react-hot-toast';
import dayjs, {Dayjs} from 'dayjs';
import {TaskGraph} from './TaskGraph';
import {
	RiDeleteBin2Line,
	RiInformationLine,
	RiLineChartLine,
} from 'react-icons/all';
import {AnimatePresence, motion} from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import {mutate} from 'swr';

export type QType = 0 | 1 | 2 | 3 | 4 | 5;

const newTheme = {
	h1: props => {
		const {children} = props;
		return (
			<Heading mb={2} fontSize={24}>
				{children}
			</Heading>
		);
	},
	h2: props => {
		const {children} = props;
		return (
			<Heading mb={2} fontSize={20}>
				{children}
			</Heading>
		);
	},
	h3: props => {
		const {children} = props;
		return (
			<Heading mb={2} fontSize={16}>
				{children}
			</Heading>
		);
	},
	a: props => {
		const {children} = props;
		return (
			<Link mb={2} color={'blue'}>
				{children}
			</Link>
		);
	},
};

export const Task = (props: {
	task: APITask;
	i: number;
	hue: keyof typeof theme['colors'];
	findFn: (d: Dayjs) => boolean;
}) => {
	const [revealDescription, setRevealDescription] = useState<boolean>(false);
	const [revealChart, setRevealChart] = useState<boolean>(false);

	const actions = useActions();
	const task = props.task.tasks.find(t => props.findFn(dayjs(t.due)))!;

	const deleteTask = async () => {
		await actions.taskDelete({id: props.task.id});
		await mutate('/tasks', (t: APITask[]) =>
			t.filter(task => task.id !== props.task.id)
		);
	};

	return (
		<VStack
			border="4px"
			borderColor={`${props.hue}.${Math.min(200 + props.i * 100, 900)}`}
			w={'full'}
			alignItems={'flex-start'}
			transition={'all 1s ease'}
			bg={
				task.completed
					? `${props.hue}.${Math.min(200 + props.i * 100, 900)}`
					: '#fff'
			}
			spacing={0}
		>
			<HStack w={'full'} justifyContent={'space-between'} p={4}>
				<HStack spacing={6}>
					<EFSelect
						q={(task.q as QType) ?? undefined}
						id={props.task.id}
						disabled={dayjs(task.due).isAfter(dayjs().endOf('day'))}
						hue={props.hue}
					/>

					<Text>{props.task.name}</Text>
				</HStack>

				<HStack>
					{props.task.priority && (
						<Tag
							colorScheme={['yellow', 'orange', 'red'][props.task.priority - 1]}
						>
							{'!'.repeat(props.task.priority)}
						</Tag>
					)}
					<Tag>{dayjs(task.due).format('MMM D')}</Tag>
					<Button
						size={'xs'}
						onClick={() => setRevealDescription(r => !r)}
						variant={revealDescription ? 'solid' : 'ghost'}
						colorScheme={props.hue}
					>
						<RiInformationLine />
					</Button>
					<Button
						size={'xs'}
						onClick={() => setRevealChart(r => !r)}
						variant={revealChart ? 'solid' : 'ghost'}
						colorScheme={props.hue}
					>
						<RiLineChartLine />
					</Button>
					<Button size={'xs'} onClick={deleteTask} colorScheme={'red'}>
						<RiDeleteBin2Line />
					</Button>
				</HStack>
			</HStack>
			{revealDescription && (
				<Heading size={'sm'} p={2} color={props.hue + '.700'}>
					DESCRIPTION
				</Heading>
			)}
			<AnimatePresence initial={false}>
				{revealDescription && (
					<motion.div
						key="content"
						initial="collapsed"
						animate="open"
						exit="collapsed"
						variants={{
							open: {transform: 'scaleY(1)', maxHeight: '500px'},
							collapsed: {transform: 'scaleY(0)', maxHeight: 0},
						}}
						transition={{duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98]}}
						style={{
							width: '100%',
							background: 'white',
							transformOrigin: 'top',
						}}
					>
						<VStack p={4} alignItems={'flex-start'}>
							<Box w={'full'}>
								<ReactMarkdown
									components={ChakraUIRenderer(newTheme)}
									children={props.task.description}
									skipHtml
								/>
							</Box>
						</VStack>
					</motion.div>
				)}
			</AnimatePresence>
			{revealChart && (
				<Heading size={'sm'} p={2} color={props.hue + '.700'}>
					CHART
				</Heading>
			)}
			<AnimatePresence initial={false}>
				{revealChart && (
					<motion.div
						key="content"
						initial="collapsed"
						animate="open"
						exit="collapsed"
						variants={{
							open: {transform: 'scaleY(1)', maxHeight: '500px'},
							collapsed: {transform: 'scaleY(0)', maxHeight: 0},
						}}
						transition={{duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98]}}
						style={{
							width: '100%',
							background: 'white',
							transformOrigin: 'top',
						}}
					>
						<VStack p={4} alignItems={'flex-start'}>
							<Box w={'full'}>
								<TaskGraph tasks={props.task.tasks} hue={props.hue} />
							</Box>
						</VStack>
					</motion.div>
				)}
			</AnimatePresence>
		</VStack>
	);
};

const EFSelect = (props: {
	q?: QType;
	id: string;
	disabled: boolean;
	hue: string;
}) => {
	const actions = useActions();
	const updateTask = async (q: QType) => {
		const res = await actions.taskUpdate({id: props.id, q});
		await mutate('/tasks', (t: APITask[]) => [
			...t.filter(task => task.id !== res.data.id),
			res.data,
		]);
	};

	return (
		<ButtonGroup
			variant={'ghost'}
			size={'sm'}
			spacing={0}
			isDisabled={props.disabled}
			colorScheme={props.hue}
		>
			{['😁', '🤔', '😕', '🤦‍', '😤', '😡'].map((e, i) => (
				<Button
					p={1}
					variant={5 - i === props.q ? 'solid' : 'ghost'}
					key={e}
					onClick={() => updateTask((5 - i) as QType)}
				>
					{e}
				</Button>
			))}
		</ButtonGroup>
	);
};

export const CreateTaskModal = () => {
	const {data: allTags} = useTags();
	const actions = useActions();
	const {isOpen, onOpen, onClose} = useDisclosure();
	const [disabled, setDisabled] = useState(false);
	const [task, setTask] = useState({
		name: '',
		description: '',
		priority: 0 as 0 | 1 | 2 | 3,
		tags: [],
	});

	if (!allTags) return null;

	const taskParser = (key: keyof TaskType, value: TaskType[keyof TaskType]) => {
		setTask(p => ({...p, [key]: value}));
		const parsed = taskSchema.safeParse({...task, [key]: value});
		setDisabled(!parsed.success);
	};

	const submitTask = async () => {
		const res = await toast.promise(actions.taskCreate(task), {
			loading: 'Creating task',
			success: 'Task successfully created',
			error: 'Failed to create task',
		});
		await mutate('/tasks', (t: APITask[]) => [...t, res.data]);
		onClose();
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
							<Textarea
								placeholder="Description"
								onChange={e => taskParser('description', e.target.value)}
							/>
						</FormControl>
						{/*<FormControl mt={4}>*/}
						{/*	<FormLabel>Tags</FormLabel>*/}
						{/*	<Input*/}
						{/*		placeholder="Tags"*/}
						{/*		onChange={e => taskParser('tags', e.target.value)}*/}
						{/*	/>*/}
						{/*</FormControl>*/}
						<FormControl mt={4} d={'flex'} alignItems={'center'}>
							<FormLabel m={0} mr={4}>
								Priority:
							</FormLabel>
							<PrioritySelector
								value={task.priority}
								onChange={v => taskParser('priority', v)}
							/>
						</FormControl>
					</ModalBody>

					<ModalFooter>
						<Button onClick={onClose}>Cancel</Button>
						<Button
							colorScheme="purple"
							ml={3}
							disabled={disabled}
							onClick={submitTask}
						>
							Create Task
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

const PrioritySelector = (props: {
	onChange: (v: TaskType['priority']) => void;
	value: TaskType['priority'];
}) => {
	const arr: TaskType['priority'][] = [0, 1, 2, 3];

	return (
		<HStack>
			{arr.map(v => {
				return (
					<Tag
						key={v}
						variant={props.value === v ? 'solid' : 'outline'}
						onClick={() => props.onChange(v)}
						colorScheme={['gray', 'yellow', 'orange', 'red'][v]}
						cursor={'pointer'}
						size={'lg'}
					>
						{v === 0 ? 'None' : '!'.repeat(v)}
					</Tag>
				);
			})}
		</HStack>
	);
};
