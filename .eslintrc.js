module.exports = {
	root: true,
	extends: ['lisk-base/ts'],
	parserOptions: {
		project: './tsconfig.json',
		tsconfigRootDir: __dirname,
	},
	rules: {
		'@typescript-eslint/explicit-member-accessibility': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/member-ordering': 'off',
		'@typescript-eslint/no-unsafe-argument': 'warn',
	},
};
