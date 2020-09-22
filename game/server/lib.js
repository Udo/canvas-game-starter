var fs = require('fs');

const { exec } = require("child_process");

function shell_escape(cmd) {
  return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
};
exports.shell_escape = shell_escape;

function shell_exec(cmd) {
	exec(cmd, (error, stdout, stderr) => {
		if (error) {
			console.log(`! error: ${error.message}`);
			return;
		}
		if (stderr) {
			console.log(`! stderr: ${stderr}`);
			return;
		}
		console.log(`i stdout: ${stdout}`);
	});
}
exports.shell_exec = shell_exec;

var crypto = require('crypto');
function hash(s) {
	return(crypto.pbkdf2Sync(s, 'jsdf8345jkt89dfujnklw4', 32, 32, `sha512`).toString(`base64`));
}
exports.hash = hash;

function safe_string(s) {
	return(s.replace(/[^a-z0-9]/gi,'').toLowerCase());
}
exports.safe_string = safe_string;

function each(o, f) {
  if(!o)
    return;
  if(o.forEach) {
    o.forEach(f);
  } else {
    for(var prop in o) if(o.hasOwnProperty(prop)) {
      f(o[prop], prop); 
    }
  }
}
exports.each = each;

function json(o) {
	return(JSON.stringify(o));
}
exports.json = json;

function nv_parse_path(n) {
	var path = n.split('/');
	var f = path.pop();
	return({
		dir : "data/"+path.join('/'),
		file : f+".json",
	});
}
exports.nv_parse_path = nv_parse_path;

function nv_set(n, v, sync = false) {
	var path = nv_parse_path(n);
	v._n = n;
	fs.mkdirSync(path.dir, { recursive: true });
	if(sync) {
		fs.writeFileSync(path.dir+"/"+path.file, JSON.stringify(v));
		return;
	}
	fs.writeFile(path.dir+"/"+path.file, JSON.stringify(v), function(err) {
		if(err) {
			return console.log('! Error writing file', profile_dir+"/"+n+".json", err);
		}
	}); 
}
exports.nv_set = nv_set;

function nv_delete(n, v) {
	var path = nv_parse_path(n);
	fs.writeFile(path.dir+"/"+path.file, '', function(err) {
		if(err) {
			return console.log('! Error writing file', profile_dir+"/"+n+".json", err);
		}
	});
}
exports.nv_delete = nv_delete;


function nv_get(n) {
	var path = nv_parse_path(n);
	try {
		var data = JSON.parse(fs.readFileSync(path.dir+"/"+path.file, 'utf8'));
		data._n = n;
		return(data);
	} catch(e) {
		return({});
	}
}
exports.nv_get = nv_get;

function call_tree(call_name, tree, message, connection, broker) {
	var enable = true;
	var segments = call_name.toLowerCase().split('.');
	while(segments.length > 0) {
		var sname = segments.shift();
		if(tree._common) enable = tree._common(message, connection, broker);
		tree = tree[sname];
		if(!tree) {
			console.log('! message handler not found: ', sname, 'in', call_name);
			if(call_name != 'disconnect') 
				connection.send({ type : 'error', text : 'message handler not found', call : call_name+'->'+sname});
			return;
		}
	}
	if(!enable) {
		console.log('! message handler cancelled by _common: ', typeof tree, 'in', call_name);
		return;
	}
	if(typeof tree == 'function') {
		return(tree(message, connection, broker));
	} else {
		console.log('! message handler not callable: ', typeof tree, 'in', call_name);
		if(call_name != 'disconnect') 
			connection.send({ type : 'error', text : 'message handler not callable', call : call_name, t : typeof tree});
		return;
	}
}
exports.call_tree = call_tree;

function clone(o) {
	try {
		return(JSON.parse(JSON.stringify(o)));
	} catch(ee) {
		console.log('! cannot clone structure', 0);
		return({});
	}
}
exports.clone = clone;
