import dayjs from 'dayjs';

export const AWS_REGION = 'eu-west-2';
export const [today, tomorrow] = [
	dayjs().toDate(),
	dayjs().add(1, 'day').toDate(),
];
