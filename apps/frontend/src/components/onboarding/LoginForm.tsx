import {
	Flex,
	FormControl,
	FormErrorMessage,
	FormLabel,
	IconButton,
	Input,
	InputGroup,
	InputRightElement,
	Stack,
	useDisclosure,
	Text,
	HStack,
} from '@chakra-ui/react';
import * as React from 'react';
import {Field, FieldProps, Form, FormikProps, withFormik} from 'formik';
import {title} from '../../utils/helper';
import {loginUserSchema, registerUserSchema} from '../../utils/schemas/user';
import {Actions, LoginValues, RegisterValues} from '../../utils/types';
import {SubmitButton} from 'formik-chakra-ui';
import {HiEye, HiEyeOff} from 'react-icons/hi';
import {NextRouter, useRouter} from 'next/router';
import {useActions} from '../../utils/actions';
import {toast} from 'react-hot-toast';
import {toastOptions} from '../../utils/toast';
import {ZodError} from 'zod';
import {useEffect} from 'react';

function InnerForm<
	T extends {name?: string; email?: string; password?: string}
>(props: FormikProps<T>) {
	const {isSubmitting, handleSubmit} = props;
	return (
		<Form>
			<Stack spacing="6">
				{'name' in props.values && (
					<FormInput name={'name'} type={'text'} autoComplete={'name'} />
				)}
				<FormInput name={'email'} type={'text'} autoComplete={'email'} />
				<PasswordField />

				<SubmitButton
					type="submit"
					colorScheme="purple"
					size="lg"
					fontSize="md"
					isLoading={isSubmitting}
					isDisabled={!props.isValid}
					// onClick={() => handleSubmit()}
				>
					{'name' in props.values ? 'Register' : 'Sign in'}
				</SubmitButton>
			</Stack>
		</Form>
	);
}

export const AuthForm = (props: {type: 'register' | 'login'}) => {
	const router = useRouter();
	const actions = useActions();

	useEffect(() => {
		if (router.query.message) {
			toast.success(router.query.message as string);
			router.push('');
		}
	}, [router]);

	if (props.type === 'register') {
		return <RegisterFormWrapper router={router} actions={actions} />;
	}
	return <LoginFormWrapper router={router} actions={actions} />;
};

const RegisterFormWrapper = withFormik<
	{router: NextRouter; actions: Actions},
	RegisterValues
>({
	handleSubmit: async (values, {props}) => {
		const promise = async () => {
			return props.actions.auth('register', {...values}).then(async () => {
				return 'Account created.';
			});
		};
		await toast
			.promise(promise(), toastOptions, {success: {duration: 20000}})
			.then(
				() => props.router.push('/login'),
				() => false
			);
	},
	mapPropsToValues: () => {
		return {
			name: '',
			email: '',
			password: '',
		};
	},
	validate: values => {
		try {
			registerUserSchema.parse(values);
		} catch (e) {
			if (e instanceof ZodError) return e.formErrors.fieldErrors;
			return e as Error;
		}
	},
})(props => <InnerForm<RegisterValues> {...props} />);

const LoginFormWrapper = withFormik<
	{router: NextRouter; actions: Actions},
	LoginValues
>({
	handleSubmit: async (values, {props}) => {
		await toast
			.promise(
				props.actions.auth('login', {...values}).then(async () => {
					return 'Successfully logged in.';
				}),
				toastOptions
			)
			.then(
				() => props.router.push('/home'),
				() => false
			)
			.catch(e => e);
	},
	mapPropsToValues: () => {
		return {
			email: '',
			password: '',
		};
	},
	validate: values => {
		try {
			loginUserSchema.parse(values);
		} catch (e) {
			if (e instanceof ZodError) return e.formErrors.fieldErrors;
			return e as Error;
		}
	},
})(props => <InnerForm<LoginValues> {...props} />);

const FormInput = (props: {
	name: string;
	type: string;
	autoComplete: string;
	label?: string;
	notRequired?: boolean;
}) => {
	return (
		<Field name={props.name}>
			{({field, meta}: FieldProps) => (
				<FormControl isInvalid={!!(meta.touched && meta.error)}>
					<FormLabel>
						{props.label ?? title(props.name)}{' '}
						<Text color={'gray.300'} d={'inline-flex'}>
							{(props.notRequired ?? false) && '(optional)'}
						</Text>
					</FormLabel>

					<Input
						type={props.type}
						autoComplete={props.autoComplete}
						{...field}
						aria-required={!props.notRequired ?? true}
						focusBorderColor="brand.500"
						isInvalid={!!(meta.touched && meta.error)}
					/>
					<FormErrorMessage color="red.500" pt="1" fontSize="sm">
						{meta.error}
					</FormErrorMessage>
				</FormControl>
			)}
		</Field>
	);
};

const PasswordField = () => {
	const {isOpen, onToggle} = useDisclosure();
	const onClickReveal = () => onToggle();
	return (
		<Field name={'password'}>
			{({field, meta}: FieldProps) => (
				<FormControl isInvalid={!!(meta.touched && meta.error)} id="password">
					<FormLabel>Password</FormLabel>

					<InputGroup display="block">
						<Flex direction="column">
							<Input
								type={isOpen ? 'text' : 'password'}
								autoComplete={'password'}
								{...field}
								aria-required={true}
								focusBorderColor="brand.500"
								isInvalid={!!(meta.touched && meta.error)}
							/>
							<FormErrorMessage color="red.500" pt="1" fontSize="sm">
								{meta.error}
							</FormErrorMessage>
						</Flex>
						<InputRightElement>
							<IconButton
								bg="transparent !important"
								variant="ghost"
								aria-label={isOpen ? 'Mask password' : 'Reveal password'}
								icon={isOpen ? <HiEyeOff /> : <HiEye />}
								onClick={onClickReveal}
							/>
						</InputRightElement>
					</InputGroup>
				</FormControl>
			)}
		</Field>
	);
};
