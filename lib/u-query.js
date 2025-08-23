(function (root, factory) {
    // this is the stupid UMD pattern, but eh we lost that battle a long time ago
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		var exports_obj = factory();
		module.exports = exports_obj.$;
		// Also export individual components
		for (var key in exports_obj) {
			if (key !== '$' && exports_obj.hasOwnProperty(key)) {
				exports[key] = exports_obj[key];
			}
		}
	} else if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else {
		var exports_obj = factory();
		root.$ = exports_obj.$;
		for (var key in exports_obj) {
			if (key !== '$' && exports_obj.hasOwnProperty(key)) {
				root[key] = exports_obj[key];
			}
		}
	}
}(typeof self !== 'undefined' ? self : this, function () {

// a collection of DOM utility functions that I thought were cool in jQuery

class EventEmitter {
	constructor() {
		/** Map<eventName, Map<slotKey|Symbol, Function>> */
		this._topics = new Map();
	}

	/**
	 * Subscribe to `topic`. If `slot_key` is provided (truthy),
	 * it dedupes by that key; otherwise a unique Symbol is used.
	 * Returns an unsubscribe fn.
	 */
	on(topic, handler, slot_key = null) {
		let map = this._topics.get(topic);
		if (!map) {
			map = new Map();
			this._topics.set(topic, map);
		}
		// use the provided slot_key or a fresh Symbol()
		const key = slot_key != null ? slot_key : Symbol();
		map.set(key, handler);
		return () => this.off(topic, key);
	}

	/**
	 * Unsubscribe by handler function or by slot_key.
	 */
	off(topic, handlerOrSlotKey) {
		const map = this._topics.get(topic);
		if (!map) return;

		// if it matches a slotKey directly, remove it
		if (map.has(handlerOrSlotKey)) {
			map.delete(handlerOrSlotKey);
		} else {
			// otherwise assume it's a function: remove all matching fns
			for (const [key, fn] of map.entries()) {
				if (fn === handlerOrSlotKey) {
					map.delete(key);
				}
			}
		}

		if (map.size === 0) {
			this._topics.delete(topic);
		}
	}

	/**
	 * Emit to all handlers on `topic`. Handlers returning
	 * 'remove_handler' are auto-removed.
	 * Returns the number of handlers invoked.
	 */
	emit(topic, ...args) {
		let count = 0;
		const map = this._topics.get(topic);
		if (!map) return count;

		for (const [key, fn] of Array.from(map.entries())) {
			const res = fn(...args);
			count++;
			if (res === 'remove_handler') {
				map.delete(key);
			}
		}

		if (map.size === 0) {
			this._topics.delete(topic);
		}
		return count;
	}
}

class QueryWrapper extends Array {
    constructor(elements) {
        super();
        if (elements) {
            this.push(...(Array.isArray(elements) ? elements : [elements]));
        }
    }
}

$ = function(selector_or_element) {
    let elements;
    if (selector_or_element instanceof Element) {
        elements = [selector_or_element];
    } else if (typeof selector_or_element === 'string') {
        elements = Array.from(document.querySelectorAll(selector_or_element));
    } else if (selector_or_element instanceof NodeList || Array.isArray(selector_or_element)) {
        elements = Array.from(selector_or_element);
    } else {
        elements = [selector_or_element];
    }
    return new QueryWrapper(elements);
};

$.options = {
    alwaysDoDifferentialUpdate: false,
};

$.events = new EventEmitter();
$.on = $.events.on.bind($.events);
$.off = $.events.off.bind($.events);
$.emit = $.events.emit.bind($.events);

$.each = function(selector, callback) {
    let elements;
    if (typeof selector === 'string') {
        elements = document.querySelectorAll(selector);
    } else if (selector instanceof QueryWrapper) {
        elements = selector;
    } else {
        elements = selector;
    }
    for (let i = 0; i < elements.length; i++) {
        callback(elements[i], i);
    }
}

$.post = function(url, data, callback) {
    return $.ajax({
        method: 'POST',
        url: url,
        data: data,
        success: callback,
        error: function(xhr) {
            console.error('POST request failed:', xhr);
        }
    });
}

$.get = function(url, callback) {
    return $.ajax({
        method: 'GET',
        url: url,
        success: callback,
        error: function(xhr) {
            console.error('GET request failed:', xhr);
        }
    });
}

$.ajax = function(options) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', options.url, true);
        
        // Set default headers
        if (options.method === 'POST' || options.data) {
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        }
        
        // Set custom headers
        if (options.headers) {
            for (var key in options.headers) {
                xhr.setRequestHeader(key, options.headers[key]);
            }
        }
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var response;
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (e) {
                    // If JSON parsing fails, use raw response
                    response = xhr.responseText;
                }
                
                if (xhr.status >= 200 && xhr.status < 300) {
                    if (options.success) options.success(response);
                    resolve(response);
                } else {
                    if (options.error) options.error(xhr);
                    reject(xhr);
                }
            }
        };
        
        var data = null;
        if (options.data) {
            data = typeof options.data === 'string' ? options.data : JSON.stringify(options.data);
        }
        
        xhr.send(data);
    });
}

