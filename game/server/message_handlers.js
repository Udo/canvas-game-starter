var { nv_get, nv_set, each, json, safe_string } = require('./lib.js');

MessageHandlers = {
	
	_common : (msg, con, broker) => {
		// this gets called every time	
		return(true);
	},
	
	client_hello : (msg, con, broker) => {
		con.send({ type : 'client_hello_response', 'text' : 'we\'re connected now' });
	},
	
	chat_message : (msg, con, broker) => {
		broker.send_to_all({ type : 'chat', 'text' : msg.text, 'from' : con.sessionInfo.wskey });
	},
	
}

each(MessageHandlers, (v, k) => {
	exports[k] = v;
});