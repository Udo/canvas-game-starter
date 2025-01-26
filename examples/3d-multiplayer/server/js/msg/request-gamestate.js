module.exports = async (ws, message) => {

	let state = {
		time : new Date() / 1000,
		map : ws.broker.module('map').get(ws),
	};

	ws.send({
		type : 'gamestate',
		state,
	});

};
