function traverse (node, func, parentNode = {}) {
	func(node, parentNode);

	for (let key in node) {
		if (node.hasOwnProperty(key)) {
			const child = node[key];
			if (typeof child === 'object' && child !== null) {

				if (Array.isArray(child)) {
					child.forEach(childNode => traverse(childNode, func, node));
				} else {
					traverse(child, func, node);
				}
			}
		}
	}
}

function filter (ast, filterFunction) {
	const result = [];
	traverse(ast, (node, parent) => {
		if (filterFunction(node, parent)) {
			result.push(node);
		}
	});
	return result;
}


const isATypeOfFunctionExpression = node =>
	node.type === 'FunctionDeclaration'
	|| node.type === 'FunctionExpression'
	|| node.type === 'ArrowFunctionExpression';

const isATypeOfFunction = (options = {}) => (node, parent) => {
	if (isATypeOfFunctionExpression(node)) {
		const isAssignedToAVariable = parent.type === 'VariableDeclarator';
		if (isAssignedToAVariable) {
			const nodeHasName = node.id && node.id.name;
			if (!nodeHasName && options.assignVariableNames) {
				const name = parent.id && parent.id.name;
				node.id = Object.assign({}, node.id, { name });
			}
		}
		return true;
	} else {
		return false;
	}
};

module.exports = {
	filter,
	isATypeOfFunction
};
