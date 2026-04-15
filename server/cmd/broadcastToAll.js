
module.exports = function broadcastToAll(server, params) {
    const { message } = params;
    server.broker.broadcast(message);
    return true;
};
