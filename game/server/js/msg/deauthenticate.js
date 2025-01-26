module.exports = async (ws, message) => {

	ws.session = {};
	ws.save_session();

	ws.send({
		type : 'welcome',
		session : ws.session,
		user : {},
	});

};
