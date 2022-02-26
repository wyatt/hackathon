import dayjs from 'dayjs';
import {Prisma, Lesson} from '@prisma/client';
import {prisma} from '../prisma';

export const addNewLesson = async <T extends Lesson>(
	lesson: Prisma.LessonUpsertArgs,
	userId: string
) => {
	const dailyLessons = await prisma.lesson.findMany({
		where: {
			userId,
		},
	});
	const dailyLessonByDate = [
		...new Set(
			dailyLessons.map(lesson => dayjs(lesson.due).endOf('day').toISOString())
		),
	].reduce(
		(acc: Record<string, Lesson[]>, curr) => (
			(acc[curr] = dailyLessons.filter(
				lesson => dayjs(lesson.due).endOf('day').toISOString() === curr
			)),
			acc
		),
		{}
	);

	let nextDate;

	if (dailyLessons.length > 0) {
		if (!dailyLessonByDate[dayjs().endOf('day').toISOString()]) {
			nextDate = dayjs().endOf('day').toISOString();
		} else {
			for (const d in dailyLessonByDate) {
				if (dailyLessonByDate[d].length > 5) {
					const nextDay = dayjs(d).add(1, 'day').endOf('day').toISOString();
					if (dailyLessonByDate[nextDay]) {
						if (dailyLessonByDate[nextDay].length <= 5) {
							nextDate = nextDay;
							break;
						}
					} else {
						nextDate = nextDay;
						break;
					}
				} else {
					nextDate = dayjs(d).endOf('day').toISOString();
				}
			}
		}
	} else {
		nextDate = dayjs().endOf('day').toISOString();
	}

	return prisma.lesson.upsert({
		...lesson,
		create: {
			...lesson.create,
			due: nextDate,
		},
	}) as Prisma.Prisma__LessonClient<T>;
};
