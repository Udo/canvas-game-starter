
module.exports = (message, connection, server) => {
	const { name, avatar } = message;
	
	if (!name || name.trim().length === 0) {
		server.cmd.get('sendError')(server, { connection, errorMessage: 'Name is required' });
		return;
	}

	if (name.trim().length > 32) {
		server.cmd.get('sendError')(server, { connection, errorMessage: 'Name must be 32 characters or less' });
		return;
	}

	// Check if name is already taken
	for (const [userId, user] of server.users) {
		if (user.name.toLowerCase() === name.toLowerCase()) {
			server.cmd.get('sendError')(server, { connection, errorMessage: 'Name already taken' });
			return;
		}
	}

	// Create user
	const userId = server.cmd.get('generateId')(server, {});
	const user = {
		id: userId,
		name: name.trim(),
		avatar: avatar || '👤',
		joinedAt: new Date(),
		isOnline: true
	};

	server.users.set(userId, user);
	server.userConnections.set(userId, connection);
	server.connectionUsers.set(connection, userId);
	
	server.cmd.get('sendToConnection')(server, { 
		connection, 
		message: {
			type: 'auth-success',
			user: user
		}
	});

	// Notify all users that someone joined
	server.cmd.get('broadcastToAll')(server, {
		message: {
			type: 'user-joined',
			user: user
		}
	});

	console.log(`User authenticated: ${name} (${userId})`);
};
