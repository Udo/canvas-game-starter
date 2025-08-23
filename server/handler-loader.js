const fs = require('fs');
const path = require('path');

class HandlerLoader {
	constructor(handlersDir, logPrefix = '📎') {
		this.handlersDir = handlersDir;
		this.logPrefix = logPrefix;
		this.handlers = new Map();
		this.fileCache = new Map(); // Cache for file contents and metadata
		this.watchedFiles = new Map(); // File watchers for hot reloading
		this.preloadHandlers();
	}

	preloadHandlers() {
        const files = fs.readdirSync(this.handlersDir);
        const jsFiles = files.filter(file => file.endsWith('.js'));
        
        for (const file of jsFiles) {
            const handlerName = path.basename(file, '.js');
            this.get(handlerName);
        }
        
	}

	get(handlerName) {
		if (this.handlers.has(handlerName)) {
			return this.handlers.get(handlerName);
		}
		
		const handlerPath = path.join(this.handlersDir, `${handlerName}.js`);
		
		if (fs.existsSync(handlerPath)) {
            delete require.cache[require.resolve(handlerPath)];
            const handler = require(handlerPath);
            const stats = fs.statSync(handlerPath);
            this.handlers.set(handlerName, handler);
            this.fileCache.set(handlerName, {
                path: handlerPath,
                mtime: stats.mtime,
                size: stats.size,
                loaded: true,
                handler: handler
            });
            return handler;
		}
		
		this.logHandlerNotFound(handlerName);
		return null;
	}

	logHandlerNotFound(handlerName) {
		console.error(`❌ HANDLER NOT FOUND: ${handlerName}`);
		console.error(`   Searched in directory: ${this.handlersDir}`);
		console.error(`   Expected file: ${path.join(this.handlersDir, handlerName + '.js')}`);
	}

	hasHandler(handlerName) {
		return this.handlers.has(handlerName) || fs.existsSync(path.join(this.handlersDir, `${handlerName}.js`));
	}

	getAvailableHandlers() {
		const loadedHandlers = Array.from(this.handlers.keys());
		const allFiles = fs.existsSync(this.handlersDir) ? 
			fs.readdirSync(this.handlersDir)
				.filter(file => file.endsWith('.js'))
				.map(file => path.basename(file, '.js')) : [];
		
		return [...new Set([...loadedHandlers, ...allFiles])];
	}

	reloadHandlers() {
		this.handlers.clear();
		this.fileCache.clear();
		this.preloadHandlers();
	}

	reloadHandler(handlerName) {
		const handlerPath = path.join(this.handlersDir, `${handlerName}.js`);
        if (!fs.existsSync(handlerPath)) {
            console.error(`❌ Handler file not found: ${handlerPath}`);
            return false;
        }
        
        this.handlers.delete(handlerName);
        this.fileCache.delete(handlerName);
        
        const handler = this.get(handlerName);
        
        if (handler) {
            console.log(`${this.logPrefix} Reloaded handler: ${handlerName}`);
            return true;
        } else {
            return false;
        }
	}

	getFileInfo(handlerName) {
		return this.fileCache.get(handlerName);
	}

	isFileModified(handlerName) {
		const fileInfo = this.fileCache.get(handlerName);
		if (!fileInfo) return false;
        const stats = fs.statSync(fileInfo.path);
        return stats.mtime > fileInfo.mtime;

	}

	checkForModifications() {
		const modified = [];
		
		for (const [handlerName] of this.fileCache) {
			if (this.isFileModified(handlerName)) {
				modified.push(handlerName);
			}
		}
		
		if (modified.length > 0) {
			console.log(`${this.logPrefix} Detected modifications: ${modified.join(', ')}`);
			for (const handlerName of modified) {
				this.reloadHandler(handlerName);
			}
		}
		
		return modified;
	}

}

module.exports = { HandlerLoader };
