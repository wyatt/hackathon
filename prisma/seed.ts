import {hashSync} from 'bcrypt';
import * as faker from 'faker';
import {PrismaClient} from '@prisma/client';
import dayjs from 'dayjs';

console.log('🌿 Seeding Todor');
console.log('⌛️ Generating fake data');

const prisma = new PrismaClient();
const password = hashSync('testing', 12);

async function main() {
	await prisma.$connect();

	console.log('💿 Connected to Database');

	console.log('🧑 Adding Users');
	const users = await Promise.all(
		[...new Array(100)].map(async () => {
			const user = faker.helpers.userCard();
			return await prisma.user.create({
				data: {
					name: user.name,
					email: user.email.toLowerCase(),
					password,
				},
			});
		})
	);

	console.log('✅ Adding tasks');
	for (const user of users) {
		await Promise.all(
			[...new Array(20)].map(async () => {
				await prisma.taskInfo.create({
					data: {
						name: faker.lorem.words(5),
						description: faker.lorem.paragraph(),
						user: {
							connect: {
								id: user.id,
							},
						},
						tasks: {
							createMany: {
								data: [
									[1, true, 0, 2.5],
									[6, true, 0, 1.6],
									[15, true, 2, 2.1],
									[18, false, 1, 0.4],
								].map(
									//@ts-ignore
									([days, done, daysLate, ef]: [
										number,
										boolean,
										number,
										number
									]) => {
										return {
											done,
											due: dayjs()
												.add(days as number, 'days')
												.toDate(),
											completed: dayjs()
												.add((days + daysLate) as number, 'days')
												.toDate(),
											ef,
										};
									}
								),
							},
						},
					},
				});
			})
		);
	}
}

main()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
