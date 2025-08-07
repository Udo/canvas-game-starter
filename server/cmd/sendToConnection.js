
module.exports = function sendToConnection(server, params) {
    const { connection, message } = params;
    
    if (connection && connection.readyState === 1) { // WebSocket.OPEN = 1
        connection.send(JSON.stringify(message));
        return true;
    } else {
        console.warn('⚠️ Attempted to send to closed/invalid connection');
        return false;
    }
};
