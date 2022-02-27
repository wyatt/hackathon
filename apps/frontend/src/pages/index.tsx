import {Container, Heading, VStack, chakra} from '@chakra-ui/react';

const Landing = () => {
	return (
		<Container maxW={'container.xl'}>
			<VStack>
				<Heading>Your task list needs a upgrade</Heading>
				<Heading>
					Meet <chakra.span color={'purple.400'}>Todor</chakra.span>
				</Heading>
			</VStack>
		</Container>
	);
};

export default Landing;
