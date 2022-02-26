import {
	Box,
	Heading,
	Text,
	useColorModeValue as mode,
	VStack,
} from '@chakra-ui/react';
import * as React from 'react';
import {ReactNode} from 'react';
import Link from 'next/link';
import {AuthFormText} from '../../utils/types';
import {useMe} from '../../utils/hooks';
import {AuthForm} from './LoginForm';
import {Redirect} from '../global/Redirect';
import {Logo} from '../global/Logo';

const authText: (type: 'login' | 'register') => AuthFormText = type => {
	const isLogin = type === 'login';
	return {
		title: isLogin ? 'Sign in' : 'Create account',
		changeQuestion: isLogin ? 'Create account' : 'Sign in',
		linkAddress: isLogin ? '/register' : '/login',
	};
};

export const Onboarding = (props: {type: 'login' | 'register'}) => {
	const {data, error, isValidating} = useMe();
	if ((!data || isValidating) && !error) return <h1>Loading...</h1>;
	if (!isValidating && data && !error) return <Redirect to={'/home'} />;
	return (
		<AuthContainer text={authText(props.type)}>
			<AuthForm type={props.type} />
		</AuthContainer>
	);
};

const AuthContainer = (props: {children: ReactNode; text: AuthFormText}) => {
	return (
		<VStack
			bg={mode('gray.50', 'inherit')}
			minH="100vh"
			py="12"
			px={{sm: '6', lg: '8'}}
			alignItems={'center'}
		>
			<VStack w={'2xl'} justifyContent={'center'}>
				<Logo fontSize={30} justifySelf={'center'} />

				<Box maxW={{sm: 'md'}} mx={{sm: 'auto'}} mt="8" w={{sm: 'full'}}>
					<Box
						bg={mode('white', 'gray.700')}
						py="8"
						px={{base: '4', md: '10'}}
						shadow="base"
						rounded={{sm: 'lg'}}
						color={'gray'}
						mt={6}
					>
						<Box maxW={{sm: 'md'}} mx={{sm: 'auto'}} w={{sm: 'full'}} mb="6">
							<Heading
								textAlign="center"
								size="xl"
								fontWeight="extrabold"
								color={'black'}
							>
								{props.text.title}
							</Heading>
							<Text mt="4" align="center" maxW="md" fontWeight="medium">
								<Link href={props.text.linkAddress}>
									<Box
										as="a"
										marginStart="1"
										href="#"
										color={'purple.600'}
										_hover={{color: 'purple.400'}}
										display={{base: 'block', sm: 'revert'}}
									>
										{props.text.changeQuestion}
									</Box>
								</Link>
							</Text>
						</Box>
						{props.children}
					</Box>
				</Box>
			</VStack>
		</VStack>
	);
};
