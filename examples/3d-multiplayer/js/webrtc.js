function MultiplayerConnection(prop) {

	this.prop = prop;

	if(!prop.room_key)
		prop.room_key = 'example_room';

	if(!prop.signaling_server)
		prop.signaling_server = 'wss://rolz.org/signal/';

	if(!prop.stun_server)
		prop.stun_server = {
			iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
		};

    prop.reconnect_interval = prop.reconnect_interval || 5000;
    prop.ws_status = 'disconnected';

	let peers = this.peers = {};
	let local_stream = this.local_stream = null;
	let socket = this.socket = new WebSocket(prop.signaling_server);

    let connect_ws = this.connect_ws = () => {
        socket = this.socket = new WebSocket(prop.signaling_server);

        socket.onopen = () => {
			prop.ws_status = 'opening';
            if (typeof prop.onopen == 'function') prop.onopen();
            console.log('socket.onopen()', 'WebSocket connection established');
            socket.send(JSON.stringify({ type: 'join', room: prop.room_key }));
        };

        socket.onclose = () => {
			prop.ws_status = 'disconnected';
            if (typeof prop.onclose == 'function') prop.onclose();
            console.log('socket.onclose()', 'WebSocket connection closed. Attempting to reconnect...');
            setTimeout(connect_ws, prop.reconnect_interval);
        };

        socket.onerror = error => {
			prop.ws_status = 'disconnected';
            if (typeof prop.onerror == 'function') prop.onerror(error);
            else console.error('socket.onerror()', 'WebSocket error:', error);
        };

		function blobToString(blob) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					resolve(reader.result);
				};
				reader.onerror = (error) => {
					reject(error);
				};
				reader.readAsText(blob);
			});
		}

        socket.onmessage = message => {
            let data = {}

            try { data = JSON.parse(message.data); }
            catch (ee) { console.error(ee, message.data, blobToString(message.data)); }

            console.log('socket.onmessage()', data.type);

            switch (data.type) {
                case 'offer':
                    handleOffer(data.offer, data.from);
                    break;
                case 'answer':
                    handleAnswer(data.answer, data.from);
                    break;
                case 'candidate':
                    handleCandidate(data.candidate, data.from);
                    break;
                case 'joined':
					prop.ws_status = 'joined';
					prop.session_id = data.peer;
					if(typeof prop.onjoined == 'function')
						prop.onjoined(data);
                    callNewPeer(data.peer);
                    break;
                default:
                    console.log('Unknown message type:', data);
            }

            if (typeof prop.onmessage == 'function') prop.onmessage(data);

        };
    };

    connect_ws();

    function callNewPeer(peerId) {
        console.log('callNewPeer(' + peerId + ')');
        const peerConnection = new RTCPeerConnection(prop.stun_server);
        peers[peerId] = peerConnection;

        setupDataChannel(peerConnection); // Setup Data Channel for the offerer
        addLocalTracks(peerConnection);

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                console.log('peerConnection.onicecandidate()');
                socket.send(JSON.stringify({ type: 'candidate', to: peerId, candidate: event.candidate }));
            }
        };

        peerConnection.createOffer().then(offer => {
            return peerConnection.setLocalDescription(offer);
        }).then(() => {
            console.log('peerConnection.createOffer()');
            socket.send(JSON.stringify({ type: 'offer', to: peerId, offer: peerConnection.localDescription }));
        }).catch(error => {
            console.error('Error during offer creation:', error);
        });
    }

    function handleOffer(offer, from) {
        const peerConnection = new RTCPeerConnection(prop.stun_server);
        peers[from] = peerConnection;

        console.log('handleOffer()');
        addLocalTracks(peerConnection);

        peerConnection.ondatachannel = event => {
            const dataChannel = event.channel;
            setupDataChannelEvents(dataChannel); // Setup event listeners for the data channel
        };

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                console.log('peerConnection.onicecandidate()');
                socket.send(JSON.stringify({ type: 'candidate', to: from, candidate: event.candidate }));
            }
        };

        peerConnection.setRemoteDescription(new RTCSessionDescription(offer)).then(() => {
            console.log('peerConnection.setRemoteDescription() createAnswer()');
            return peerConnection.createAnswer();
        }).then(answer => {
            console.log('peerConnection.setRemoteDescription() setLocalDescription()');
            return peerConnection.setLocalDescription(answer);
        }).then(() => {
            console.log('peerConnection.setRemoteDescription() socket.send()');
            socket.send(JSON.stringify({ type: 'answer', to: from, answer: peerConnection.localDescription }));
        }).catch(error => {
            console.error('Error during answer handling:', error);
        });
    }

	function handleAnswerX(answer, from) {
		const peerConnection = peers[from];
		peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
		if(typeof prop.onanswer == 'function')
			prop.onanswer(answer, peers[from]);
	}

	function handleAnswer(answer, from) {
		const peerConnection = peers[from];
		console.log('handleAnswer()', 'Current signaling state:', peerConnection.signalingState);
		if (peerConnection.signalingState == 'stable') {
			return;
		}
		peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
			.then(() => {
				// Further actions after setting the remote description
			})
			.catch(error => {
				console.error('Error setting remote description:', error);
			});
	}

	function handleCandidate(candidate, from) {
		const peerConnection = peers[from];
		console.log('handleCandidate()');
		peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
		if(typeof prop.oncandidate == 'function')
			prop.oncandidate(candidate, peers[from]);
	}

	function addLocalTracks(peerConnection) {
		console.log('addLocalTracks()');
		if (local_stream) {
			local_stream.getTracks().forEach(track => {
				peerConnection.addTrack(track, local_stream);
			});
		}
	}

	function setupDataChannel(peerConnection) {
		console.log('setupDataChannel()');
		const dataChannel = peerConnection.createDataChannel("chat");
		dataChannel.onmessage = event => {
			console.log("dataChannel.onmessage() Message from peer:", event.data);
			if(typeof prop.ondata == 'function')
				prop.ondata(event.data, event);
		};
	}

    function setupDataChannelEvents(dataChannel) {
        console.log('setupDataChannelEvents()');
        dataChannel.onmessage = event => {
            console.log("dataChannel.onmessage() Message from peer:", event.data);
            if (typeof prop.ondata == 'function')
                prop.ondata(event.data, event);
        };
        // Add other data channel event listeners here (e.g., onopen, onclose, onerror)
    }
	this.send_chat = function sendMessageToChat(message, peerId) {
		const peerConnection = peers[peerId];
		if (peerConnection) {
			const dataChannel = peerConnection.dataChannel;
			if (dataChannel && dataChannel.readyState === 'open') {
				dataChannel.send(message);
			} else {
				console.error('Data channel is not open');
			}
		} else {
			console.error('Peer connection not found');
		}
	}

}
