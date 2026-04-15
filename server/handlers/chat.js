
module.exports = (message, connection, server) => {
	const userId = server.connectionUsers.get(connection);
	const { text } = message;

	if (!userId) {
		server.cmd.get('sendError')(server, { connection, errorMessage: 'Not authenticated' });
		return;
	}

	const user = server.users.get(userId);

	if (!text || text.trim().length === 0) {
		return;
	}

	const chatMessage = {
		type: 'chat-message',
		user: user,
		text: text.trim(),
		timestamp: new Date()
	};

	server.cmd.get('broadcastToAll')(server, { message: chatMessage });
};
