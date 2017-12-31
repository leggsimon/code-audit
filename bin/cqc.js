#!/usr/bin/env node

const program = require('commander');
const shell = require('child_process');
const { promisify } = require('util');
const exec = promisify(shell.exec);
const chalk = require('chalk');
const exitWithError = require('../lib/utils/exitWithError')

program.version(require('../package.json').version);

program
	.command('todos')
	.description('Finds TODO or FIXME comments in your code base')
	.action(() => {
		const cwd = process.cwd();
		const command = `grep --exclude-dir={node_modules,bower_components,build,public,'.*'} --exclude={'.*'} -irnw '${cwd}' -e "TODO\\|FIXME" `;

		exec(command)
			.catch((err) => {
				if (Boolean(err.stderr)) {
					throw Error(err)
				}
				return {stdout: err.stderr};
			})
			.then(({stdout}) => {
				const grepFound = stdout
					.split('\n')
					.filter(n => n)

				if (grepFound.length === 0) {
					console.log(chalk.green('✓ No todos or fixmes found. Great job!'));
					process.exit(0);
					return;
				}

				console.log(chalk.yellow(`${grepFound.length} todos or fixmes found`))

				const matches = grepFound
					.map(line => {
						const [filename, lineNumber] = line.split(':', 2)

						return {
							filename,
							relativeFilename: filename.replace(cwd, '.'),
							lineNumber: Number(lineNumber),
							line: line.replace(`${filename}:${lineNumber}:`, '').trim()
						}
					})
					.reduce((prev, curr) => {
						const existing = prev.find(match => match.filename === curr.filename);
						if (existing) {
							existing.matches.push({
								lineNumber: curr.lineNumber,
								line: curr.line
							})
						} else {
							prev.push({
								filename: curr.filename,
								relativeFilename: curr.relativeFilename,
								matches: [
									{
										lineNumber: curr.lineNumber,
										line: curr.line
									}
								]
							})
						}
						return prev;
					}, []);

				matches.forEach(({filename, relativeFilename, matches}) => {
					matches.forEach(({lineNumber, line}) => {
						console.log(
							chalk.magenta(`${relativeFilename}:${lineNumber} `),
							line
						)
					})
				})
			})
			.catch(exit)
	});

program
	.command('*')
	.description('')
	.action(function (app) {
		console.error(`The command ${app} is not known`)
		process.exit(1);
	});


program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
