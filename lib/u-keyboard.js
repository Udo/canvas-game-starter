(function (root, factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else {
		root.Keyboard = factory();
	}
}(typeof self !== 'undefined' ? self : this, function () {

let Keyboard = {

    listen : () => {
        document.addEventListener('keydown', Keyboard.onKeyDown);
        document.addEventListener('keyup', Keyboard.onKeyUp);
    },

    stop : () => {
        document.removeEventListener('keydown', Keyboard.onKeyDown);
        document.removeEventListener('keyup', Keyboard.onKeyUp);
    },

    onKeyDown : (event) => {
        if (!Keyboard.keys[event.key]) {
            Keyboard.keys[event.key] = true;
            Keyboard.keys['K' + event.keyCode] = true;
            let kb = Keyboard.keybindings[event.key];
            if(kb && !Keyboard.keys[kb + '']) {
                Keyboard.keys[kb + ''] = true;
                Keyboard.events.emit(kb+':start', event);
            }
            Keyboard.events.emit('keydown', event.key, event);
            Keyboard.events.emit(event.key+'_down', event);
        }
    },

    onKeyUp : (event) => {
        if (Keyboard.keys[event.key]) {
            Keyboard.keys[event.key] = false;
            Keyboard.keys['K' + event.keyCode] = false;
            let kb = Keyboard.keybindings[event.key];
            if(kb && Keyboard.keys[kb + '']) {
                Keyboard.keys[kb + ''] = false;
                Keyboard.events.emit(kb+':end', event);
            }
            Keyboard.events.emit('keyup', event.key, event);
            Keyboard.events.emit(event.key+'_up', event);
        }
    },

    isKeyDown : (key_or_keys) => {
        if (!Array.isArray(key_or_keys)) key_or_keys = [key_or_keys];
        return key_or_keys.some(k => Keyboard.keys[k]);
    },

    on : (key_or_keys, handler) => {
        if (!Array.isArray(key_or_keys)) key_or_keys = [key_or_keys];
        for (let key of key_or_keys) {
            Keyboard.events.on(key + '_down', handler);
            Keyboard.events.on(key + '_up', handler);
        }
        return () => Keyboard.off(key_or_keys, handler);
    },

    off : (key_or_keys, handler) => {
        if (!Array.isArray(key_or_keys)) key_or_keys = [key_or_keys];
        for (let key of key_or_keys) {
            Keyboard.events.off(key + '_down', handler);
            Keyboard.events.off(key + '_up', handler);
        }
    },

    events : new EventEmitter(),

    keybindings_default : { // map keys to action names
        'ArrowLeft': 'move_left',
        'a': 'move_left',
        'A': 'move_left',

        'ArrowRight': 'move_right',
        'd': 'move_right',
        'D': 'move_right',

        'ArrowUp': 'jump',
        'w': 'jump',
        'W': 'jump',
        
        'ArrowDown': 'crouch',
        's': 'crouch',
        'S': 'crouch',

        'Enter': 'submit',
        'Escape': 'cancel',
    },

    keybindings : {},

    keys : {},

};

return Keyboard;

}));
