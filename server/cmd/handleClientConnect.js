
module.exports = function handleClientConnect(server, params) {
    const { connection } = params;
    
    // Send welcome message and room list
    const getRoomsList = server.cmd.get('getRoomsList');
    
    server.sendToConnection(connection, {
        type: 'welcome',
        message: 'Welcome to the game server!',
        rooms: getRoomsList(server, {})
    });
    
    return true;
};
