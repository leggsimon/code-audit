const chalk = require('chalk');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const { filter, isATypeOfFunction } = require('./utils/astParse');
const { fileToAST, findJavascriptFiles } = require('./utils/helpers');

module.exports = () => {
	const cwd = process.cwd();
	findJavascriptFiles(cwd).then(files => {
		return files.forEach(file => {
			return readFile(file, 'utf8')
			.then(fileToAST)
			.then(ast => {
				const functions = filter(ast, isATypeOfFunction({assignVariableNames: true}))
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


