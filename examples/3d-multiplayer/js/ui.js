UI = {

	handlers : {

		login : () => {
			Events.emit('reset');
			ScreenUI.create_window('login', { position : 'middle' });
		},

		reload : () => {
			document.location.reload(true);
		},

		auth_success : () => {
			ScreenUI.close_window('login');
		},

		auth_fail : (msg) => {
			$('#login-msg').text(msg.text);
		},

		session : () => {
			console.log('username', Connection.session.username)
			$('#info-username').text(Connection.session.username || '');
		},

		connection : (prop) => {
			ScreenUI.create_window('connection_status', false, prop);
			if(prop.status == 'connected') {
				setTimeout(() => {
					ScreenUI.close_window('connection_status');
				}, 500);
			}
		},

	},

	try_auth : (username, password) => {
		Connection.send({
			type : 'authenticate',
			username : username,
			password : password,
		});
	},

	init : () => {


		Events.batch_subscribe(UI.handlers);

		return true;
	},



}
