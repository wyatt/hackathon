import {AppProps} from 'next/app';
import '@fontsource/lexend/500.css';
import '../utils/base.css';
import {SWRConfig} from 'swr';
import {fetcher} from '../utils/network';
import {Toaster} from 'react-hot-toast';
import {globalToastOptions} from '../utils/toast';
import * as React from 'react';
import Head from 'next/head';
import {ChakraProvider} from '@chakra-ui/react';

const App = ({Component, pageProps}: AppProps) => {
	return (
		<SWRConfig
			value={{
				fetcher(url) {
					return fetcher('GET', url).then(res => res.data);
				},
				refreshInterval: 120 * 1000,
				dedupingInterval: 120 * 1000,
				errorRetryInterval: 120 * 1000,
				focusThrottleInterval: 120 * 1000,
			}}
		>
			<Toaster toastOptions={globalToastOptions} />
			<Head>
				<title>Todor</title>
			</Head>
			<ChakraProvider>
				<Component {...pageProps} />
			</ChakraProvider>
		</SWRConfig>
	);
};

export default App;
