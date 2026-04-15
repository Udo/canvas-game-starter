class WebRTCChat {
	constructor() {
		this.localConnection = null;
		this.dataChannel = null;
		this.isInitiator = false;
		this.roomId = null;
		this.connected = false;
		this.pendingCandidates = []; 
		this.processedMessages = new Set(); 
		this.lastSignalingCheck = 0;
		this.signalingInterval = null;
		this.instanceId = Math.random().toString(36).substring(2, 15);
		this.connectionTimeout = null;
		
		this.remoteDescriptionSet = false;
		
		// WebRTC configuration with free STUN servers
		this.config = {
			iceServers: [
				{ urls: 'stun:stun.l.google.com:19302' },
				{ urls: 'stun:stun1.l.google.com:19302' },
				{ urls: 'stun:stun2.l.google.com:19302' }
			]
		};
		
		this.initializeEventListeners();
	}
	
	initializeEventListeners() {
		document.getElementById('createRoomBtn').addEventListener('click', () => this.createRoom());
		document.getElementById('joinRoomBtn').addEventListener('click', () => this.joinRoom());
		document.getElementById('copyRoomBtn').addEventListener('click', () => this.copyRoomId());
		document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
		document.getElementById('messageInput').addEventListener('keypress', (e) => {
			if (e.key === 'Enter') this.sendMessage();
		});
	}
	
	async delay(ms = 10) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	startConnectionTimeout() {
		this.clearConnectionTimeout();
		
		this.connectionTimeout = setTimeout(() => {
			if (this.localConnection && 
				this.localConnection.iceConnectionState === 'checking') {
				this.addSystemMessage('⏰ Connection timeout - ICE checking took too long');
				this.addSystemMessage('💡 This often indicates NAT/firewall issues');
				this.addSystemMessage('💡 Try using a different network or VPN');
			}
		}, 30000);
	}
	
	clearConnectionTimeout() {
		if (this.connectionTimeout) {
			clearTimeout(this.connectionTimeout);
			this.connectionTimeout = null;
		}
	}
	
	generateRoomId() {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	}
	
	async createRoom() {
		this.roomId = this.generateRoomId();
		this.isInitiator = true;
		
		document.getElementById('roomId').value = this.roomId;
		document.getElementById('roomInfo').style.display = 'block';
		document.getElementById('createRoomBtn').disabled = true;
		document.getElementById('joinRoomBtn').disabled = true;
		
		this.updateStatus('Waiting for peer...', 'connecting');
		this.addSystemMessage(`Room created: ${this.roomId}. Share this ID with someone to connect.`);
		
		this.startSignalingListener();
		
		await this.initializeConnection();
	}
	
	async joinRoom() {
		const roomInput = document.getElementById('joinRoomId');
		this.roomId = roomInput.value.trim();
		
		if (!this.roomId) {
			alert('Please enter a room ID');
			return;
		}
		
		this.isInitiator = false;
		document.getElementById('createRoomBtn').disabled = true;
		document.getElementById('joinRoomBtn').disabled = true;
		roomInput.disabled = true;
		
		this.updateStatus('Connecting...', 'connecting');
		this.addSystemMessage(`Joining room: ${this.roomId}`);
		
		this.startSignalingListener();
		
		await this.initializeConnection();
	}
	
	async initializeConnection() {
		try {
			this.localConnection = new RTCPeerConnection(this.config);
			
			this.localConnection.onicecandidate = (event) => {
				if (event.candidate) {
					this.sendSignalingMessage({
						type: 'ice-candidate',
						candidate: {
							candidate: event.candidate.candidate,
							sdpMid: event.candidate.sdpMid,
							sdpMLineIndex: event.candidate.sdpMLineIndex
						},
						roomId: this.roomId
					});
				} else {
					this.addSystemMessage('🧊 Local ICE candidate gathering finished');
				}
			};
			
			this.localConnection.onsignalingstatechange = () => {
			};
			
			this.localConnection.oniceconnectionstatechange = () => {
				if (this.localConnection.iceConnectionState === 'connected') {
					this.addSystemMessage('🧊 ICE connected - establishing data channel...');
					this.clearConnectionTimeout();
				} else if (this.localConnection.iceConnectionState === 'completed') {
					this.addSystemMessage('🧊 ICE connection completed!');
					this.clearConnectionTimeout();
				} else if (this.localConnection.iceConnectionState === 'failed') {
					this.addSystemMessage('❌ ICE connection failed - NAT/firewall issue?');
					this.addSystemMessage('💡 Try refreshing both pages and reconnecting');
					this.clearConnectionTimeout();
				} else if (this.localConnection.iceConnectionState === 'checking') {
					this.addSystemMessage('🔍 Checking ICE candidates...');
					this.startConnectionTimeout();
				} else if (this.localConnection.iceConnectionState === 'disconnected') {
					this.addSystemMessage('🔌 ICE disconnected');
				} else if (this.localConnection.iceConnectionState === 'closed') {
					this.addSystemMessage('🔒 ICE connection closed');
					this.clearConnectionTimeout();
				}
			};
			
			this.localConnection.onicegatheringstatechange = () => {
				if (this.localConnection.iceGatheringState === 'gathering') {
					this.addSystemMessage('🔍 Gathering ICE candidates...');
				} else if (this.localConnection.iceGatheringState === 'complete') {
					this.addSystemMessage('✅ ICE candidate gathering complete');
				}
			};
			
			this.localConnection.onconnectionstatechange = () => {
				if (this.localConnection.connectionState === 'connected') {
					this.updateStatus('Connected', 'connected');
					this.enableChat();
					this.addSystemMessage('🎉 Connected! You can now chat.');
				} else if (this.localConnection.connectionState === 'failed' || 
						  this.localConnection.connectionState === 'disconnected') {
					this.updateStatus('Disconnected', 'disconnected');
					this.disableChat();
					this.addSystemMessage('❌ Connection lost');
				} else if (this.localConnection.connectionState === 'connecting') {
					this.addSystemMessage('🔄 Establishing connection...');
				}
			};
			
			if (this.isInitiator) {
				this.dataChannel = this.localConnection.createDataChannel('chat', {
					ordered: true
				});
				this.setupDataChannel();
				
				const offer = await this.localConnection.createOffer();
				await this.localConnection.setLocalDescription(offer);
				
				this.sendSignalingMessage({
					type: 'offer',
					offer: {
						type: offer.type,
						sdp: offer.sdp
					},
					roomId: this.roomId
				});
				this.addSystemMessage('📤 Offer sent - waiting for peer to respond...');
			} else {
				this.localConnection.ondatachannel = (event) => {
					this.dataChannel = event.channel;
					this.setupDataChannel();
				};
			}
			
		} catch (error) {
			console.error('Error initializing connection:', error);
			this.updateStatus('Connection failed', 'disconnected');
		}
	}
	
	setupDataChannel() {
		this.dataChannel.onopen = () => {
			this.connected = true;
			this.addSystemMessage('🎉 Connected! You can now chat.');
			
			if (this.signalingInterval) {
				clearInterval(this.signalingInterval);
				this.signalingInterval = null;
			}
		};
		
		this.dataChannel.onclose = () => {
			this.connected = false;
			this.updateStatus('Disconnected', 'disconnected');
			this.disableChat();
			
			if (this.signalingInterval) {
				clearInterval(this.signalingInterval);
				this.signalingInterval = null;
			}
		};
		
		this.dataChannel.onmessage = (event) => {
			this.addMessage(event.data, 'peer');
		};
		
		this.dataChannel.onerror = (error) => {
			console.error('Data channel error:', error);
		};
	}
	
	async sendSignalingMessage(message) {
		const messageWithId = {
			...message,
			timestamp: Date.now(),
			id: Math.random().toString(36).substring(2, 15),
			instanceId: this.instanceId
		};
		
		try {
			const response = await fetch(`signaling.php?room=${encodeURIComponent(this.roomId)}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(messageWithId)
			});
			
			const result = await response.json();
			
			if (!result.success) {
				console.error('Signaling server error:', result.error);
				this.addSystemMessage(`Signaling error: ${result.error}`);
				return;
			}
			
		} catch (error) {
			console.error('Error sending signaling message:', error);
			this.addSystemMessage(`Network error: ${error.message}`);
		}
	}
	
	startSignalingListener() {
		this.lastSignalingCheck = 0;
		
		this.signalingInterval = setInterval(() => {
			this.checkForSignalingMessages();
		}, 1000);
		
		this.addSystemMessage('Using PHP signaling server - works across devices!');
		this.addSystemMessage('Share the room ID with someone on another device to connect.');
	}
	
	async checkForSignalingMessages() {
		if (!this.roomId) {
			return;
		}
		
		try {
			const response = await fetch(`signaling.php?room=${encodeURIComponent(this.roomId)}&since=${this.lastSignalingCheck}`);
			
			const data = await response.json();
			
			if (!data.success) {
				console.error('Signaling server error:', data.error);
				this.addSystemMessage(`Signaling error: ${data.error}`);
				return;
			}
			
			let latestMessageTimestamp = this.lastSignalingCheck;
			for (const message of data.messages) {
				
				if (message.data.instanceId === this.instanceId) {
					latestMessageTimestamp = Math.max(latestMessageTimestamp, message.timestamp);
					continue;
				}
				
				if (this.processedMessages.has(message.data.id)) {
					latestMessageTimestamp = Math.max(latestMessageTimestamp, message.timestamp);
					continue;
				}
				
				await this.handleSignalingMessage(message.data);
				latestMessageTimestamp = Math.max(latestMessageTimestamp, message.timestamp);
			}
			
			this.lastSignalingCheck = latestMessageTimestamp;
		} catch (error) {
			console.error('Error checking for signaling messages:', error);
			this.addSystemMessage(`Network error: ${error.message}`);
		}
	}
	
	async handleSignalingMessage(message) {
		if (this.processedMessages.has(message.id)) {
			return;
		}
		this.processedMessages.add(message.id);
		
		if (message.sender === (this.isInitiator ? 'initiator' : 'joiner')) {
			return;
		}
		
		try {
			switch (message.type) {
				case 'offer':
					if (!this.isInitiator && this.localConnection) {
						this.addSystemMessage('📥 Received offer - creating answer...');
						
						try {
							await this.localConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
							this.remoteDescriptionSet = true;
							
							await this.delay(10);
							
							await this.processPendingCandidates();
							
							const answer = await this.localConnection.createAnswer();
							await this.localConnection.setLocalDescription(answer);
							
							await this.delay(10);
							
							this.sendSignalingMessage({
								type: 'answer',
								answer: {
									type: answer.type,
									sdp: answer.sdp
								},
								roomId: this.roomId
							});
							this.addSystemMessage('📤 Answer sent - establishing connection...');
						} catch (error) {
							console.error('Error processing offer:', error);
							this.addSystemMessage(`Error processing offer: ${error.message}`);
						}
					}
					break;
					
				case 'answer':
					if (this.isInitiator && this.localConnection) {
						this.addSystemMessage('📥 Received answer - finalizing connection...');
						
						try {
							await this.localConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
							this.remoteDescriptionSet = true;
							
							await this.delay(10);
							
							await this.processPendingCandidates();
						} catch (error) {
							console.error('Error processing answer:', error);
							this.addSystemMessage(`Error processing answer: ${error.message}`);
						}
					}
					break;
					
				case 'ice-candidate':
					if (this.localConnection) {
						const candidate = new RTCIceCandidate(message.candidate);
						
						if (this.remoteDescriptionSet && this.localConnection.remoteDescription) {
							try {
								await this.localConnection.addIceCandidate(candidate);
								this.addSystemMessage('🧊 Added ICE candidate from peer');
							} catch (error) {
								console.error('Error adding ICE candidate:', error);
								this.addSystemMessage(`❌ Failed to add ICE candidate: ${error.message}`);
							}
						} else {
							this.pendingCandidates.push(candidate);
							this.addSystemMessage(`⏳ Queued ICE candidate (${this.pendingCandidates.length} pending)`);
						}
					}
					break;
					
				default:
			}
		} catch (error) {
			console.error('💥 Error handling signaling message:', error);
			this.addSystemMessage(`Signaling error: ${error.message}`);
		}
	}
	
	async processPendingCandidates() {
		if (this.pendingCandidates.length === 0) {
			return;
		}
		
		this.addSystemMessage(`🧊 Processing ${this.pendingCandidates.length} queued ICE candidates`);
		
		const addCandidatePromises = this.pendingCandidates.map(async (candidate) => {
			try {
				await this.localConnection.addIceCandidate(candidate);
			} catch (error) {
				console.error('Error adding pending ICE candidate:', error);
			}
		});
		
		await Promise.all(addCandidatePromises);
		
		this.pendingCandidates = [];
		this.addSystemMessage('✅ All queued ICE candidates processed');
	}
	
	sendMessage() {
		const input = document.getElementById('messageInput');
		const message = input.value.trim();
		
		if (!message || !this.connected || !this.dataChannel) return;
		
		try {
			this.dataChannel.send(message);
			this.addMessage(message, 'own');
			input.value = '';
		} catch (error) {
			console.error('Error sending message:', error);
		}
	}
	
	addMessage(text, type) {
		const messagesContainer = document.getElementById('messages');
		const messageDiv = document.createElement('div');
		messageDiv.className = `message ${type}`;
		messageDiv.textContent = text;
		
		messagesContainer.appendChild(messageDiv);
		messagesContainer.scrollTop = messagesContainer.scrollHeight;
	}
	
	addSystemMessage(text) {
		const messagesContainer = document.getElementById('messages');
		const messageDiv = document.createElement('div');
		messageDiv.className = 'message system';
		messageDiv.textContent = text;
		
		messagesContainer.appendChild(messageDiv);
		messagesContainer.scrollTop = messagesContainer.scrollHeight;
	}
	
	updateStatus(text, state) {
		document.getElementById('status').textContent = text;
		const indicator = document.getElementById('statusIndicator');
		indicator.className = `status-indicator ${state}`;
	}
	
	enableChat() {
		document.getElementById('messageInput').disabled = false;
		document.getElementById('sendBtn').disabled = false;
	}
	
	disableChat() {
		document.getElementById('messageInput').disabled = true;
		document.getElementById('sendBtn').disabled = true;
	}
	
	copyRoomId() {
		const roomIdInput = document.getElementById('roomId');
		roomIdInput.select();
		roomIdInput.setSelectionRange(0, 99999);
		
		try {
			document.execCommand('copy');
			const btn = document.getElementById('copyRoomBtn');
			const originalText = btn.textContent;
			btn.textContent = 'Copied!';
			setTimeout(() => {
				btn.textContent = originalText;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy room ID:', err);
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	window.webrtcChat = new WebRTCChat();
});
