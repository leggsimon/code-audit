const shell = require('child_process');
const { promisify } = require('util');
const exec = promisify(shell.exec);
const exitWithError = require('./utils/exitWithError');

const find = (searchTerm, directory) => {
    const command = `find '${directory}' -name '${searchTerm}' -not \\( -path */node_modules/* -o -path */bower_components/* \\) -prune`;

    return exec(command)
        .then(({ stdout }) => stdout)
        .catch((err) => {
            if (Boolean(err.stderr)) {
                throw Error(err);
            }
            return err.stderr;
        })
        .catch(exitWithError);
};

const findJavascriptFiles = async () => {
    const cwd = process.cwd();
    const result = await find('*.js', cwd);
    return result.split('\n').filter(r => r);
};

module.exports = () => {
    findJavascriptFiles().then(files => {
        console.log('\x1b[35m', files, '\x1b[0m');
    });
};
