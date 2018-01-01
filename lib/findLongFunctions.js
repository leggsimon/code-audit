const chalk = require('chalk');
const acorn = require('acorn');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const find = require('./utils/find');
const { filter } = require('./utils/astParse');


const findJavascriptFiles = async (cwd) => {
	const result = await find('*.js', cwd);
	return result.split('\n').filter(r => r);
};

const isATypeOfFunction = node =>
	node.type === 'FunctionDeclaration'
	|| node.type === 'FunctionExpression'
	|| node.type === 'ArrowFunctionExpression';

module.exports = () => {
	const cwd = process.cwd();
	findJavascriptFiles(cwd).then((files) => {
		return files.forEach(file => {
			return readFile(file, 'utf8').then(contents => {
				const ast = acorn.parse(contents, {
					ecmaVersion: 8,
					sourceType: 'module',
					locations: true
				});
				const functionNodes = filter(ast, isATypeOfFunction);
				const longFunctions = functionNodes
					.map(node => {
						const startLine = node.loc.start.line;
						const endLine = node.loc.end.line;

						return {
							name: (node.id && node.id.name) || undefined,
							startLine,
							endLine,
							length: endLine - startLine
						};
					})
					.filter(({ length }) => length > 20);

				if (Boolean(longFunctions.length)) {
					const fileName = file.replace(cwd, '.');
					longFunctions.forEach(func => {
						const functionName = func.name || 'function';
						console.log(
							chalk.magenta(`${fileName}:${func.startLine} `),
							`${functionName} is ${func.length} lines long!`
						);
					});
				}
			});
		});
	});
};
