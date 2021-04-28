

function clamp1(n, min = 0, max = 1) {
	if(n < min) return(min);
	if(n > max) return(max);
	return(n);
}

function lerp(t, a = 0, b = 1) {
	return((b-a)*t + a);
}

function howfar1(t, a = 0, b = 100) {
	if(t < a) return(0);
	if(t > b) return(1);
	var range = b-a;
	if(range == 0) return(1);
	var tr = t-a;
	return(tr / range);
}

function sin1(t) {
	return(Math.sin(t*Math.PI));
}

function flip1(t) {
	return(1-t);
}

function step1(t, a = 0.5, b = 0.5) {
	if(t < a) return(0);
	if(t > b) return(1);
	var range = b-a;
	if(range == 0) return(1);
	var tpos = t - range;
	return(t + lerp(tpos/range));
}

function quadratic1(t) {
	return(t*t);
}

function parabola(t) {
	var v = lerp(t, -1, 1);
	return(1-v*v);
}

function cubed1(t) {
	return(t*t);
}

function logistic1(t, a = 10) {
	return(1 / (1 + Math.pow(Math.E, -(-a*0.5 + t*a))));
}

function tanh1(t, a = 5) {
	return(0.5+0.5*Math.tanh(-a*0.5 + t*a));
}

function range_map(t, t_start = 0, t_end = 1, to_start = 0, to_end = 1, pfunc1 = false) {
	var p = howfar1(t, t_start, t_end);
	if(pfunc) p = pfunc(p, t_start, t_end, to_start, to_end);
	return(lerp(p, to_start, to_end));
}

var smooth_start21 = quadratic1;
var smooth_start31 = cubed1;

function smooth_stop21(t) {
	t = 1-t;
	return(1 - t*t);
}

function smooth_stop31(t) {
	t = 1-t;
	return(1 - t*t*t);
}

function mix1(t, f1, f2, blendf = false) {
	var v1 = f1(t);
	var v2 = f2(t);
	var bf = t;
	if(blendf) bf = blendf(t);
	return(v1*(1-bf) + v2*(bf));
}

function smooth_step21(t) {
	return(mix1(t, smooth_start21, smooth_stop21));
}

function smooth_step31(t) {
	return(mix1(t, smooth_start31, smooth_stop31));
}

function bezier31(t, b = 0.8, c = 0.2) {
	var s = 1-t;
	var t2 = t*t;
	var s2 = s*s;
	var t3 = t2*t;
	return((3*b*s2*t) + (3*c*s*t2) + t3);
}
