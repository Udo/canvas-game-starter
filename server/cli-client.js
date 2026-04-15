#!/usr/bin/env node

const WebSocket = require('ws');
const readline = require('readline');

/**
 * Interactive Command Line Client for Game Server
 * Provides a full-featured CLI interface for testing server functionality
 */
class CLIClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.user = null;
        this.currentRoom = null;
        this.rooms = [];
        this.roomUsers = [];
        this.rl = null;
        this.commandHistory = [];
        this.autoReconnect = false;
        
        this.setupReadline();
        this.setupCommands();
    }

    setupReadline() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '> ',
            historySize: 100
        });

        this.rl.on('line', (input) => {
            this.handleCommand(input.trim());
        });

        this.rl.on('SIGINT', () => {
            this.disconnect();
            process.exit(0);
        });
    }

    setupCommands() {
        this.commands = {
            // Connection commands
            connect: {
                description: 'Connect to server',
                usage: 'connect <username> [avatar]',
                handler: this.cmdConnect.bind(this)
            },
            disconnect: {
                description: 'Disconnect from server',
                usage: 'disconnect',
                handler: this.cmdDisconnect.bind(this)
            },
            status: {
                description: 'Show connection status',
                usage: 'status',
                handler: this.cmdStatus.bind(this)
            },

            // Room commands
            rooms: {
                description: 'List all rooms',
                usage: 'rooms',
                handler: this.cmdRooms.bind(this)
            },
            join: {
                description: 'Join a room',
                usage: 'join <roomId>',
                handler: this.cmdJoin.bind(this)
            },
            leave: {
                description: 'Leave current room',
                usage: 'leave',
                handler: this.cmdLeave.bind(this)
            },
            create: {
                description: 'Create a new room',
                usage: 'create <name> [type] [maxUsers]',
                handler: this.cmdCreate.bind(this)
            },
            users: {
                description: 'List users in current room',
                usage: 'users',
                handler: this.cmdUsers.bind(this)
            },

            // Chat commands
            say: {
                description: 'Send a chat message',
                usage: 'say <message>',
                handler: this.cmdSay.bind(this)
            },
            msg: {
                description: 'Alias for say',
                usage: 'msg <message>',
                handler: this.cmdSay.bind(this)
            },

            // Game commands
            ready: {
                description: 'Mark yourself as ready for game',
                usage: 'ready',
                handler: this.cmdReady.bind(this)
            },
            move: {
                description: 'Make a game move',
                usage: 'move [data]',
                handler: this.cmdMove.bind(this)
            },
            reset: {
                description: 'Reset the game',
                usage: 'reset',
                handler: this.cmdReset.bind(this)
            },

            // Utility commands
            help: {
                description: 'Show this help message',
                usage: 'help [command]',
                handler: this.cmdHelp.bind(this)
            },
            clear: {
                description: 'Clear the screen',
                usage: 'clear',
                handler: this.cmdClear.bind(this)
            },
            history: {
                description: 'Show command history',
                usage: 'history',
                handler: this.cmdHistory.bind(this)
            },
            echo: {
                description: 'Echo text',
                usage: 'echo <text>',
                handler: this.cmdEcho.bind(this)
            },
            raw: {
                description: 'Send raw JSON message',
                usage: 'raw <json>',
                handler: this.cmdRaw.bind(this)
            },

            // Auto commands
            auto: {
                description: 'Run automated test sequence',
                usage: 'auto [scenario]',
                handler: this.cmdAuto.bind(this)
            }
        };

        // Add aliases
        this.commands.h = this.commands.help;
        this.commands.r = this.commands.rooms;
        this.commands.j = this.commands.join;
        this.commands.l = this.commands.leave;
        this.commands.c = this.commands.connect;
        this.commands.d = this.commands.disconnect;
        this.commands.s = this.commands.say;
        this.commands.u = this.commands.users;
    }

    start() {
        this.showWelcome();
        this.rl.prompt();
    }

    showWelcome() {
        console.log('\n🎮 Game Server CLI Client');
        console.log('═══════════════════════════════');
        console.log('Type "help" for available commands');
        console.log('Type "connect <username>" to get started');
        console.log('Ctrl+C to exit\n');
    }

    handleCommand(input) {
        if (!input) {
            this.rl.prompt();
            return;
        }

        // Add to history
        this.commandHistory.push(input);
        if (this.commandHistory.length > 50) {
            this.commandHistory.shift();
        }

        const [command, ...args] = input.split(' ');
        const cmd = this.commands[command.toLowerCase()];

        if (cmd) {
            try {
                cmd.handler(args);
            } catch (error) {
                this.error(`Error executing command: ${error.message}`);
            }
        } else {
            this.error(`Unknown command: ${command}. Type "help" for available commands.`);
        }

        this.rl.prompt();
    }

    // Connection Commands
    cmdConnect(args) {
        if (this.isConnected) {
            this.warning('Already connected. Use "disconnect" first.');
            return;
        }

        const username = args[0];
        const avatar = args[1] || '🤖';

        if (!username) {
            this.error('Usage: connect <username> [avatar]');
            return;
        }

        this.connect(username, avatar);
    }

    cmdDisconnect() {
        if (!this.isConnected) {
            this.warning('Not connected.');
            return;
        }

        this.disconnect();
    }

    cmdStatus() {
        if (this.isConnected) {
            this.info(`Connected as: ${this.user?.name} ${this.user?.avatar}`);
            this.info(`Current room: ${this.currentRoom?.name || 'None'}`);
            this.info(`Available rooms: ${this.rooms.length}`);
            this.info(`Users in room: ${this.roomUsers.length}`);
        } else {
            this.info('Disconnected');
        }
    }

    // Room Commands
    cmdRooms() {
        if (!this.isConnected) {
            this.error('Not connected.');
            return;
        }

        if (this.rooms.length === 0) {
            this.info('No rooms available.');
            return;
        }

        console.log('\n📋 Available Rooms:');
        console.log('─'.repeat(60));
        this.rooms.forEach(room => {
            const current = this.currentRoom?.id === room.id ? ' [CURRENT]' : '';
            const gameStatus = room.hasGame ? ` (${room.gameStatus})` : '';
            console.log(`${room.id.padEnd(12)} | ${room.name.padEnd(20)} | ${room.type.padEnd(8)} | ${room.userCount}/${room.maxUsers}${gameStatus}${current}`);
        });
        console.log('');
    }

    cmdJoin(args) {
        if (!this.isConnected) {
            this.error('Not connected.');
            return;
        }

        const roomId = args[0];
        if (!roomId) {
            this.error('Usage: join <roomId>');
            return;
        }

        this.send({
            type: 'join-room',
            roomId: roomId
        });
    }

    cmdLeave() {
        if (!this.currentRoom) {
            this.warning('Not in any room.');
            return;
        }

        this.send({
            type: 'leave-room',
            roomId: this.currentRoom.id
        });
    }

    cmdCreate(args) {
        if (!this.isConnected) {
            this.error('Not connected.');
            return;
        }

        const name = args[0];
        const type = args[1] || 'chat';
        const maxUsers = parseInt(args[2]) || (type === 'game' ? 4 : 20);

        if (!name) {
            this.error('Usage: create <name> [type] [maxUsers]');
            return;
        }

        this.send({
            type: 'create-room',
            name: name,
            type: type,
            maxUsers: maxUsers
        });
    }

    cmdUsers() {
        if (!this.currentRoom) {
            this.warning('Not in any room.');
            return;
        }

        if (this.roomUsers.length === 0) {
            this.info('No users in room.');
            return;
        }

        console.log(`\n👥 Users in ${this.currentRoom.name}:`);
        console.log('─'.repeat(30));
        this.roomUsers.forEach((user, index) => {
            const you = user.id === this.user?.id ? ' (you)' : '';
            console.log(`${(index + 1).toString().padStart(2)}. ${user.avatar} ${user.name}${you}`);
        });
        console.log('');
    }

    // Chat Commands
    cmdSay(args) {
        if (!this.currentRoom) {
            this.error('Not in any room.');
            return;
        }

        const message = args.join(' ');
        if (!message) {
            this.error('Usage: say <message>');
            return;
        }

        this.send({
            type: 'chat',
            roomId: this.currentRoom.id,
            text: message
        });
    }

    // Game Commands
    cmdReady() {
        if (!this.currentRoom || !this.currentRoom.hasGame) {
            this.error('Not in a game room.');
            return;
        }

        this.send({
            type: 'game-action',
            roomId: this.currentRoom.id,
            action: 'ready'
        });
    }

    cmdMove(args) {
        if (!this.currentRoom || !this.currentRoom.hasGame) {
            this.error('Not in a game room.');
            return;
        }

        let data = { action: 'test' };
        if (args.length > 0) {
            try {
                data = JSON.parse(args.join(' '));
            } catch {
                data = { move: args.join(' ') };
            }
        }

        this.send({
            type: 'game-action',
            roomId: this.currentRoom.id,
            action: 'move',
            data: data
        });
    }

    cmdReset() {
        if (!this.currentRoom || !this.currentRoom.hasGame) {
            this.error('Not in a game room.');
            return;
        }

        this.send({
            type: 'game-action',
            roomId: this.currentRoom.id,
            action: 'reset'
        });
    }

    // Utility Commands
    cmdHelp(args) {
        const command = args[0];

        if (command && this.commands[command]) {
            const cmd = this.commands[command];
            console.log(`\n📖 ${command}:`);
            console.log(`   ${cmd.description}`);
            console.log(`   Usage: ${cmd.usage}\n`);
            return;
        }

        console.log('\n📖 Available Commands:');
        console.log('═'.repeat(50));
        
        const categories = {
            'Connection': ['connect', 'disconnect', 'status'],
            'Rooms': ['rooms', 'join', 'leave', 'create', 'users'],
            'Chat': ['say', 'msg'],
            'Game': ['ready', 'move', 'reset'],
            'Utility': ['help', 'clear', 'history', 'echo', 'raw', 'auto']
        };

        for (const [category, commands] of Object.entries(categories)) {
            console.log(`\n${category}:`);
            commands.forEach(cmdName => {
                if (this.commands[cmdName]) {
                    const cmd = this.commands[cmdName];
                    console.log(`  ${cmdName.padEnd(12)} - ${cmd.description}`);
                }
            });
        }

        console.log('\nAliases: h=help, r=rooms, j=join, l=leave, c=connect, d=disconnect, s=say, u=users');
        console.log('Type "help <command>" for detailed usage.\n');
    }

    cmdClear() {
        console.clear();
        this.showWelcome();
    }

    cmdHistory() {
        if (this.commandHistory.length === 0) {
            this.info('No command history.');
            return;
        }

        console.log('\n📜 Command History:');
        console.log('─'.repeat(30));
        this.commandHistory.slice(-10).forEach((cmd, index) => {
            console.log(`${(index + 1).toString().padStart(2)}. ${cmd}`);
        });
        console.log('');
    }

    cmdEcho(args) {
        console.log(args.join(' '));
    }

    cmdRaw(args) {
        if (!this.isConnected) {
            this.error('Not connected.');
            return;
        }

        try {
            const json = JSON.parse(args.join(' '));
            this.send(json);
            this.info('Raw message sent.');
        } catch (error) {
            this.error('Invalid JSON: ' + error.message);
        }
    }

    cmdAuto(args) {
        const scenario = args[0] || 'basic';
        this.runAutoTest(scenario);
    }

    // WebSocket Connection
    connect(username, avatar) {
        this.info('Connecting to ws://localhost:8080...');

        try {
            this.ws = new WebSocket('ws://localhost:8080');

            this.ws.on('open', () => {
                this.isConnected = true;
                this.success('Connected to server!');

                // Authenticate
                this.send({
                    type: 'auth',
                    name: username,
                    avatar: avatar
                });
            });

            this.ws.on('message', (data) => {
                const message = JSON.parse(data);
                this.handleMessage(message);
            });

            this.ws.on('close', () => {
                this.isConnected = false;
                this.warning('Disconnected from server.');
                this.resetState();
            });

            this.ws.on('error', (error) => {
                this.error('Connection error: ' + error.message);
            });

        } catch (error) {
            this.error('Failed to connect: ' + error.message);
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        this.resetState();
        this.info('Disconnected.');
    }

    send(message) {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify(message));
        }
    }

    resetState() {
        this.user = null;
        this.currentRoom = null;
        this.rooms = [];
        this.roomUsers = [];
    }

    // Message Handling
    handleMessage(message) {
        switch (message.type) {
            case 'welcome':
                this.rooms = message.rooms;
                break;

            case 'auth-success':
                this.user = message.user;
                this.rooms = message.rooms;
                this.success(`Authenticated as ${this.user.name} ${this.user.avatar}`);
                break;

            case 'joined-room':
                this.currentRoom = message.room;
                this.roomUsers = message.users;
                this.success(`Joined room: ${message.room.name}`);
                break;

            case 'left-room':
                if (this.currentRoom?.id === message.roomId) {
                    this.info(`Left room: ${this.currentRoom.name}`);
                    this.currentRoom = null;
                    this.roomUsers = [];
                }
                break;

            case 'user-joined':
                if (this.currentRoom?.id === message.roomId) {
                    this.roomUsers.push(message.user);
                    this.info(`${message.user.avatar} ${message.user.name} joined the room`);
                }
                break;

            case 'user-left':
                if (this.currentRoom?.id === message.roomId) {
                    this.roomUsers = this.roomUsers.filter(u => u.id !== message.user.id);
                    this.info(`${message.user.avatar} ${message.user.name} left the room`);
                }
                break;

            case 'chat-message':
                if (this.currentRoom?.id === message.roomId) {
                    const time = new Date(message.timestamp).toLocaleTimeString();
                    console.log(`\n💬 [${time}] ${message.user.avatar} ${message.user.name}: ${message.text}`);
                }
                break;

            case 'game-state':
                this.handleGameState(message);
                break;

            case 'game-started':
                if (this.currentRoom?.id === message.roomId) {
                    this.success('🎮 Game started!');
                }
                break;

            case 'room-created':
                this.rooms.push(message.room);
                this.success(`Room created: ${message.room.name}`);
                break;

            case 'announcement':
                this.announcement(`📢 ${message.message}`);
                break;

            case 'error':
                this.error(`Server error: ${message.message}`);
                break;

            case 'kicked':
                this.error(`❌ Kicked: ${message.reason}`);
                setTimeout(() => this.disconnect(), 1000);
                break;

            default:
                this.debug(`Unknown message type: ${message.type}`);
        }

        this.rl.prompt();
    }

    handleGameState(message) {
        if (this.currentRoom?.id === message.roomId) {
            const gameState = message.gameState;
            let statusText = `🎮 Game Status: ${gameState.status}`;

            if (gameState.turn) {
                const turnUser = gameState.players.find(p => p.userId === gameState.turn);
                if (turnUser) {
                    statusText += ` - ${turnUser.user.name}'s turn`;
                }
            }

            this.info(statusText);
        }
    }

    // Auto Testing
    async runAutoTest(scenario) {
        this.info(`🤖 Running automated test: ${scenario}`);

        switch (scenario) {
            case 'basic':
                await this.runBasicTest();
                break;
            case 'chat':
                await this.runChatTest();
                break;
            case 'game':
                await this.runGameTest();
                break;
            default:
                this.error('Unknown scenario. Available: basic, chat, game');
        }
    }

    async runBasicTest() {
        const steps = [
            () => this.handleCommand('status'),
            () => this.handleCommand('connect TestBot'),
            () => this.sleep(1000),
            () => this.handleCommand('rooms'),
            () => this.handleCommand('join lobby'),
            () => this.sleep(500),
            () => this.handleCommand('users'),
            () => this.handleCommand('say Hello from automated test!'),
            () => this.sleep(1000),
            () => this.handleCommand('leave'),
            () => this.handleCommand('disconnect')
        ];

        for (const step of steps) {
            await step();
        }

        this.success('✅ Basic test completed!');
    }

    async runChatTest() {
        this.info('Starting chat test...');
        // Add chat-specific test logic here
    }

    async runGameTest() {
        this.info('Starting game test...');
        // Add game-specific test logic here
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Output Utilities
    info(message) {
        console.log(`\n ℹ️  ${message}`);
    }

    success(message) {
        console.log(`\n ✅ ${message}`);
    }

    warning(message) {
        console.log(`\n ⚠️  ${message}`);
    }

    error(message) {
        console.log(`\n ❌ ${message}`);
    }

    announcement(message) {
        console.log(`\n 📢 ${message}`);
    }

    debug(message) {
        console.log(`\n 🐛 ${message}`);
    }
}

// Main execution
if (require.main === module) {
    const client = new CLIClient();
    client.start();
}

module.exports = { CLIClient };
