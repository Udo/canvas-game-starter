
module.exports = function generateId(server, params) {
	return Math.random().toString(36).substr(2, 9);
};
