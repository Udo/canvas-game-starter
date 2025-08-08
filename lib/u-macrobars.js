(function (root, factory) { // I really hate this convoluted bullshit
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else {
		root.Macrobars = factory();
	}
}(typeof self !== 'undefined' ? self : this, function () {

	if(!String.prototype.replaceAll) String.prototype.replaceAll = function(search, replacement) {
			var target = this;
			return target.split(search).join(replacement);
	};

	var safe_out = (s, defaultValue = '') => { 
		if(typeof s == 'undefined' || s === null || s === false || s === '') s = defaultValue; 
		return((''+s).replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')); 
	};

	var num_out = (n, decimals = 2) => {
		if(typeof n == 'undefined' || n === false) n = 0;
		if(decimals == 0) return(Math.round(n));
		return(n.toFixed(decimals));
	}

	var num_out_round = (n) => {
		if(typeof n == 'undefined' || n === false || n === null) n = 0;
		
		if(typeof n === 'string') {
			n = parseFloat(n);
			if(isNaN(n)) return '0';
		}
		
		if(Math.abs(n) >= 1e15) {
			return n.toExponential(2);
		}
		
		if(Math.abs(n) > 0 && Math.abs(n) < 0.001) {
			return n.toExponential(2);
		}
		
		if(Math.abs(n) >= 1e12) {
			return (n/1e12).toFixed(1) + 'T';
		} else if(Math.abs(n) >= 1e9) {
			return (n/1e9).toFixed(1) + 'B';
		} else if(Math.abs(n) >= 1e6) {
			return (n/1e6).toFixed(1) + 'M';
		} else if(Math.abs(n) >= 1e3) {
			return (n/1e3).toFixed(1) + 'k';
		} else if(Math.abs(n) >= 1) {
			return Math.round(n);
		} else if(Math.abs(n) >= 0.01) {
			return n.toFixed(2);
		} else if(Math.abs(n) >= 0.001) {
			return n.toFixed(3);
		} else if(n === 0) {
			return 0;
		}
		
		return n.toString();
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

		{ start : '{{:', end : '}}', type : 'var_out' },
		{ start : '{{#eq ', end : '}}', type : 'eq_block_start' },
		{ start : '{{#lookup ', end : '}}', type : 'lookup_block_start' },
		{ start : '{{eq ', end : '}}', type : 'eq_inline' },
		{ start : '{{lookup ', end : '}}', type : 'lookup_inline' },
		{ start : '{{#default ', end : '}}', type : 'default_empty' },
		{ start : '{{#if ', end : '}}', type : 'if_start' },
		{ start : '{{#else}}', end : '', type : 'else' },
		{ start : '{{#component ', end : '}}', type : 'component' },
		{ start : '{{#each ', end : '}}', type : 'each_start' },
		{ start : '{{/each}}', end : '', type : 'each_end' },
		{ start : '{{/if}}', end : '', type : 'if_end' },
		{ start : '{{/eq}}', end : '', type : 'eq_block_end' },
		{ start : '{{/lookup}}', end : '', type : 'lookup_block_end' },
		{ start : '{{/', end : '}}', type : 'block_end' },
		{ start : '{{@', end : '}}', type : 'event_bind' },
		{ start : '{{{', end : '}}}', type : 'field_unsafe' },
		{ start : '{{%', end : '}}', type : 'field_number' },
		{ start : '{{~', end : '}}', type : 'field_number_round' },
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

	var parse_field_with_default = (fieldText) => {
		var orMatch = fieldText.match(/^(.+?)\s+or\s+(['"])(.*?)\2$/);
		if (orMatch) {
			return {
				field: orMatch[1].trim(),
				default: orMatch[3]
			};
		}
		return {
			field: fieldText.trim(),
			default: null
		};
	}

	var compile = function(text, options = {}) {

		var crash_counter = 0;
		var tokens = [];
		var gensource = [];
		var event_bindings = []; 
		var components = options.components || {}; 
		var condition_stack = []; 

		var emit = {
			text : (token) => {
				gensource.push('output += '+JSON.stringify(token.text)+';');
			},
			code : (token) => {
				gensource.push(token.text);
			},
			defer : (token) => {
				gensource.push('output += "<script>" + '+JSON.stringify(token.text)+' + "</script>";');
			},
			var_out : (token) => {
				var defaultVal = token.default ? JSON.stringify(token.default) : 'default_empty_field';
				gensource.push('output += safe_out('+(token.text)+', '+defaultVal+');');
			},
			field : (token) => {
				var defaultVal = token.default ? JSON.stringify(token.default) : 'default_empty_field';
				gensource.push('output += safe_out('+data_prefix(token.text)+', '+defaultVal+');');
			},
			field_unsafe : (token) => {
				if (token.default) {
					gensource.push('output += ('+data_prefix(token.text)+' || '+JSON.stringify(token.default)+');');
				} else {
					gensource.push('output += ('+data_prefix(token.text)+' || default_empty_field);');
				}
			},
			field_number : (token) => {
				gensource.push('output += num_out('+data_prefix(token.text)+', this.decimals);');
			},
			field_number_round : (token) => {
				gensource.push('output += num_out_round('+data_prefix(token.text)+');');
			},
			each_start : (token) => {
				var parts = token.text.split(' as ');
				var collection = parts[0].trim();
				var itemName = parts.length > 1 ? parts[1].trim() : 'data';
				
				gensource.push('each('+data_prefix(collection)+', ('+itemName+', index) => {');

			},
			if_start : (token) => {
				condition_stack.push('if');
				gensource.push('if ('+data_prefix(token.text)+') {');
			},
			else : (token) => {
				gensource.push('} else {');
			},
			if_end : (token) => {
				condition_stack.pop();
				gensource.push('} /* if end */');
			},
			each_end : (token) => {
				gensource.push('}); /* each end */');
			},
			block_end : (token) => {
				var block_type = condition_stack.pop();
				gensource.push('}); /* '+(block_type || 'each')+' end */');
			},
			component : (token) => {
				var comp_name = token.text.trim();
				if (components[comp_name]) {
					gensource.push('output += components['+JSON.stringify(comp_name)+'](data);');
				} else {
					gensource.push('output += "[Component '+comp_name+' not found]";');
				}
			},
			event_bind : (token) => {
				// Parse event binding: @click="functionName" or @click="data.handler"
				var parts = token.text.split('=');
				if (parts.length === 2) {
					var event_type = parts[0].trim();
					var handler_ref = parts[1].trim().replace(/"/g, '');
					var binding_id = 'mb_bind_' + event_bindings.length;
					event_bindings.push({
						id: binding_id,
						event: event_type,
						handler: handler_ref
					});
					gensource.push('output += " data-mb-bind=\\"'+binding_id+'\\"";');
				}
			},
			eq_block_start : (token) => {
				// Parse "value1 value2" for equality comparison block
				var parts = token.text.trim().split(/\s+/);
				if (parts.length >= 2) {
					var val1 = parts[0].startsWith('"') || parts[0].startsWith("'") ? parts[0] : data_prefix(parts[0]);
					var val2 = parts[1].startsWith('"') || parts[1].startsWith("'") ? parts[1] : data_prefix(parts[1]);
					condition_stack.push('eq');
					gensource.push('if ('+val1+' == '+val2+') {');
				}
			},
			lookup_block_start : (token) => {
				// Parse "object key" for dynamic property lookup block (checks if property exists and is truthy)
				var parts = token.text.trim().split(/\s+/);
				if (parts.length >= 2) {
					var obj = data_prefix(parts[0]);
					var key = parts[1].startsWith('"') || parts[1].startsWith("'") ? parts[1] : data_prefix(parts[1]);
					condition_stack.push('lookup');
					gensource.push('if ('+obj+' && '+obj+'['+key+']) {');
				}
			},
			eq_inline : (token) => {
				// Parse "value1 value2" for equality comparison - outputs result directly
				var parts = token.text.trim().split(/\s+/);
				if (parts.length >= 2) {
					var val1 = parts[0].startsWith('"') || parts[0].startsWith("'") ? parts[0] : data_prefix(parts[0]);
					var val2 = parts[1].startsWith('"') || parts[1].startsWith("'") ? parts[1] : data_prefix(parts[1]);
					var defaultVal = token.default ? JSON.stringify(token.default) : 'default_empty_field';
					gensource.push('output += safe_out(('+val1+' == '+val2+') ? "true" : "", '+defaultVal+');');
				}
			},
			lookup_inline : (token) => {
				// Parse "object key" for dynamic property lookup - outputs result directly
				var parts = token.text.trim().split(/\s+/);
				if (parts.length >= 2) {
					var obj = data_prefix(parts[0]);
					var key = parts[1].startsWith('"') || parts[1].startsWith("'") ? parts[1] : data_prefix(parts[1]);
					var defaultVal = token.default ? JSON.stringify(token.default) : 'default_empty_field';
					gensource.push('output += safe_out(('+obj+' && '+obj+'['+key+']) || "", '+defaultVal+');');
				}
			},
			eq_block_end : (token) => {
				condition_stack.pop();
				gensource.push('} /* eq end */');
			},
			lookup_block_end : (token) => {
				condition_stack.pop();
				gensource.push('} /* lookup end */');
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
				
				var tokenText = text.substr(0, p1);
				var token = { type : sp_found.type, text : tokenText };
				
				if (sp_found.type === 'field' || sp_found.type === 'var_out' || 
					sp_found.type === 'field_unsafe' || sp_found.type === 'field_number' || 
					sp_found.type === 'field_number_round') {
					var parsed = parse_field_with_default(tokenText);
					token.text = parsed.field;
					token.default = parsed.default;
				}
				
				tokens.push(token);
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
			console.error('Macrobars compilation error:', ce);
			console.error('Template source:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
			console.error('Generated JavaScript:', gensource.join("\n"));
		}

		f.tokens = tokens;
		f.gensource = gensource;
		f.event_bindings = event_bindings;
		f.options = options;
		f.components = components;

		f.renderTo = function(container_or_query, data) {
			var container;
			if (typeof container_or_query === 'string') {
				container = document.querySelector(container_or_query);
				if (!container) {
					return null; 
				}
			} else {
				container = container_or_query;
			}
			
			try {
				var html = f(data);
				container.innerHTML = html;
				event_bindings.forEach(binding => {
					var elements = container.querySelectorAll('[data-mb-bind="' + binding.id + '"]');
					elements.forEach(element => {
						var handler = data[binding.handler] || eval(binding.handler);
						if (typeof handler === 'function') {
							element.addEventListener(binding.event, handler);
						}
					});
				});
			} catch(renderError) {
				console.error('Macrobars renderTo error:', renderError);
				console.error('Data passed to template:', data);
				throw renderError;
			}
			
			return container;
		};

		return(f);
	}

	return({

		compile : compile,

		createComponents : function(definitions) {
			var components = {};
			each(definitions, (template, name) => {
				components[name] = compile(template);
			});
			return components;
		},

		num_out : num_out,
		safe_out : safe_out,
		num_out_round : num_out_round,
		debug_out : debug_out,
		each : each,

	});

}));
