let crypto = require('crypto');

function sha1(s) {
	let sc = crypto.createHash('sha1');
	return sc.update(s).digest('hex');
}

module.exports = async (ws, message) => {

	let username = message.username ? message.username.toLowerCase().trim() : '';
	if(!username) return;

	let auth_successful = false;

	var user_profile =  ws.broker.fio.load('auth', username);
	if (!user_profile.username) {
		// this is new
		user_profile.username = username;
		user_profile.password = sha1(message.password); // whatever, this isn't a high sec app
		user_profile.created = new Date();
		ws.broker.fio.save('auth', username, user_profile);
		auth_successful = true;
	} else if (user_profile.password === sha1(message.password)) {
		auth_successful = true;
	}

	if(auth_successful) {
		ws.session.username = username;
		ws.save_session();
		ws.send({
			type : 'auth_success',
			session : ws.session,
			user : ws.broker.fio.load('user', ws.session.username),
		});
	} else {
		ws.send({
			type : 'auth_fail',
			text : 'username already taken / password invalid',
			session : ws.session,
		});
	}

};
