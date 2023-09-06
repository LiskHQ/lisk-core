module.exports = {
	extends: ['lisk-base/ts-jest'],
	parserOptions: {
		project: './tsconfig.json',
		tsconfigRootDir: __dirname,
	},
	rules: {
		'@typescript-eslint/no-unsafe-argument': 'warn',
	},
};
