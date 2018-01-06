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

module.exports = {
	filter
};
