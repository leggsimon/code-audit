#!/usr/bin/env node

const program = require('commander');

program.version(require('../package.json').version);

const findTodos = require('../lib/findTodos');
const findLongFunctions = require('../lib/findLongFunctions');
const findFunctionParameters = require('../lib/findFunctionParameters');
const learn = require('../lib/learn');

program
	.command('todos')
	.description('Finds TODO or FIXME comments in your code base')
	.action(findTodos);

program
	.command('functions')
	.description('Finds functions that are too long')
	.action(findLongFunctions);

program
	.command('parameters')
	.description('Finds functions that are too long')
	.action(findFunctionParameters);

program
	.command('learn')
	.option('--no-open', 'Don\'t open the npm package page')
	.description('Finds a random node module and opens the readme')
	.action(learn);

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
