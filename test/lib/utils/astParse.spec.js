const { filter, isATypeOfFunction } = require('../../../lib/utils/astParse');
const acorn = require('acorn');

describe('#filter', () => {
    const ast = acorn.parse('function test() {};');

    test('returns no nodes if filterFunction returns false', () => {
        const filterFunction = () => false;
        const result = filter(ast, filterFunction);
        expect(result.length).toEqual(0);
    });

    test('returns all nodes if filterFunction returns true', () => {
        const filterFunction = () => true;
        const result = filter(ast, filterFunction);
        expect(result.length).toEqual(5);
    });

    test('filter function can filter on current node', () => {
        const filterFunction = node => node.type === 'FunctionDeclaration';
        const result = filter(ast, filterFunction);
        expect(result.length).toEqual(1);
        expect(result[0].type).toEqual('FunctionDeclaration');
    });

    test('filter function can filter on parent node', () => {
        const filterFunction = (node, parent) => parent.type === 'FunctionDeclaration';
        const result = filter(ast, filterFunction);
        expect(result.length).toEqual(2);
        const [ identifier, blockStatement ] = result;
        expect(identifier.type).toEqual('Identifier');
        expect(blockStatement.type).toEqual('BlockStatement');
    });
});

describe('helper filter functions', () => {
    describe('#isATypeOfFunction', () => {
        test('returns a function (meta right?!)', () => {
            expect(typeof isATypeOfFunction()).toEqual('function');
        });

        test('can find a named function', () => {
            const ast = acorn.parse('function named() {};');
            const result = filter(ast, isATypeOfFunction());
            expect(result.length).toEqual(1);
            const [functionDeclaration] = result;
            expect(functionDeclaration.type).toEqual('FunctionDeclaration');
        });

        test('can find an arrow function assigned to a variable', () => {
            const ast = acorn.parse('const arrow = () => {};');
            const result = filter(ast, isATypeOfFunction());
            expect(result.length).toEqual(1);
            const [arrowFunctionExpression] = result;
            expect(arrowFunctionExpression.type).toEqual('ArrowFunctionExpression');
        });

        test('can find an anonymous function assigned to a variable', () => {
            const ast = acorn.parse('const func = function(){};');
            const result = filter(ast, isATypeOfFunction());
            expect(result.length).toEqual(1);
            const [functionExpression] = result;
            expect(functionExpression.type).toEqual('FunctionExpression');
        });

        test('can find an anonymous function', () => {
            const ast = acorn.parse('[].map(function(){})');
            const result = filter(ast, isATypeOfFunction());
            expect(result.length).toEqual(1);
            const [functionExpression] = result;
            expect(functionExpression.type).toEqual('FunctionExpression');
        });

        test('can find an anonymous arrow function', () => {
            const ast = acorn.parse('[].map(() => {})');
            const result = filter(ast, isATypeOfFunction());
            expect(result.length).toEqual(1);
            const [arrowFunctionExpression] = result;
            expect(arrowFunctionExpression.type).toEqual('ArrowFunctionExpression');
        });

        test('handles when no functions are present', () => {
            const ast = acorn.parse('const x = 1;');
            const result = filter(ast, isATypeOfFunction());
            expect(result.length).toEqual(0);
        });

        test('can find multiple functions', () => {
            const functions = `
                function namedFunction() {};
                const func = function (blah) {};
                const arrow = () => {};
                [].map(() => {});
                [].map(function(){});`;
            const ast = acorn.parse(functions);
            const result = filter(ast, isATypeOfFunction());
            expect(result.length).toEqual(5);
            const functionNames = result.map(func => func.id && func.id.name);
            expect(functionNames).toEqual(['namedFunction', null, null, null, null]);
        });

        describe('options.assignVariableNames', () => {

            const options = {assignVariableNames: true};

            test('assigns the variable name as the id name of an anonymous function', () => {
                const variableAssignedArrowFunction = `
                    const x = 1;
                    const functionVar1 = () => {};`;
                const ast = acorn.parse(variableAssignedArrowFunction);
                const result = filter(ast, isATypeOfFunction(options));
                expect(result.length).toEqual(1);
                const [node] = result;
                expect(node.type).toEqual('ArrowFunctionExpression');
                expect(node.id.name).toEqual('functionVar1');
            });

            test('anonymous function id should be undefined', () => {
                const anonymousArrowFunction = '[].map(() => {});';
                const ast = acorn.parse(anonymousArrowFunction);
                const result = filter(ast, isATypeOfFunction(options));
                expect(result.length).toEqual(1);
                const [node] = result;
                expect(node.type).toEqual('ArrowFunctionExpression');
                expect(node.id).toBeFalsy();
            });

            test('does\'t rename a named function assigned to a variable ', () => {
                const namedFunctionAssignedToVariable = 'const newName = function originalName() {}';
                const ast = acorn.parse(namedFunctionAssignedToVariable);
                const result = filter(ast, isATypeOfFunction(options));
                expect(result.length).toEqual(1);
                const [node] = result;
                expect(node.type).toEqual('FunctionExpression');
                expect(node.id.name).toEqual('originalName');
            });
            test('passes variable names down as names of assigned functions', () => {
                const functions = `
                    function namedFunction() {};
                    const func = function (blah) {};
                    const arrow = () => {};
                    [].map(() => {});
                    [].map(function(){});`;
                const ast = acorn.parse(functions);
                const result = filter(ast, isATypeOfFunction(options));
                expect(result.length).toEqual(5);
                const functionNames = result.map(func => func.id && func.id.name);
                expect(functionNames).toEqual(['namedFunction', 'func', 'arrow', null, null]);
            });
        });


    });
});



// test('can find a function', () => {
//     const namedFunction = 'function named() {};';
//     const ast = acorn.parse(namedFunction);
//     const result = filter(ast, isATypeOfFunction());
//     expect(result.length).toEqual(1);
// });

// test('returns function names or variable assignments', () => {
//     const functionVarsAndNames = `
//         const x = 1;
//         const functionVar1 = function () {};
//         const functionVar2 = () => {};
//         function functionNamed1 () {}
//         [].map(() => {})`;
//     const ast = acorn.parse(functionVarsAndNames);
//     const result = filter(ast, isATypeOfFunction());
//     expect(result.length).toEqual(4);
//     const functionNames = result.map(node => (node.id && node.id.name) || undefined);
//     expect(functionNames).toEqual(['functionVar1', 'functionVar2', 'functionNamed1', undefined]);
// });


