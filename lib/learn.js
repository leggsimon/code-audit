const chalk = require('chalk');
const fs = require('fs');
const shell = require('child_process');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const exec = promisify(shell.exec);

module.exports = args => {
	const cwd = process.cwd();

	readdir('./node_modules').then(modules => {
		const randomModule = getRandomModule(modules);
		const { name: packageName } = require(`${cwd}/node_modules/${randomModule}/package.json`);
		const packageUrl = `https://www.npmjs.com/package/${packageName}`;
		if (args.open) {
			exec(`open ${packageUrl}`);
			logGreen('Did you learn something? If you did go and tell someone what you learnt!');
		} else {
			logGreen(
				`${packageName} looks interesting! You should check out it's docs at ${packageUrl}`,
				'\nFind out what it does and go tell someone else!'
			);
		}
	}).catch(err => {
		const noDirectory = err.message.includes('no such file or directory');
		if (noDirectory) {
			logWarning('You haven\'t got any node modules to learn about in this directory');
		} else {
			throw err;
		}
	});
};

function getRandomModule (modules) {
	const randomModuleNumber = getRandomInt(modules.length);
	const randomModule = modules[randomModuleNumber];
	const isValidModule = randomModule !== '.bin' || !randomModule.startsWith('@');

	if (isValidModule) {
		return randomModule;
	} else {
		return getRandomModule(modules);
	}
}

function getRandomInt (max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function logGreen (...args) {
	console.log(chalk.green(args));
}

function logWarning (...args) {
	console.log(chalk.yellow(args));
}
