export const title = (s: string) => {
	return s.replace(
		/\w\S*/g,
		s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase()
	);
};
export const sleep = (t: number) => new Promise(r => setTimeout(r, t));
