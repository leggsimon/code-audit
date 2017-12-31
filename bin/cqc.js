#!/usr/bin/env node

const program = require('commander');
const shell = require('child_process');
const { promisify } = require('util');
const exec = promisify(shell.exec);

program.version(require('../package.json').version);

const exit = err => {
	console.log('\x1b[31m', err, '\x1b[0m');
	process.exit(1);
};

program
	.command('todos')
	.description('Finds TODO or FIXME comments in your code base')
	// .option('-m, --multiregion', 'Will create an additional app in the US')
	// .option('-o, --organisation [org]', 'Specify the organisation to own the created assets', DEFAULT_ORG)
	.action(function (name, options) {
		const cwd = process.cwd();
		const command = `grep --exclude-dir={node_modules,bower_components,build,public} -irnw '${cwd}' -e "TODO\\|FIXME"`;

		// shell.exec(command, (error, stdout) => {
		// 	console.log('\x1b[36m', stdout, '\x1b[0m')
		// })

		exec(command)
			.then(({stdout}) => {
				const found = stdout
					.split('\n')
					.filter(n => n)
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
				console.log('\x1b[35m', JSON.stringify(found, null, 2), '\x1b[0m')
			})
			.catch(exit)

		// `grep --exclude-dir={node_modules,bower_components,build,public} -irnw ${process.cwd()} -e "TODO\|FIXME"`
		console.log(process.cwd())
		console.log('finding todos')
		// if (!name) {
		// 	throw new Error('Please specify a name for the pipeline');
		// }
		// log.info(`Running drydock task with name: ${name}, org: ${options.organisation}, multiregion: ${options.multiregion}`);
		// task(name, options).catch(utils.exit);
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
