
module.exports = function sendError(server, params) {
    const { connection, errorMessage } = params;
    const sendToConnection = server.cmd.get('sendToConnection');
    
    return sendToConnection(server, {
        connection,
        message: {
            type: 'error',
            message: errorMessage,
            timestamp: new Date()
        }
    });
};
