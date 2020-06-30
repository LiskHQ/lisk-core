module.exports = {
	extends: [
		'lisk-base/base',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
	],
	rules: {
		'max-len': 'off', // Managed by prettier
		'import/namespace': 'off',
		'no-underscore-dangle': 'off', // Used for private variables and methods
		'implicit-arrow-linebreak': 'off', // Prefered
		'no-mixed-spaces-and-tabs': 'off', // Managed by prettier
		'operator-linebreak': 'off',
		'import/prefer-default-export': 'off',
		'lines-between-class-members': 'off', // Off because typescript has members and methods
		'no-useless-constructor': 'off',
		'no-unused-expressions': 'off',
		'import/extensions': [
			'error',
			'ignorePackages',
			{
				js: 'never',
				ts: 'never',
			},
		],
	},
	globals: {
		BigInt: true,
	},
};
