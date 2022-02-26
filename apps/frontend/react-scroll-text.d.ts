declare module 'react-scroll-text' {
	export interface ScrollTextProps {
		speed?: number;
		children: string;
	}

	declare const ScrollText: JSX.Element<ScrollTextProps>;
	export = ScrollText;
}