$.ready = function(callback) {
    if (document.readyState !== 'loading') {
        callback();
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
}

// Helper function to execute scripts in HTML content
function executeScripts(htmlContent) {
    // Create a temporary container to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Find all script tags and disable them temporarily
    const scripts = tempDiv.querySelectorAll('script');
    const scriptData = [];
    
    scripts.forEach((script) => {
        // Store script data for later execution
        scriptData.push({
            content: script.textContent || script.innerText || '',
            src: script.src,
            type: script.type,
            nonce: script.nonce,
            async: script.async,
            defer: script.defer
        });
        
        // Disable the script by changing its type
        script.type = 'text/disabled-script';
    });
    
    // Return the modified HTML and script data
    return {
        html: tempDiv.innerHTML,
        scripts: scriptData
    };
}

// Helper function to execute a single script
function executeScript(scriptInfo) {
    if (scriptInfo.src) {
        // External script
        const newScript = document.createElement('script');
        if (scriptInfo.type && scriptInfo.type !== 'text/disabled-script') {
            newScript.type = scriptInfo.type;
        }
        if (scriptInfo.nonce) newScript.nonce = scriptInfo.nonce;
        if (scriptInfo.async) newScript.async = scriptInfo.async;
        if (scriptInfo.defer) newScript.defer = scriptInfo.defer;
        newScript.src = scriptInfo.src;
        
        document.head.appendChild(newScript);
    } else if (scriptInfo.content.trim()) {
        // Inline script
        const newScript = document.createElement('script');
        if (scriptInfo.type && scriptInfo.type !== 'text/disabled-script') {
            newScript.type = scriptInfo.type;
        }
        if (scriptInfo.nonce) newScript.nonce = scriptInfo.nonce;
        newScript.text = scriptInfo.content;
        
        // Execute by inserting and immediately removing
        document.head.appendChild(newScript);
        document.head.removeChild(newScript);
    }
}

// Add all the jQuery-like methods to QueryWrapper
QueryWrapper.prototype.parent = function() {
    const parents = Array.from(this).map(el => el.parentNode).filter(el => el);
    return new QueryWrapper(parents);
}

QueryWrapper.prototype.load = function(url, opt = {}) {
    return new Promise((resolve, reject) => {
        const ajaxOptions = {
            method: opt.method || (opt.postData ? 'POST' : 'GET'),
            url: url,
            success: (response) => {
                if(opt.replace)
                    this.replaceWith(response);
                else
                    this.html(response);
                if (opt.onLoad) opt.onLoad(response, null);
                resolve(this);
            },
            error: (xhr) => {
                if (opt.onError) opt.onError(xhr);
                reject(new Error('Failed to load: ' + url));
            }
        };

        if (opt.postData) {
            ajaxOptions.data = opt.postData;
        }

        $.ajax(ajaxOptions);
    });
}

QueryWrapper.prototype.html = function(opt_content = false, use_diff = undefined) {
    if (opt_content === false) {
        return Array.from(this).map(el => el.innerHTML).join('');
    }
    if($.options.alwaysDoDifferentialUpdate && (typeof use_diff == "undefined" || use_diff)) {
        const temp = document.createElement('div');
        temp.innerHTML = opt_content;
        this.forEach(el => {
            morphdom(el, temp, { childrenOnly: true });
        });
    } else {
        this.forEach(el => {
            const result = executeScripts(opt_content);
            el.innerHTML = result.html;
            result.scripts.forEach(executeScript);
        });
    }
    return this;
}

QueryWrapper.prototype.text = function(opt_content = false) {
    if (opt_content === false) {
        return Array.from(this).map(el => el.textContent).join('');
    }
    this.forEach(el => {
        el.textContent = opt_content;
    });
    return this;
}

QueryWrapper.prototype.replaceWith = function(content, use_diff = undefined) {
    if($.options.alwaysDoDifferentialUpdate || (use_diff !== undefined && use_diff)) {
        this.forEach(el => {
            morphdom(el, content);
        });
    } else {
        if(typeof content === 'string') {
            this.forEach(el => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = content;
                el.parentNode.replaceChild(tempDiv.firstChild, el);
            });
        } else if(content instanceof Element) {
            this.forEach(el => {
                el.parentNode.replaceChild(content.cloneNode(true), el);
            });
        }
    }
    return this;
}

