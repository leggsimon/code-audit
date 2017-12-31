module.exports = {
	'env': {
		'es6': true,
		'node': true
	},
	'parserOptions': {
		'ecmaVersion': 2017,
		'sourceType': 'module',
		'ecmaFeatures': {
			'experimentalObjectRestSpread': true
		}
	},
	'rules': {
		'eqeqeq': 2,
		'guard-for-in': 2,
		'new-cap': 0,
		'no-caller': 2,
		'no-extend-native': 2,
		'no-irregular-whitespace': 2,
		'no-loop-func': 2,
		'no-multi-spaces': 2,
		'no-undef': 2,
		'no-underscore-dangle': 0,
		'no-unused-vars': 2,
		'no-var': 2,
		'one-var': [2, 'never'],
		'quotes': [2, 'single', { "avoidEscape": true }],
		'semi': [1, 'always'],
		'space-before-function-paren': [2, 'always'],
		'wrap-iife': 2
	},
};
