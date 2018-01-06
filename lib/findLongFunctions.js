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
						.map(node => {
							const startLine = node.loc.start.line;
							const endLine = node.loc.end.line;
							node.loc.totalLength = endLine - startLine;
							return node;
						})
						.filter(node => node.loc.totalLength > 20);

					if (Boolean(functions.length)) {
						const fileName = file.replace(cwd, '.');
						functions.forEach(func => {
							const functionName = (func.id && func.id.name) || 'function';
							const startLine = func.loc.start.line;
							const totalLength = func.loc.totalLength;

							console.log(
								chalk.magenta(`${fileName}:${startLine} `),
								`${functionName} is ${totalLength} lines long!`
							);
						});
					}
				});
		});
	});
};
