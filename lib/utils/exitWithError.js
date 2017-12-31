const chalk = require('chalk');

module.exports = err => {
	console.log(chalk.red(err));
	process.exit(1);
};
