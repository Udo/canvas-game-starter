
(function (root, factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		var exports_obj = factory();
		for (var key in exports_obj) {
			if (exports_obj.hasOwnProperty(key)) {
				exports[key] = exports_obj[key];
			}
		}
	} else if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else {
		var exports_obj = factory();
		for (var key in exports_obj) {
			if (exports_obj.hasOwnProperty(key)) {
				root[key] = exports_obj[key];
			}
		}
	}
}(typeof self !== 'undefined' ? self : this, function () {


function clamp1(n, min = 0, max = 1) {
	if(n < min) return(min);
	if(n > max) return(max);
	return(n);
}

function lerp(t, a = 0, b = 1) {
	return((b-a)*t + a);
}

function sin1(t) {
	return(Math.sin(t*Math.PI));
}

function flip1(t) {
	return(1-t);
}

function step1(t, a = 0.5, b = false) {
	if(t < a) return(0);
	if(b === false) b = a;
	if(t > b) return(1);
	var range = b-a;
	if(range == 0) return(1);
	return((t-a) / range);
}

function smooth_start21(t) {
	return(t*t);
}

function parabola1(t) {
	var v = lerp(t, -1, 1);
	return(1-v*v);
}

function smooth_start31(t) {
	return(t*t*t);
}

function logistic1(t, a = 10) {
	return(1 / (1 + Math.pow(Math.E, -(-a*0.5 + t*a))));
}

function tanh1(t, a = 5) {
	return(0.5+0.5*Math.tanh(-a*0.5 + t*a));
}

function range_map(t, t_start = 0, t_end = 1, to_start = 0, to_end = 1, pfunc1 = false) {
	var p = step1(t, t_start, t_end);
	if(pfunc1 !== false)
		p = pfunc1(p, t_start, t_end, to_start, to_end);
	return(lerp(p, to_start, to_end));
}

function smooth_stop21(t) {
	t = 1-t;
	return(1 - t*t);
}

function smooth_stop31(t) {
	t = 1-t;
	return(1 - t*t*t);
}

function crossfade1(t, f1, f2, blendf = false) {
	var v1 = f1(t);
	var v2 = f2(t);
	var bf = t;
	if(blendf) bf = blendf(t);
	return(v1*(1-bf) + v2*(bf));
}

function smooth_step21(t) {
	return(crossfade1(t, smooth_start21, smooth_stop21));
}

function smooth_step31(t) {
	return(crossfade1(t, smooth_start31, smooth_stop31));
}

function bezier31(t, b = 0.8, c = 0.2) {
	var s = 1-t;
	var t2 = t*t;
	var s2 = s*s;
	var t3 = t2*t;
	return((3*b*s2*t) + (3*c*s*t2) + t3);
}

function bounce_stop1(v) { // lifted this particular bounce from: https://github.com/sole/tween.js/blob/master/src/Tween.js
	if (v < (1 / 2.75)) {
		return 7.5625 * v * v;
	} else if (v < (2 / 2.75)) {
		return 7.5625 * (v -= (1.5 / 2.75)) * v + 0.75;
	} else if (v < (2.5 / 2.75)) {
		return 7.5625 * (v -= (2.25 / 2.75)) * v + 0.9375;
	} else {
		return 7.5625 * (v -= (2.625 / 2.75)) * v + 0.984375;
	}
}

function chain1(t) {
	var seg = arguments.length - 1;
	if(seg <= 0) return(t);
	var ts = t / (1/seg);
	var fts = ts % 1;
	var tseg = Math.floor(ts);
	var v = arguments[tseg+1];
	if(typeof v == 'function') v = v(fts);
	return(v);
}

return {
	clamp1: clamp1,
	lerp: lerp,
	sin1: sin1,
	flip1: flip1,
	step1: step1,
	smooth_start21: smooth_start21,
	parabola1: parabola1,
	smooth_start31: smooth_start31,
	logistic1: logistic1,
	tanh1: tanh1,
	range_map: range_map,
	smooth_stop21: smooth_stop21,
	smooth_stop31: smooth_stop31,
	crossfade1: crossfade1,
	smooth_step21: smooth_step21,
	smooth_step31: smooth_step31,
	bezier31: bezier31,
	bounce_stop1: bounce_stop1,
	chain1: chain1
};

}));
