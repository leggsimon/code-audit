const { filter } = require('../../../lib/utils/astParse');
const acorn = require('acorn');

const isATypeOfFunctionExpression = node =>
    node.type === 'FunctionDeclaration'
    || node.type === 'FunctionExpression'
    || node.type === 'ArrowFunctionExpression';

const isAFunctionAssignedToVariable = node =>
    node.type === 'VariableDeclarator'
    && isATypeOfFunctionExpression(node.init);

const isATypeOfFunction = (node, parentNode) =>
    (isATypeOfFunctionExpression(node) && parentNode.type !== 'VariableDeclarator')
    || (isAFunctionAssignedToVariable(node));

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
    const result = filter(ast, isATypeOfFunction);
    expect(result.length).toEqual(2);
    expect(
        result.every(({ type }) => type === 'VariableDeclarator')
    ).toBe(true);
});

test('returns function names or variable assignments', () => {
    const functionVarsAndNames = `
        const x = 1;
        const functionVar1 = function () {};
        const functionVar2 = () => {};
        function functionNamed1 () {}
        [].map(() => {})`;
    const ast = acorn.parse(functionVarsAndNames);
    const result = filter(ast, isATypeOfFunction);
    expect(result.length).toEqual(4);
    const functionNames = result.map(node => (node.id && node.id.name) || undefined);
    expect(functionNames).toEqual(['functionVar1', 'functionVar2', 'functionNamed1', undefined]);
});

