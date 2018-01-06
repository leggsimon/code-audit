const { filter } = require('../../../lib/utils/astParse');
const acorn = require('acorn');

const isATypeOfFunction = node =>
    node.type === 'FunctionDeclaration'
    || node.type === 'FunctionExpression'
    || node.type === 'ArrowFunctionExpression';

test('can find a function', () => {
    const namedFunction = 'function named() {};';
    const ast = acorn.parse(namedFunction);
    const result = filter(ast, isATypeOfFunction);
    expect(result.length).toEqual(1);
});

test('finds 4 functions', () => {
    const fourFunctions = `
        function named() {};
        const func = function (blah) {};
        const arrow = () => {};
        [].map(() => {})`;
    const ast = acorn.parse(fourFunctions);
    const result = filter(ast, isATypeOfFunction);
    expect(result.length).toEqual(4);
});

test('returns the variable declaration node for assigned anonymous functions', () => {
    const assignedAnonFunction = `
        const x = 1;
        const func = function () {};
        const arrow = () => {};`;
    const ast = acorn.parse(assignedAnonFunction);
    const result = filter(ast, node =>
        node.type === 'VariableDeclarator'
        && isATypeOfFunction(node.init)
    );
    expect(result.length).toEqual(2);
    expect(
        result.every(({ type }) => type === 'VariableDeclarator')
    ).toBe(true);
});

