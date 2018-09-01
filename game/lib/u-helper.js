function bindThis(self, source, destination) {
  if(!destination)
    destination = {};
  if(!source) {
    for(var prop in self) if(self.hasOwnProperty(prop)) {
      if(self[prop].bind)
        destination[prop] = self[prop].bind(destination); 
      else
        destination[prop] = self[prop]; 
    }
  }
  else {
    for(var prop in source) if(source.hasOwnProperty(prop)) {
      destination[prop] = source[prop].bind(self); 
    }
  }
  return(destination);
}

function rgb(r, g, b) {
	return( b + g*256 + r*65536 );
}

function rgba(r, g, b, a) {
	return( a + b*256 + g*65536 + r*16777216 );
}

function frgb(r, g, b) {
	return( (Math.round(b*255) + Math.round(g*255)*256 + Math.round(r*255)*65536) );
}

function frgba(r, g, b, a) {
	return( Math.round(a*255) + Math.round(b*255)*256 + Math.round(g*255)*65536 + Math.round(r*255)*16777216 );
}

function lerp(a, b, t) {
  return( a + t*(b-a) );
}

function bresenham_line(x0, y0, x1, y1, f) {
  var result = [];
 
  var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  var dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1; 
  var err = (dx>dy ? dx : -dy)/2;
 
  while (true) {
    if(f)
      f(x0, y0);
    else
      result.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    var e2 = err;
    if (e2 > -dx) { err -= dy; x0 += sx; }
    if (e2 < dy) { err += dx; y0 += sy; }
  }
  
  return(result);
}

function first() {
  for (var i = 0; i < arguments.length; i++) {
    var t = arguments[i];
    if(t && t != '') {
      return(t);
    }
  }
}

function dist(x1, y1, x2, y2) {
  var xd = x1 - x2;
  var yd = y1 - y2;
  return(Math.sqrt(
    xd*xd + yd*yd
    ));
}

function selectRandom(list, removeEntry) {
  if(list.length == 0) return null;
  var idx = Math.floor(Math.random()*list.length);
  var entry = list[idx];
  if(removeEntry) list.splice(idx, 1);
  return(entry);
}

function clamp(v, min, max) {
	if(min !== false && v < min)
		return(min);
  if(max !== false && v > max)
		return(max);
	return(v);
}

function clamp01(v) {
	if(0 !== false && v < 0)
		return(0);
  if(1 !== false && v > 1)
		return(1);
	return(v);
}

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

function keys(o) {
  var result = [];
  if(o.forEach) {
    o.forEach(function(item, index) {
      result.push(index);
    });
  } else {
    for(var prop in o) if(o.hasOwnProperty(prop)) {
      result.push(prop);
    }
  }
  return(result);
}

function values(o) {
  var result = [];
  if(o.forEach) {
    o.forEach(function(item, index) {
      result.push(item);
    });
  } else {
    for(var prop in o) if(o.hasOwnProperty(prop)) {
      result.push(o[prop]);
    }
  }
  return(result);
}

function map(o, f) {
  if(o.forEach) {
    var result = [];
    o.forEach(function(item) {
      var r = f(item);
      if(r)
        result.push(r);
    });
    return(result);
  } else {
    var result = {};
    for(var prop in o) if(o.hasOwnProperty(prop)) {
      var r = f(o[prop], prop);
      if(r)
        result[prop] = r;
    }
    return(result);
  }
}

function merge(dest, source) {
  if(!dest)
    dest = {};
  if(!source)
    source = {};
  for(var prop in source) if(source.hasOwnProperty(prop)) {
    dest[prop] = source[prop];
  }
  return(dest);
}
