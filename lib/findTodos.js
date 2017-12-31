const chalk = require('chalk');
const exitWithError = require('./utils/exitWithError');
const grep = require('./utils/grep');

module.exports = () => {
	const cwd = process.cwd();

	const searchTerm = 'TODO\\|FIXME';
	const grepOptions = '--exclude-dir={node_modules,bower_components,build,public,\'.*\'} --exclude={\'.*\'} -irnw';

	grep(searchTerm, cwd, grepOptions)
		.then(stdout => {
			const grepFound = stdout
				.split('\n')
				.filter(n => n);

			if (grepFound.length === 0) {
				console.log(chalk.green('✓ No todos or fixmes found. Great job!'));
				process.exit(0);
				return;
			}

			console.log(chalk.yellow(`${grepFound.length} todos or fixmes found`));

			const matches = grepFound
				.map(line => {
					const [filename, lineNumber] = line.split(':', 2);

					return {
						filename,
						relativeFilename: filename.replace(cwd, '.'),
						lineNumber: Number(lineNumber),
						line: line.replace(`${filename}:${lineNumber}:`, '').trim()
					};
				})
				.reduce((prev, curr) => {
					const existing = prev.find(match => match.filename === curr.filename);
					if (existing) {
						existing.matches.push({
							lineNumber: curr.lineNumber,
							line: curr.line
						});
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
						});
					}
					return prev;
				}, []);

			matches.forEach(({relativeFilename, matches }) => {
				matches.forEach(({ lineNumber, line }) => {
					console.log(
						chalk.magenta(`${relativeFilename}:${lineNumber} `),
						line
					);
				});
			});
		})
		.catch(exitWithError);
};
