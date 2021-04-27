Macrobars = (() => {

if(!String.prototype.replaceAll) String.prototype.replaceAll = function(search, replacement) {
		var target = this;
		return target.split(search).join(replacement);
};

var safe_out = (s) => { if(typeof s == 'undefined') s = ''; return((''+s).replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')); };

var num_out = (n, decimals = 2) => {
	if(typeof n == 'undefined' || n === false) n = 0;
	if(decimals == 0) return(Math.round(n));
	return(n.toFixed(decimals));
}

var num_out_round = (n) => {
	if(typeof n == 'undefined' || n === false) n = 0;
	if(n > 999999) n = (n/1000000).toFixed(1) + 'M';
	if(n > 999) n = (n/1000).toFixed(1) + 'k';
	else n = Math.round(n);
	return(n);
}

var debug_out = (ee) => {
	var es = ee.stack.split("\n");
	var loc = es[1];
	var p0 = loc.indexOf('<anonymous>');
	if(p0 != -1) {
		loc = loc.substr(p0+('<anonymous>'.length+1));
		loc = loc.substr(0, loc.length-1);
	}
	return('Macrobars '+es[0]+' ('+loc+')');
}

var signposts = [
	{ start : '<script>', end : '</script>', type : 'code' },
	{ start : '<defer>', end : '</defer>', type : 'defer' },
	{ start : '<?=', end : '?>', type : 'field' },
	{ start : '<?:', end : '?>', type : 'var_out' },
	{ start : '<?', end : '?>', type : 'code' },
	{ start : '<!--?', end : '?-->', type : 'code' },
	{ start : '{{#default ', end : '}}', type : 'default_empty' },
	{ start : '{{{', end : '}}}', type : 'field_unsafe' },
	{ start : '{{%', end : '}}', type : 'field_number' },
	{ start : '{{~', end : '}}', type : 'field_number_round' },
	{ start : '{{#each ', end : '}}', type : 'each_start' },
	{ start : '{{/', end : '}}', type : 'each_end' },
	{ start : '{{', end : '}}', type : 'field' },
];

if(!each) function each(o, f) {
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

var data_prefix = (identifier) => {
	if(identifier.substr(0, 1) == ':')
		return(identifier.substr(1));
	else
		return('data.'+identifier);
}

var compile = function(text, options = {}) {

	var crash_counter = 0;
	var tokens = [];
	var gensource = [];

	var emit = {
		text : (token) => {
			gensource.push('output += '+JSON.stringify(token.text)+';');
		},
		code : (token) => {
			gensource.push(token.text);
		},
		defer : (token) => {
			gensource.push('output += "<script>\n" + '+JSON.stringify(token.text)+' + "</script>\n";');
		},
		var_out : (token) => {
			gensource.push('output += safe_out('+(token.text)+', default_empty_field);');
		},
		field : (token) => {
			gensource.push('output += safe_out('+data_prefix(token.text)+', default_empty_field);');
		},
		field_unsafe : (token) => {
			gensource.push('output += ('+data_prefix(token.text)+' || default_empty_field);');
		},
		field_number : (token) => {
			gensource.push('output += num_out('+data_prefix(token.text)+', this.decimals);');
		},
		field_number_round : (token) => {
			gensource.push('output += num_out_round('+data_prefix(token.text)+');');
		},
		each_start : (token) => {
			gensource.push('each('+data_prefix(token.text)+', (data, index) => {');
		},
		each_end : (token) => {
			gensource.push('}); /* each end */');
		},
		default_empty : (token) => {
			gensource.push('default_empty_field = '+JSON.stringify(token.text)+';');
		},
	}

	while(text != '' && crash_counter < 100) {

		crash_counter+=1;
		var p0 = -1;
		var sp_found = false;
		signposts.forEach((sp) => {
			var ps = text.indexOf(sp.start);
			if(ps != -1 && (p0 == -1 || p0 > ps)) {
				sp_found = sp;
				p0 = ps;
			}
		});

		if(sp_found)
		{
			tokens.push({ type : 'text', text : text.substr(0, p0) });
			text = text.substr(p0 + sp_found.start.length);
			var p1 = text.indexOf(sp_found.end);
			if(p1 == -1) p1 = text.length;
			tokens.push({ type : sp_found.type, text : text.substr(0, p1)});
			text = text.substr(p1+sp_found.end.length);
		}
		else
		{
			tokens.push({ type : 'text', text : text });
			text = '';
		}

	}

	if(typeof options.decimals == 'undefined')
		options.decimals = 2;
	this.decimals = options.decimals;

	gensource.push('(data) => { ');
	if(options.strict)
		gensource.push('"use strict";');
	gensource.push('	try {');
	gensource.push('	if(!data) data = {}; var data_root = data;');
	gensource.push('	var output = ""; var default_empty_field = "";');
	gensource.push('	var echo = (s) => { output += s; };');
	each(options, (v, k) => {
		gensource.push('	var '+k+' = '+options[k]+';');
	});
	tokens.forEach((tok) => {
		emit[tok.type](tok);
	});
	gensource.push('	} catch (ee) { console.error(ee); output += debug_out(ee); }');
	gensource.push('	return(output);');
	gensource.push('}');

	var f = {};
	try {
		f = eval('('+gensource.join("\n")+')');
	} catch(ce) {
		console.error(ce);
	}

	f.tokens = tokens;
	f.gensource = gensource;

	return(f);
}

return({

	compile : compile,

	num_out : num_out,
	safe_out : safe_out,
	num_out_round : num_out_round,
	debug_out : debug_out,
	each : each,

});

})();
