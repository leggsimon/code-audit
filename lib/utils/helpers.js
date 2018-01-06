const acorn = require('acorn');
const find = require('./find');

function fileToAST (contents) {
	return Promise.resolve(
		acorn.parse(contents, {
			ecmaVersion: 8,
			sourceType: 'module',
			locations: true
		}
		));
}

async function findJavascriptFiles (cwd) {
	const result = await find('*.js', cwd);
	return result.split('\n').filter(r => r);
}

module.exports = {fileToAST, findJavascriptFiles};
