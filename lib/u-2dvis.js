function vis_ray(ox, oy, angle, maxDist = 1000) {
	var dx = Math.cos(angle), dy = Math.sin(angle);
	return({ ox, oy, dx, dy, ex: ox + dx * maxDist, ey: oy + dy * maxDist, dist: maxDist });
}

function vis_intersect_rect(ray, rx, ry, rw, rh) {
	var tmin = (rx - ray.ox) / ray.dx, tmax = (rx + rw - ray.ox) / ray.dx;
	if(tmin > tmax) [tmin, tmax] = [tmax, tmin];
	
	var tymin = (ry - ray.oy) / ray.dy, tymax = (ry + rh - ray.oy) / ray.dy;
	if(tymin > tymax) [tymin, tymax] = [tymax, tymin];
	
	if(tmin > tymax || tymin > tmax) return false;
	
	var t = Math.max(tmin, tymin);
	if(t < 0 || t > ray.dist) return false;
	
	return({
		x: ray.ox + ray.dx * t, y: ray.oy + ray.dy * t, dist: t,
		side: tmin > tymin ? (ray.dx > 0 ? 'left' : 'right') : (ray.dy > 0 ? 'top' : 'bottom')
	});
}

function vis_intersect_circle(ray, cx, cy, r) {
	var fx = ray.ox - cx, fy = ray.oy - cy;
	var a = ray.dx * ray.dx + ray.dy * ray.dy;
	var b = 2 * (fx * ray.dx + fy * ray.dy);
	var c = fx * fx + fy * fy - r * r;
	
	var discriminant = b * b - 4 * a * c;
	if(discriminant < 0) return false;
	
	var sqrt_disc = Math.sqrt(discriminant);
	var t = ((-b - sqrt_disc) / (2 * a)) >= 0 ? (-b - sqrt_disc) / (2 * a) : (-b + sqrt_disc) / (2 * a);
	if(t < 0 || t > ray.dist) return false;
	
	return({ x: ray.ox + ray.dx * t, y: ray.oy + ray.dy * t, dist: t, side: 'surface' });
}

function vis_cast_ray(ox, oy, angle, blockers, maxDist = 1000) {
	var ray = vis_ray(ox, oy, angle, maxDist);
	var closest = false, minDist = maxDist;
	
	blockers.forEach(b => {
		var hit = b.type == 'rect' ? vis_intersect_rect(ray, b.x, b.y, b.w, b.h) : 
		          b.type == 'circle' ? vis_intersect_circle(ray, b.x, b.y, b.r) : false;
		if(hit && hit.dist < minDist) { closest = hit; minDist = hit.dist; }
	});
	
	return closest ? { x: closest.x, y: closest.y, dist: closest.dist, blocked: true, side: closest.side } :
	                { x: ray.ex, y: ray.ey, dist: maxDist, blocked: false };
}

function vis_radial(ox, oy, rayCount = 360, blockers = [], maxDist = 1000) {
	var rays = [], step = (Math.PI * 2) / rayCount;
	for(var i = 0; i < rayCount; i++) {
		var hit = vis_cast_ray(ox, oy, i * step, blockers, maxDist);
		rays.push({ angle: i * step, x: hit.x, y: hit.y, dist: hit.dist, blocked: hit.blocked });
	}
	return rays;
}

function vis_radial_adaptive(ox, oy, rayCount = 360, blockers = [], maxDist = 1000, refinements = 2) {
	var rays = vis_radial(ox, oy, rayCount, blockers, maxDist);
	
	for(var r = 0; r < refinements; r++) {
		var newRays = [];
		for(var i = 0; i < rays.length; i++) {
			var curr = rays[i], next = rays[(i + 1) % rays.length];
			newRays.push(curr);
			
			if(curr.blocked != next.blocked || Math.abs(curr.dist - next.dist) > maxDist * 0.1) {
				var midAngle = curr.angle + (next.angle - curr.angle) * 0.5;
				if(next.angle < curr.angle) midAngle += Math.PI;
				
				var midHit = vis_cast_ray(ox, oy, midAngle, blockers, maxDist);
				newRays.push({ angle: midAngle, x: midHit.x, y: midHit.y, dist: midHit.dist, blocked: midHit.blocked });
			}
		}
		rays = newRays.sort((a, b) => a.angle - b.angle);
	}
	return rays;
}

function vis_polygon(rays) { return rays.map(ray => [ray.x, ray.y]); }

