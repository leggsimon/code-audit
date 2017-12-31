#!/usr/bin/env node

const program = require('commander');

program.version(require('../package.json').version);

const findTodos = require('../lib/findTodos');

program
	.command('todos')
	.description('Finds TODO or FIXME comments in your code base')
	.action(findTodos);

program
	.command('*')
	.description('')
	.action(function (app) {
		console.error(`The command ${app} is not known`);
		process.exit(1);
	});


program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
