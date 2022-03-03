import {useMe, useTasks} from '../../utils/hooks';
import {
	Button,
	chakra,
	Container,
	Heading,
	HStack,
	Text,
	theme,
	VStack,
} from '@chakra-ui/react';
import {Logout} from '../global/Logout';
import {CreateTaskModal, Task} from './Task';
import dayjs, {Dayjs} from 'dayjs';
import {APITask} from '@todor/shared/src/index';
import {RiHome2Line, RiSettings2Line} from 'react-icons/ri';
import Link from 'next/link';
import {TopBar} from '../global/Topbar';

export const Dashboard = () => {
	const {data: me} = useMe();
	const {data: allTasks} = useTasks();
	if (!me || !allTasks) return null;

	const tasks = allTasks.filter(
		t => !dayjs(lt(t).completed).isBefore(dayjs().startOf('day'))
	);

	const dueTasks = tasks.filter(t =>
		dayjs(lt(t).due).isBefore(dayjs().add(1, 'day'))
	);

	return (
		<Container maxW={'5xl'} w={'full'} textAlign={'left'}>
			<TopBar />
			<HStack w={'full'} justifyContent={'space-between'} mt={24}>
				<Heading>
					{dueTasks.length > 0
						? `You have ${dueTasks.length} tasks due today`
						: 'No tasks due today 🥳'}
				</Heading>
				<CreateTaskModal />
			</HStack>
			<TaskList
				tasks={tasks.filter(t =>
					dayjs(lt(t).due).isBefore(dayjs().startOf('day'))
				)}
				title={'OVERDUE'}
				i={0}
				findFn={d => dayjs(d).isBefore(dayjs().startOf('day'))}
			/>
			<TaskList
				tasks={tasks.filter(
					t =>
						dayjs(lt(t).due).isSame(dayjs(), 'day') ||
						(slt(t)?.due && dayjs(slt(t)?.due).isSame(dayjs(), 'day'))
				)}
				title={'TODAY'}
				i={1}
				findFn={d => dayjs(d).isSame(dayjs().startOf('day'), 'day')}
			/>
			<TaskList
				tasks={tasks.filter(t =>
					dayjs(lt(t).due).isSame(dayjs().add(1, 'day'), 'day')
				)}
				title={'TOMORROW'}
				i={2}
				findFn={d => dayjs(d).isSame(dayjs().add(1, 'day'), 'day')}
			/>
			<TaskList
				tasks={tasks.filter(t =>
					dayjs(lt(t).due).isAfter(dayjs().add(1, 'day'), 'day')
				)}
				title={'LATER'}
				i={3}
				findFn={d => dayjs(d).isAfter(dayjs().add(1, 'day'), 'day')}
			/>
		</Container>
	);
};

const hueList: (keyof typeof theme['colors'])[] = [
	'cyan',
	'purple',
	'green',
	'pink',
	'orange',
	'blue',
	'teal',
	'yellow',
	'red',
];

const TaskList = (props: {
	tasks: APITask[];
	title: string;
	i: number;
	findFn: (d: Dayjs) => boolean;
}) => {
	if (!props.tasks.length) return null;
	const hue =
		hueList[(dayjs().diff(dayjs().startOf('year'), 'days') + props.i) % 9]!;

	console.log(props.title, props.tasks);
	return (
		<VStack mt={10} alignItems={'flex-start'}>
			<Text fontWeight={700}>{props.title}</Text>
			{props.tasks.map((task, i) => {
				return (
					<Task
						key={task.id}
						task={task}
						i={i}
						hue={hue}
						findFn={props.findFn}
					/>
				);
			})}
		</VStack>
	);
};

export const lt = (t: APITask) => t.tasks.filter(t => !t.completed)[0]!;
export const slt = (t: APITask) =>
	t.tasks.filter(t => t.completed).reverse()[0];
