import {hashSync} from 'bcrypt';
import * as faker from 'faker';
import {PrismaClient} from '@prisma/client';

console.log('🌿 Seeding Revisio');
console.log('⌛️ Generating fake data');

const prisma = new PrismaClient();
const password = hashSync('testing', 12);

async function main() {
	await prisma.$connect();

	console.log('💿 Connected to Database');

	console.log('🧑 Adding Users');
	await Promise.all(
		[...new Array(100)].map(async () => {
			const user = faker.helpers.userCard();
			await prisma.user.create({
				data: {
					name: user.name,
					email: user.email.toLowerCase(),
					password,
				},
			});
		})
	);
}

main()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
