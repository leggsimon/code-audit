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

module.exports = find;
