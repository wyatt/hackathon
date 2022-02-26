import React from 'react';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	ChartData,
	ScatterDataPoint,
	TimeScale,
} from 'chart.js';
import {ChartProps, Line} from 'react-chartjs-2';
import faker from 'faker';
import {APITask} from '@todor/shared/src/index';
import dayjs from 'dayjs';
import 'chartjs-adapter-dayjs';
import {Box, theme} from '@chakra-ui/react';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	TimeScale
);

export const options = {
	responsive: true,
	maintainAspectRatio: false,

	scales: {
		x: {
			type: 'time' as const,
			time: {
				unit: 'month' as const,
				stepSize: 1 as const,
				displayFormats: {
					month: 'MMM DD',
				},
			},
			min: dayjs().startOf('year').toDate(),
			max: dayjs().endOf('year').subtract(6, 'months').toDate(),
		},
	},
	plugins: {
		legend: {
			display: false,
		},
	},
};

const hexToRgb = (hex: string) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? [
				parseInt(result[1]!, 16),
				parseInt(result[2]!, 16),
				parseInt(result[3]!, 16),
		  ]
		: null;
};

export const TaskGraph = (props: {
	tasks: APITask['tasks'];
	hue: keyof typeof theme['colors'];
}) => {
	if (props.tasks.filter(t => t.completed).length === 0)
		return <p>No completions yet</p>;

	const data = {
		datasets: [
			{
				label: 'Strength',
				data: [
					...props.tasks.map(t => ({
						x: dayjs(t.due).toISOString(),
						y: t.ef,
					})),
					// {x: dayjs().endOf('year'), y: 2.6},
				],
				borderColor: theme.colors[props.hue][500],
				backgroundColor: `rgba(${hexToRgb(theme.colors[props.hue][500])?.join(
					','
				)}, 0.5)`,
			},
		],
	};

	return (
		<Box h={36} w={'full'} bg={'white'} p={4}>
			{/* @ts-ignore */}
			<Line options={options} data={data} />
		</Box>
	);
};
