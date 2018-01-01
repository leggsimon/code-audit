function traverse (node, func) {
	func(node);

	for (let key in node) {
		if (node.hasOwnProperty(key)) {
			const child = node[key];
			if (typeof child === 'object' && child !== null) {

				if (Array.isArray(child)) {
					child.forEach(node => traverse(node, func));
				} else {
					traverse(child, func);
				}
			}
		}
	}
}

function filter (ast, filterFunction) {
	const result = [];
	traverse(ast, (node) => {
		if (filterFunction(node)) {
			result.push(node);
		}
	});
	return result;
}

module.exports = {
	filter
};
