const find = require('./utils/find');
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
