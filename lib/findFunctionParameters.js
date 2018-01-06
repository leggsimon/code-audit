const chalk = require('chalk');
const acorn = require('acorn');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const find = require('./utils/find');
const { filter } = require('./utils/astParse');

const findJavascriptFiles = async cwd => {
	const result = await find('*.js', cwd);
	return result.split('\n').filter(r => r);
};

const isATypeOfFunction = node =>
	node.type === 'FunctionDeclaration'
	|| node.type === 'FunctionExpression'
	|| node.type === 'ArrowFunctionExpression';

module.exports = () => {
	const cwd = process.cwd();
	findJavascriptFiles(cwd).then(files => {
		return files.forEach(file => {
			return readFile(file, 'utf8')
			.then(fileToAST)
			.then(ast => {
				const functions = filter(ast, isATypeOfFunction)
					.filter(node => node.params.length > 4);

				if (Boolean(functions.length)) {
					const fileName = file.replace(cwd, '.');
					functions.forEach(func => {
						const functionName = (func.id && func.id.name) || 'function';
						const startLine = func.loc.start.line;
						const numberOfParameters = func.params.length;
						console.log(
							chalk.magenta(`${fileName}:${startLine} `),
							`${functionName} takes ${numberOfParameters} parameters!`
						);
					});
				}
			});
		});
	});
};

function fileToAST (contents) {
	return Promise.resolve(
		acorn.parse(contents, {
			ecmaVersion: 8,
			sourceType: 'module',
			locations: true
		}
	));
}
