import adapter from '@sveltejs/adapter-static';

const config = {
	kit: {
		adapter: adapter({
			fallback: '404.html' // for GitHub pages

		}),
		// paths: {
		// 	base: process.argv.includes('dev') ? '' : process.env.BASE_PATH,
		// }
		// router: {
		// 	type: 'hash',
		// },
	}
};

export default config;