function vis_shadow_polygon(blocker, lightX, lightY, maxDist = 1000) {
	if(blocker.type == 'rect') {
		var corners = [[blocker.x, blocker.y], [blocker.x + blocker.w, blocker.y], 
		              [blocker.x + blocker.w, blocker.y + blocker.h], [blocker.x, blocker.y + blocker.h]];
		var shadow = [];
		corners.forEach(corner => {
			var dx = corner[0] - lightX, dy = corner[1] - lightY, len = Math.sqrt(dx*dx + dy*dy);
			if(len > 0) {
				shadow.push(corner, [corner[0] + dx/len * maxDist, corner[1] + dy/len * maxDist]);
			}
		});
		return shadow;
	} else if(blocker.type == 'circle') {
		var dx = blocker.x - lightX, dy = blocker.y - lightY, dist = Math.sqrt(dx*dx + dy*dy);
		if(dist <= blocker.r) return [];
		
		var angle = Math.atan2(dy, dx), tangentAngle = Math.asin(blocker.r / dist);
		var angle1 = angle - tangentAngle, angle2 = angle + tangentAngle;
		
		var t1x = blocker.x + Math.cos(angle1 + Math.PI/2) * blocker.r;
		var t1y = blocker.y + Math.sin(angle1 + Math.PI/2) * blocker.r;
		var t2x = blocker.x + Math.cos(angle2 - Math.PI/2) * blocker.r;
		var t2y = blocker.y + Math.sin(angle2 - Math.PI/2) * blocker.r;
		
		return [[t1x, t1y], [t1x + Math.cos(angle1) * maxDist, t1y + Math.sin(angle1) * maxDist],
		        [t2x + Math.cos(angle2) * maxDist, t2y + Math.sin(angle2) * maxDist], [t2x, t2y]];
	}
	return [];
}

function vis_create_mask(rays, ox, oy, blockers, maxDist) {
	return { light: vis_polygon(rays), shadows: blockers.map(b => vis_shadow_polygon(b, ox, oy, maxDist)), rays };
}

function vis_light_mask(ox, oy, rayCount, blockers, maxDist) {
	return vis_create_mask(vis_radial(ox, oy, rayCount, blockers, maxDist), ox, oy, blockers, maxDist);
}

function vis_light_mask_adaptive(ox, oy, rayCount, blockers, maxDist, refinements = 2) {
	return vis_create_mask(vis_radial_adaptive(ox, oy, rayCount, blockers, maxDist, refinements), ox, oy, blockers, maxDist);
}

function vis_corner_adaptive(ox, oy, rayCount, blockers, maxDist, cornerSamples = 3) {
	var allRays = vis_radial(ox, oy, rayCount, blockers, maxDist).slice();
	
	blockers.forEach(b => {
		if(b.type == 'rect') {
			[[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]].forEach(corner => {
				var cornerAngle = Math.atan2(corner[1] - oy, corner[0] - ox);
				for(var s = -cornerSamples; s <= cornerSamples; s++) {
					var hit = vis_cast_ray(ox, oy, cornerAngle + s * 0.02, blockers, maxDist);
					allRays.push({ angle: cornerAngle + s * 0.02, x: hit.x, y: hit.y, dist: hit.dist, blocked: hit.blocked });
				}
			});
		} else if(b.type == 'circle') {
			var dx = b.x - ox, dy = b.y - oy, dist = Math.sqrt(dx*dx + dy*dy);
			if(dist > b.r) {
				var baseAngle = Math.atan2(dy, dx), tangentAngle = Math.asin(b.r / dist);
				[baseAngle - tangentAngle, baseAngle + tangentAngle].forEach(angle => {
					for(var s = -cornerSamples; s <= cornerSamples; s++) {
						var hit = vis_cast_ray(ox, oy, angle + s * 0.01, blockers, maxDist);
						allRays.push({ angle: angle + s * 0.01, x: hit.x, y: hit.y, dist: hit.dist, blocked: hit.blocked });
					}
				});
			}
		}
	});
	
	allRays.sort((a, b) => a.angle - b.angle);
	var filteredRays = [], lastAngle = -999;
	allRays.forEach(ray => { if(ray.angle - lastAngle > 0.01) { filteredRays.push(ray); lastAngle = ray.angle; } });
	return filteredRays;
}

function vis_light_mask_corner_adaptive(ox, oy, rayCount, blockers, maxDist, cornerSamples = 3) {
	return vis_create_mask(vis_corner_adaptive(ox, oy, rayCount, blockers, maxDist, cornerSamples), ox, oy, blockers, maxDist);
}

function vis_multi_light_mask(lights, rayCount, blockers, maxDist, adaptive = false) {
	return lights.map(light => {
		var result = adaptive ? vis_light_mask_adaptive(light.x, light.y, rayCount, blockers, maxDist, 2) :
		                       vis_light_mask(light.x, light.y, rayCount, blockers, maxDist);
		result.color = light.color || 0xFFFFAA;
		result.lightSource = light;
		return result;
	});
}

function vis_distance_fade(dist, maxDist, fadeStart = 0.7) {
	var fadePoint = maxDist * fadeStart;
	return dist < fadePoint ? 1 : Math.max(0, 1 - (dist - fadePoint) / (maxDist - fadePoint));
}
