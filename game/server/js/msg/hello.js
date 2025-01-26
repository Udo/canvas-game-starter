module.exports = async (ws, message) => {

	ws.context.client_id = message.client_id;

	ws.session = ws.broker.fio.load('session', ws.context.client_id);

	ws.send({
		type: 'welcome',
		session : ws.session,
		user : ws.broker.fio.load('user', ws.session.username),
	});

};
