
module.exports = function handleClientDisconnect(server, params) {
    const { connection } = params;
    const userId = server.connectionUsers.get(connection);
    
    if (userId) {
        const user = server.users.get(userId);
        if (user) {
            // Notify all users that someone left
            server.cmd.get('broadcastToAll')(server, {
                message: {
                    type: 'user-left',
                    user: user
                }
            });
            
            // Clean up
            server.users.delete(userId);
            server.userConnections.delete(userId);
            server.connectionUsers.delete(connection);
            
            console.log(`User disconnected: ${user.name} (${userId})`);
        }
    }
    
    return true;
};
