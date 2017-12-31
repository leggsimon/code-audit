const shell = require('child_process');
const { promisify } = require('util');
const exec = promisify(shell.exec);
const exitWithError = require('./exitWithError');


const grep = (searchTerm, directory, options) => {
    const command = `grep ${options} '${directory}' -e '${searchTerm}'`;
    return exec(command)
        .then(({stdout}) => stdout)
        .catch((err) => {
            if (Boolean(err.stderr)) {
                throw Error(err);
            }
            return err.stderr;
        })
        .catch(exitWithError);
};

module.exports = grep;
