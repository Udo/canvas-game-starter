(function (root, factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else {
		root.PixiStage = factory();
	}
}(typeof self !== 'undefined' ? self : this, function () {

let PixiStage = {

	create : async (prop = {}) => {
		let stage = {

			state : {},
			current_drag_object : false,
			animations : [],
			layerStorage: {},
			events: {},
			properties : prop,
			app : null,
			event_handlers : {
				wheel : false,
			},
			params : {
				zoom : {
					min : 0.2,
					max : 4.0,
				},
				stage : {
					drag_button : 0,
					draggable : true,
				},
			},

		};
		
		stage.events = new EventEmitter();

		stage.init = async () => {
			let app = new PIXI.Application();
			await app.init({ width: window.innerWidth, height: window.innerHeight });
			document.body.appendChild(app.view);
			stage.app = app;
			
			document.body.appendChild(stage.app.canvas);
			
			if(stage.events) {
				stage.events.emit('init:start');
			}
			
			window.addEventListener('resize', () => {
				stage.app.renderer.resize(window.innerWidth, window.innerHeight);
				if(stage.events) {
					stage.events.emit('resize', { width: window.innerWidth, height: window.innerHeight });
				}
			});
			
			stage.app.ticker.add((deltaTime) => {
				stage.animations = stage.animations.filter(anim => {
					const result = anim(deltaTime);
					return result !== false;
				});
			});
			stage.app.stage.target_scale = 1;
			
			stage.state.could_scroll = false;
			stage.state.mouse = {};
			
			stage.app.canvas.addEventListener('wheel', (event) => {
				if(stage.state && stage.state.could_scroll) {
					stage.state.could_scroll.emit('wheel', event);
				} else if(stage.event_handlers && stage.event_handlers.wheel) {
					stage.event_handlers.wheel(event);
				}
				if(stage.events) {
					stage.events.emit('wheel', event);
				}
			});
			
			stage.app.canvas.addEventListener('mousedown', (e) => {
				stage.state['mouse_button_'+e.button] = true;
				stage.state.mouse = {
					x_down : e.clientX,
					y_down : e.clientY,
					x_down_stage : stage.app.stage.x,
					y_down_stage : stage.app.stage.y,
				}
				if(stage.events) {
					stage.events.emit('mousedown', e);
				}
			});
			stage.app.canvas.addEventListener('mousemove', (e) => {
				if(stage.state['mouse_button_'+stage.params.stage.drag_button] &&
					!stage.current_drag_object) {
					let scale = stage.app.stage.scale.x;
					stage.state.mouse.x_diff = (e.clientX-stage.state.mouse.x_down);
					stage.state.mouse.y_diff = (e.clientY-stage.state.mouse.y_down);
					if(stage.params.stage.draggable) {
						if(stage.app.stage.director_animation)
							stage.animation.remove(stage.app.stage.director_animation);
						stage.app.stage.x = stage.state.mouse.x_diff+stage.state.mouse.x_down_stage;
						stage.app.stage.y = stage.state.mouse.y_diff+stage.state.mouse.y_down_stage;
						if(stage.events) {
							stage.events.emit('stage:drag', { x: stage.app.stage.x, y: stage.app.stage.y });
						}
					}
				}
				if(stage.events) {
					stage.events.emit('mousemove', e);
				}
			});
			stage.app.canvas.addEventListener('mouseup', (e) => {
				stage.state['mouse_button_'+e.button] = false;
				if(stage.events) {
					stage.events.emit('mouseup', e);
				}
			});

			if(stage.events) {
				stage.events.emit('init:complete');
			}

			return stage.app;
		};

		stage.make_scrollable = (o, f = false) => {
			o.interactive = true;
			
			o.bring_to_front = () => {
				if (o.parent) {
					o.parent.addChild(o);
				}
			};
			
			o.on('mouseover', (e) => {
				stage.state.could_scroll = o;
				if(stage.events) {
					stage.events.emit('scroll:enter', { object: o, event: e });
				}
			});
			o.on('mouseout', (e) => {
				if(stage.state.could_scroll == o) {
					stage.state.could_scroll = false;
					if(stage.events) {
						stage.events.emit('scroll:exit', { object: o, event: e });
					}
				}
			});
			if(f)
				o.on('wheel', f);
		};

		stage.make_clickable = (o, f = false) => {
			o.interactive = true;
			
			o.bring_to_front = () => {
				if (o.parent) {
					o.parent.addChild(o);
				}
			};
			
			o.on('click', (e) => {
				if(stage.events) {
					stage.events.emit('object:click', { object: o, event: e });
				}
				if(f) f(e);
			});
		};

		stage.make_draggable = (o, f = false) => {
			o.interactive = true;

			o.bring_to_front = () => {
				if (o.parent) {
					o.parent.addChild(o);
				}
			};

			o.on_drag_or_click_start = (e) => {
				if(stage.current_drag_object ||
					e.target != o) return;
				stage.current_drag_object = e.target;
				o.drag_data = {
					xm_start : e.client.x,
					ym_start : e.client.y,
					x_start : o.x,
					y_start : o.y,
					target : o,
				};
				o.emit('pick', { type: 'dragevent', data: o.drag_data, });
				o.is_dragging = true;
				if(stage.events) {
					stage.events.emit('drag:start', { object: o, data: o.drag_data });
				}
				window.addEventListener('mousemove', o.on_drag_move);
			}

			o.on_drag_end = () => {
				if(!o.is_dragging) return;
				if(f) f(o);
				window.removeEventListener('mousemove', o.on_drag_move);
				stage.current_drag_object = false;
				o.is_dragging = false;
				o.is_drag_moving = false;
				if(stage.events) {
					stage.events.emit('drag:end', { object: o, data: o.drag_data });
				}
				o.drag_data = null;
				o.emit('dragend', { type: 'dragevent', data: o.drag_data, });
			}

			o.on_drag_move = (e) => {
				if(!o.is_dragging) return;
				o.drag_data.xm_delta = e.clientX - o.drag_data.xm_start;
				o.drag_data.ym_delta = e.clientY - o.drag_data.ym_start;
				o.x = o.drag_data.xm_delta / stage.app.stage.scale.x + o.drag_data.x_start;
				o.y = o.drag_data.ym_delta / stage.app.stage.scale.y + o.drag_data.y_start;
				if(!o.is_drag_moving) {
					o.is_drag_moving = true;
					o.emit('dragstart', { type: 'dragevent', data: o.drag_data, });
				}
				o.emit('dragmove', { type: 'dragevent', data: o.drag_data, });
				if(stage.events) {
					stage.events.emit('drag:move', { object: o, data: o.drag_data });
				}
			}

			o.on('pointerdown', o.on_drag_or_click_start);
			o.on('pointerup', o.on_drag_end);
			o.on('pointerupoutside', o.on_drag_end);
		};

		stage.animation = {
			add: function(f) {
				stage.animations.push(f);
				return f;
			},
			remove: function(f) {
				stage.animations = stage.animations.filter(anim => anim !== f);
			},
			clear: function() {
				stage.animations.length = 0;
			},
		};

		stage.animate = (f, slot = 'default') => {
			stage.animations.push(f);
			return f;
		};

		stage.layers = {

			add: (name, sortable_children = false) => {
				stage.layerStorage[name] = new PIXI.Container();
				if (sortable_children) {
					stage.layerStorage[name].sortableChildren = true;
				}
				stage.app.stage.addChild(stage.layerStorage[name]);
				return stage.layerStorage[name];
			},

			remove: (name) => {
				if (stage.layerStorage[name]) {
					stage.app.stage.removeChild(stage.layerStorage[name]);
					delete stage.layerStorage[name];
				} else {
					console.warn('Layer not found:', name);
				}
			},

			get: (name) => {
				return stage.layerStorage[name];
			},

			list: () => {
				return Object.keys(stage.layerStorage);
			},

		};

		stage.director = {

			camera: {
				zoom: (targetScale) => {
					return stage.director.zoom(stage.app.stage, targetScale);
				},
				pan: (x, y) => {
					stage.app.stage.x = x;
					stage.app.stage.y = y;
				},
				reset: () => {
					stage.app.stage.x = 0;
					stage.app.stage.y = 0;
					stage.app.stage.scale.set(1);
				}
			},

			zoom: (o, targetScale, centerPoint = null) => {
				let app = stage.app;
				if(app.stage.director_animation)
					stage.animation.remove(app.stage.director_animation);
				
				// Calculate zoom center - either provided point or screen center
				const zoomCenter = centerPoint || { 
					x: app.renderer.width / 2, 
					y: app.renderer.height / 2 
				};
				
				const initialScale = app.stage.scale.x;
				const initialStageX = app.stage.position.x;
				const initialStageY = app.stage.position.y;
				
				app.stage.director_animation = stage.animate((dt) => {
					const currentScale = app.stage.scale.x;
					const lerpFactor = 0.1;

					// Calculate new scale
					const newScale = currentScale + (targetScale - currentScale) * lerpFactor;
					
					// Calculate scale factor change
					const scaleFactor = newScale / initialScale;
					
					// Calculate new stage position to keep zoom center fixed
					const newStageX = zoomCenter.x - (zoomCenter.x - initialStageX) * scaleFactor;
					const newStageY = zoomCenter.y - (zoomCenter.y - initialStageY) * scaleFactor;
					
					// Apply new scale and position
					app.stage.scale.set(newScale);
					app.stage.position.set(newStageX, newStageY);

					if ((Math.abs(app.stage.scale.x - targetScale) < 0.01)) {
						app.stage.scale.set(targetScale);
						
						// Final position calculation
						const finalScaleFactor = targetScale / initialScale;
						const finalStageX = zoomCenter.x - (zoomCenter.x - initialStageX) * finalScaleFactor;
						const finalStageY = zoomCenter.y - (zoomCenter.y - initialStageY) * finalScaleFactor;
						app.stage.position.set(finalStageX, finalStageY);
						
						o.director_animation = false;
						return false;
					}
					return true;
				});
			},

			focus_on: (o, should_take_up = 0.8) => {
				let app = stage.app;
				const scaleX = app.renderer.width / o.width;
				const scaleY = app.renderer.height / o.height;
				let scale = Math.min(scaleX, scaleY) * should_take_up;
				
				if(o.bring_to_front) o.bring_to_front();
				
				if(should_take_up < 0)
					scale = app.stage.scale.x;
				let targetScale = scale;
				let targetX = -(o.x * targetScale - app.renderer.width / 2 + (o.width * targetScale) / 2);
				let targetY = -(o.y * targetScale - app.renderer.height / 2 + (o.height * targetScale) / 2);
				if(app.stage.director_animation)
					stage.animation.remove(app.stage.director_animation);

				app.stage.director_animation = stage.animate((dt) => {
					const currentScale = app.stage.scale.x;
					const lerpFactor = 0.1;

					if(should_take_up > 0)
						app.stage.scale.set(currentScale + (targetScale - currentScale) * lerpFactor);

					app.stage.target_scale = targetScale;
					app.stage.position.x += (targetX - app.stage.position.x) * lerpFactor;
					app.stage.position.y += (targetY - app.stage.position.y) * lerpFactor;

					if ((should_take_up < 0 || Math.abs(app.stage.scale.x - targetScale) < 0.01) &&
						Math.abs(app.stage.position.x - targetX) < 1 &&
						Math.abs(app.stage.position.y - targetY) < 1) {
						if(should_take_up > 0)
							app.stage.scale.set(targetScale);
						app.stage.position.set(targetX, targetY);
						o.director_animation = false;
						return false;
					}
					return true;
				});
			},

			getStageBounds: (container = null) => {
				if (!container) {
					container = stage.app.stage;
				}
				
				let minX = Infinity, maxX = -Infinity;
				let minY = Infinity, maxY = -Infinity;
				let hasObjects = false;
				
				function processBounds(obj) {
					if (obj.visible && obj.getBounds) {
						const bounds = obj.getBounds();
						if (bounds.width > 0 && bounds.height > 0) {
							minX = Math.min(minX, bounds.x);
							maxX = Math.max(maxX, bounds.x + bounds.width);
							minY = Math.min(minY, bounds.y);
							maxY = Math.max(maxY, bounds.y + bounds.height);
							hasObjects = true;
						}
					}
					if (obj.children) {
						obj.children.forEach(processBounds);
					}
				}
				
				processBounds(container);
				
				if (!hasObjects) {
					return { x: 0, y: 0, width: 100, height: 100 };
				}
				
				return {
					x: minX,
					y: minY,
					width: maxX - minX,
					height: maxY - minY
				};
			},

			centerViewOnBounds: (bounds = null, padding = 0.6) => {
				let app = stage.app;
				
				if (!bounds) {
					bounds = stage.director.getStageBounds();
				}
				
				const centerX = bounds.x + bounds.width / 2;
				const centerY = bounds.y + bounds.height / 2;
				
				const scaleX = app.renderer.width / bounds.width;
				const scaleY = app.renderer.height / bounds.height;
				const targetScale = Math.min(scaleX, scaleY) * padding;
				
				const targetX = -centerX * targetScale + app.renderer.width / 2;
				const targetY = -centerY * targetScale + app.renderer.height / 2;
				
				if (app.stage.director_animation) {
					stage.animation.remove(app.stage.director_animation);
				}
				
				app.stage.director_animation = stage.animate((dt) => {
					const lerpFactor = 0.1;
					
					app.stage.x += (targetX - app.stage.x) * lerpFactor;
					app.stage.y += (targetY - app.stage.y) * lerpFactor;
					app.stage.scale.x += (targetScale - app.stage.scale.x) * lerpFactor;
					app.stage.scale.y += (targetScale - app.stage.scale.y) * lerpFactor;

					const distance = Math.abs(targetX - app.stage.x) + Math.abs(targetY - app.stage.y) + Math.abs(targetScale - app.stage.scale.x);
					if (distance < 1) {
						app.stage.x = targetX;
						app.stage.y = targetY;
						app.stage.scale.x = targetScale;
						app.stage.scale.y = targetScale;
						return false;
					}
					
					return true;
				});
			},

		};

		await stage.init();

		return stage;
	},

}

return PixiStage;

}));