QueryWrapper.prototype.query = function(selector) {
    const found = Array.from(this).reduce((acc, el) => {
        const results = el.querySelectorAll(selector);
        return acc.concat(Array.from(results));
    }, []);
    return new QueryWrapper(found);
}

QueryWrapper.prototype.on = function(event, handler) {
    this.forEach(function(el) {
        el.addEventListener(event, handler);
    });
    return this;
}

QueryWrapper.prototype.off = function(event, handler) {
    this.forEach(function(el) {
        el.removeEventListener(event, handler);
    });
    return this;
}

QueryWrapper.prototype.hide = function() {
    return this.css({ display: 'none' });
}

QueryWrapper.prototype.show = function() {
    return this.css({ display: ''  });
}

QueryWrapper.prototype.toggle = function() {
    this.forEach(function(el) {
        el.style.display = (el.style.display === 'none' || el.style.display === '') ? '' : 'none';
    });
    return this;
}

QueryWrapper.prototype.attr = function(name, value) {
    if (value === undefined) {
        return this.length > 0 ? this[0].getAttribute(name) : null;
    }
    this.forEach(function(el) {
        el.setAttribute(name, value);
    });
    return this;
}

QueryWrapper.prototype.addClass = function(classNameOrList) {
    var classList = Array.isArray(classNameOrList) ? classNameOrList : [classNameOrList];
    this.forEach(function(el) {
        classList.forEach(function(className) {
            el.classList.add(className);
        });
    });
    return this;
}

QueryWrapper.prototype.removeClass = function(classNameOrList) {
    var classList = Array.isArray(classNameOrList) ? classNameOrList : [classNameOrList];
    this.forEach(function(el) {
        classList.forEach(function(className) {
            el.classList.remove(className);
        });
    });
    return this;
}

QueryWrapper.prototype.css = function(styles, optOrValue = false) {
    this.forEach(function(el) {
        if(optOrValue !== false) {
            el.style[styles] = optOrValue;
            return;
        } else for (var key in styles) {
            el.style[key] = styles[key];
        }
    });
    return this;
}

QueryWrapper.prototype.each = function(callback) {
    this.forEach(function(el, index) {
        callback(el, index);
    });
    return this;
}

QueryWrapper.prototype.append = function(child_or_html) {
    this.forEach(function(el) {
        if (typeof child_or_html === 'string' && el.insertAdjacentHTML) {
            if (child_or_html.includes('<script')) {
                const result = executeScripts(child_or_html);
                el.insertAdjacentHTML('beforeend', result.html);
                result.scripts.forEach(executeScript);
            } else {
                el.insertAdjacentHTML('beforeend', child_or_html);
            }
        } else if (el.appendChild) {
            if (typeof child_or_html === 'string') {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = child_or_html;
                el.appendChild(tempDiv.firstChild);
            } else {
                el.appendChild(child_or_html);
            }
        } else if(el.hasOwnProperty('innerHTML')) {
            el.innerHTML += child_or_html;
        }
    });
    return this;
}

QueryWrapper.prototype.remove = function() {
    this.forEach(function(el) {
        el.parentNode.removeChild(el);
    });
    return this;
}

function first(...args) {
    for (const arg of args) {
        if (arg !== undefined && arg !== null && arg !== '') {
            return arg;
        }
    }
    return null;
}

function clamp(v, min, max) {
    if (v < min) return min;
    if (v > max) return max;
    return v;
}

function pick_entry_from_range(array, value) {
    if (!array) return {};
    let result = {};
    for (const [pv] of Object.entries(array)) {
        if (value >= pv.from && value <= pv.to) result = pv;
    }
    return result;
}

return {
	$: $,
	EventEmitter: EventEmitter,
	QueryWrapper: QueryWrapper,
	first: first,
	clamp: clamp,
	pick_entry_from_range: pick_entry_from_range
};

}));