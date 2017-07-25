"use strict";

const merge = _.merge;
const each = _.forEach;
const map = _.map;
const clone = _.cloneDeep;

function callRecursive(collection, execFieldName) {
	each(collection, function(item) { 
		if(!item) return;
		if(item.hasOwnProperty(execFieldName)) {
			item[execFieldName](item);
		}
		if(item.children)
			callRecursive(item.children, execFieldName);
	});
}

function clearContainer(container) {
  var l = [];
  each(container.children, function(c) { l.push(c); });
  container.removeChildren();
  each(l, function(c) {
    try { if(c) c.destroy(); } catch(ee) { }
  });
}

function clamp(v, min, max) {
	if(min !== false && v < min)
		return(min);
  if(max !== false && v > max)
		return(max);
	return(v);
}

function rgb(r, g, b) {
	return( b + g*256 + r*65536 );
}

function lerp(a, b, t) {
  return( a + t*(b-a) );
}

function targetLerp(c, tN, vN) {
  if(c[tN]) {
    var tp = c[tN];
    var p = c[vN];
    if(tp.n < 1) {
      tp.n += 0.01;
      p.x = lerp(p.x, tp.x, tp.n);
      p.y = lerp(p.y, tp.y, tp.n);
    } else {
      p.x = tp.x;
      p.y = tp.y;
      c[tN] = false;
    }
  }
}

function bresenham_line(x0, y0, x1, y1) {
  var result = [];
 
  var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  var dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1; 
  var err = (dx>dy ? dx : -dy)/2;
 
  while (true) {
    result.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    var e2 = err;
    if (e2 > -dx) { err -= dy; x0 += sx; }
    if (e2 < dy) { err += dx; y0 += sy; }
  }
  
  return(result);
}

function dist(x1, y1, x2, y2) {
  var xd = x1 - x2;
  var yd = y1 - y2;
  return(Math.sqrt(
    xd*xd + yd*yd
    ));
}

function selectRandom(list) {
  if(list.length == 0) return null;
  return(list[Math.floor(Math.random()*list.length)]);
}

function ChangeSpriteTexture(sprite, id) {
  if(PIXI.utils.TextureCache[id]) {
    sprite.texture = PIXI.utils.TextureCache[id];
  }
  else {
    sprite.texture = PIXI.Texture.fromImage(id, false, PIXI.SCALE_MODES.NEAREST);
  }
}

var directionalImage = function(u) {
  var t = Tiles.getSameTypeDirection(u.data.type, u.data.x, u.data.y);
  if(t != '') {
    Tiles.changeTexture(u, 'img/tile-'+u.data.type+'-'+t+'.png');
  }
}

function serializeGameObject(u) {
  var s = {};
  if(u.data) each(u.data, function(v, k) {
    if(typeof v != 'object' && typeof v != 'function')
      s[k] = v;
  });
  return(s);
}
