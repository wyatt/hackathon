import {
	Container,
	Heading,
	VStack,
	chakra,
	HStack,
	Button,
	Text,
} from '@chakra-ui/react';
import Link from 'next/link';

const Landing = () => {
	return (
		<Container
			maxW={'container.xl'}
			h={'100vh'}
			d={'flex'}
			alignItems={'center'}
			justifyContent={'center'}
		>
			<VStack mb={24}>
				<Heading>Your task list needs a upgrade</Heading>
				<Heading>
					Meet <chakra.span color={'purple.400'}>Todor</chakra.span>
				</Heading>
				<HStack pt={4} spacing={4}>
					<Link href={'/login'}>
						<Button variant={'outline'} size={'lg'}>
							Login
						</Button>
					</Link>
					<Link href={'/register'}>
						<Button variant={'solid'} colorScheme={'purple'} size={'lg'}>
							Sign Up
						</Button>
					</Link>
				</HStack>
				<Text color={'gray.400'} pt={4}>
					Made in less than 24 hours
				</Text>
			</VStack>
		</Container>
	);
};

export default Landing;
