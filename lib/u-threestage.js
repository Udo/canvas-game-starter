(function (root, factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else {
		root.ThreeStage = factory();
	}
}(typeof self !== 'undefined' ? self : this, function () {

var THREE;

let ThreeStage = {

	create : async (prop = {}) => {
		// Set THREE if provided in properties
		if(prop.THREE) THREE = prop.THREE;
		
		let stage = {
			state : {},
			current_drag_object : false,
			animations : [],
			layerStorage: {},
			events: {},
			properties : prop,
			renderer : null,
			camera : null,
			root : null,
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

		// Debug info
		stage.debug = {
			fps: 60,
			frameTime: 16.67,
			lastTime: performance.now()
		};

		stage.init = async () => {
			stage.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
			stage.camera.position.z = 30;
			stage.renderer = new THREE.WebGLRenderer({ antialias: true });
			stage.renderer.setSize( window.innerWidth, window.innerHeight );
			stage.renderer.view = stage.renderer.domElement;
			
			if(stage.properties.parentElement)
				stage.properties.parentElement.append(stage.renderer.view);
			else
				document.body.appendChild(stage.renderer.view);
			
			stage.root = new THREE.Scene();
			stage.raycaster = new THREE.Raycaster();
			
			stage.events.emit('init:start');
			
			window.addEventListener('resize', () => {
				stage.camera.aspect = window.innerWidth / window.innerHeight;
				stage.camera.updateProjectionMatrix();
				stage.renderer.setSize( window.innerWidth, window.innerHeight );
				stage.events.emit('resize', { width: window.innerWidth, height: window.innerHeight });
			});
			
			// Animation loop
			let isRunning = false;
			const animate = (currentTime) => {
				if(!isRunning) return;
				
				const deltaTime = (currentTime - stage.debug.lastTime) / 1000;
				stage.debug.frameTime = currentTime - stage.debug.lastTime;
				stage.debug.fps = Math.round(1000 / stage.debug.frameTime);
				stage.debug.lastTime = currentTime;
				
				stage.animations = stage.animations.filter(anim => {
					const result = anim(deltaTime);
					return result !== false;
				});
				
				if(stage.renderFunction)
					stage.renderFunction(stage.root, stage.camera);
				else if(stage.composer)
					stage.composer.render();
				else
					stage.renderer.render(stage.root, stage.camera);
				
				requestAnimationFrame(animate);
			};
			
			// Start/stop methods
			stage.start = () => {
				isRunning = true;
				stage.debug.lastTime = performance.now();
				animate(stage.debug.lastTime);
			};
			
			stage.stop = () => {
				isRunning = false;
			};
			
			stage.state.could_scroll = false;
			stage.mouse = {
				drag_sensitivity: 50.0,
			};
			
			// Mouse and keyboard event setup
			stage.renderer.view.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				return false;
			});
			
			stage.renderer.view.addEventListener('wheel', (event) => {
				if(stage.state && stage.state.could_scroll) {
					stage.state.could_scroll.emit('wheel', event);
				} else if(stage.event_handlers && stage.event_handlers.wheel) {
					stage.event_handlers.wheel(event);
				}
				stage.events.emit('wheel', event);
			});
			
			stage.renderer.view.addEventListener('mousedown', (e) => {
				stage.state['mouse_button_'+e.button] = true;
				stage.state.mouse = {
					x_down : stage.mouse.x,
					y_down : stage.mouse.y,
					x_down_stage : stage.root.position.x,
					y_down_stage : stage.root.position.y,
				}
				stage.events.emit('mousedown', e);
			});
			
			stage.renderer.view.addEventListener('mousemove', (e) => {
				// Update normalized mouse coordinates for raycasting
				stage.mouse = stage.mouse || {};
				stage.mouse.x = stage.mouse.drag_sensitivity*(e.clientX / window.innerWidth) * 2 - 1;
				stage.mouse.y = stage.mouse.drag_sensitivity*(e.clientY / window.innerHeight) * 2 + 1;

				if(stage.state['mouse_button_'+stage.params.stage.drag_button] &&
					!stage.current_drag_object) {
					stage.state.mouse.x_diff = (stage.mouse.x-stage.state.mouse.x_down);
					stage.state.mouse.y_diff = (stage.mouse.y-stage.state.mouse.y_down);
					if(stage.params.stage.draggable) {
						if(stage.root.director_animation)
							stage.animation.remove(stage.root.director_animation);
						stage.root.position.x = stage.state.mouse.x_diff+stage.state.mouse.x_down_stage;
						stage.root.position.y = -stage.state.mouse.y_diff+stage.state.mouse.y_down_stage;
						stage.events.emit('stage:drag', { x: stage.root.position.x, y: stage.root.position.y });
					}
				}
				stage.events.emit('mousemove', e);
			});
			
			stage.renderer.view.addEventListener('mouseup', (e) => {
				stage.state['mouse_button_'+e.button] = false;
				stage.events.emit('mouseup', e);
			});

			stage.renderer.view.addEventListener('click', (e) => {
				stage.events.emit('click', e);
			});

			stage.events.emit('init:complete');
			return stage;
		};

		// Utility functions
		stage.clamp = (v, min, max) => {
			if(v < min) v = min;
			if(v > max) v = max;
			return v;
		};

		stage.wireframe = (o) => {
			let group = new THREE.Group();
			group.wireframe = new THREE.Line( o.geometry, stage.mat.line );
			group.o = o;
			group.add(group.wireframe);
			group.add(o);
			return group;
		};

		stage.eachMouseSelect = (objects, f, recurse) => {
			if(!stage.raycaster || !stage.mouse)
				return;
			stage.raycaster.setFromCamera(stage.mouse, stage.camera);
			let intersects = stage.raycaster.intersectObjects( objects, recurse );
			for ( let i = 0; i < intersects.length; i++ ) {
				f(intersects[ i ], i);
			}
		};

		stage.getNearestMouseIntersect = (objects, recurse) => {
			let result = false;
			stage.eachMouseSelect(objects, function(hit) {
				if(result === false || result.distance > hit.distance)
					result = hit;
				}, recurse);
			return result;
		};

		// Interactive object methods
		stage.make_scrollable = (o, f = false) => {
			o.bring_to_front = () => {
				if (o.parent) {
					o.parent.add(o);
				}
			};
			
			o._wheelCallback = f;
			
			if(!stage._scrollableObjects) stage._scrollableObjects = [];
			stage._scrollableObjects.push(o);
			
			stage.events.emit('scroll:register', { object: o });
		};

		stage.make_clickable = (o, f = false) => {
			o.bring_to_front = () => {
				if (o.parent) {
					o.parent.add(o);
				}
			};
			
			o._clickCallback = f;
			
			if(!stage._clickableObjects) stage._clickableObjects = [];
			stage._clickableObjects.push(o);
			
			stage.events.emit('click:register', { object: o });
		};

		stage.make_draggable = (o, f = false) => {
			o.bring_to_front = () => {
				if (o.parent) {
					o.parent.add(o);
				}
			};

			o._dragCallback = f;
			o.is_dragging = false;
			o.is_drag_moving = false;
			
			if(!stage._draggableObjects) stage._draggableObjects = [];
			stage._draggableObjects.push(o);

			stage.events.emit('drag:register', { object: o });
		};

		// Interactive object event handlers
		stage.events.on('mousedown', (e) => {
			if(stage._draggableObjects && stage.mouse) {
				stage.eachMouseSelect(stage._draggableObjects, (hit) => {
					if(!stage.current_drag_object) {
						let o = hit.object;
						stage.current_drag_object = o;
						o.drag_data = {
							xm_start : e.clientX,
							ym_start : e.clientY,
							x_start : o.position.x,
							y_start : o.position.y,
							z_start : o.position.z,
							target : o,
						};
						o.is_dragging = true;
						stage.events.emit('drag:start', { object: o, data: o.drag_data });
					}
				}, true);
			}
		});

		stage.events.on('mousemove', (e) => {
			if(stage.current_drag_object && stage.current_drag_object.is_dragging) {
				let o = stage.current_drag_object;
				o.drag_data.xm_delta = e.clientX - o.drag_data.xm_start;
				o.drag_data.ym_delta = e.clientY - o.drag_data.ym_start;
				
				let movementX = o.drag_data.xm_delta * 0.01;
				let movementY = -o.drag_data.ym_delta * 0.01;
				
				o.position.x = o.drag_data.x_start + movementX;
				o.position.y = o.drag_data.y_start + movementY;
				
				if(!o.is_drag_moving) {
					o.is_drag_moving = true;
				}
				stage.events.emit('drag:move', { object: o, data: o.drag_data });
			}
		});

		stage.events.on('mouseup', (e) => {
			if(stage.current_drag_object) {
				let o = stage.current_drag_object;
				if(o._dragCallback) o._dragCallback(o);
				stage.current_drag_object = false;
				o.is_dragging = false;
				o.is_drag_moving = false;
				stage.events.emit('drag:end', { object: o, data: o.drag_data });
				o.drag_data = null;
			}
		});

		stage.events.on('click', (e) => {
			if(stage._clickableObjects && stage.mouse) {
				stage.eachMouseSelect(stage._clickableObjects, (hit) => {
					let o = hit.object;
					stage.events.emit('object:click', { object: o, event: e });
					if(o._clickCallback) o._clickCallback(e);
				}, true);
			}
		});

		// Animation system
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

		// Layer management
		stage.layers = {
			add: (name, sortable_children = false) => {
				stage.layerStorage[name] = new THREE.Group();
				stage.root.add(stage.layerStorage[name]);
				console.log('Added layer:', name);
				return stage.layerStorage[name];
			},

			remove: (name) => {
				if (stage.layerStorage[name]) {
					stage.root.remove(stage.layerStorage[name]);
					delete stage.layerStorage[name];
					console.log('Removed layer:', name);
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

		// Director for camera and scene management
		stage.director = {
			camera: {
				zoom: (targetScale) => {
					return stage.director.zoom(stage.camera, targetScale);
				},
				pan: (x, y) => {
					stage.root.position.x = x;
					stage.root.position.y = y;
				},
				reset: () => {
					stage.camera.position.set(0, 0, 30);
					stage.root.position.set(0, 0, 0);
					stage.root.rotation.set(0, 0, 0);
				}
			},

			zoom: (camera, targetZ) => {
				if(camera.director_animation)
					stage.animation.remove(camera.director_animation);
				camera.director_animation = stage.animate((dt) => {
					const currentZ = camera.position.z;
					const lerpFactor = 0.1;

					camera.position.z = currentZ + (targetZ - currentZ) * lerpFactor;

					if (Math.abs(camera.position.z - targetZ) < 0.01) {
						camera.position.z = targetZ;
						camera.director_animation = false;
						return false;
					}
					return true;
				});
			},

			focus_on: (o, should_take_up = 0.8) => {
				const box = new THREE.Box3().setFromObject(o);
				const size = box.getSize(new THREE.Vector3());
				const center = box.getCenter(new THREE.Vector3());
				
				if(o.bring_to_front) o.bring_to_front();
				
				let distance = Math.max(size.x, size.y, size.z) / should_take_up;
				if(should_take_up < 0) distance = stage.camera.position.z;
				
				let targetZ = distance;
				let targetX = -center.x;
				let targetY = -center.y;
				
				if(stage.root.director_animation)
					stage.animation.remove(stage.root.director_animation);

				stage.root.director_animation = stage.animate((dt) => {
					const lerpFactor = 0.1;

					if(should_take_up > 0)
						stage.camera.position.z += (targetZ - stage.camera.position.z) * lerpFactor;

					stage.root.position.x += (targetX - stage.root.position.x) * lerpFactor;
					stage.root.position.y += (targetY - stage.root.position.y) * lerpFactor;

					if ((should_take_up < 0 || Math.abs(stage.camera.position.z - targetZ) < 0.01) &&
						Math.abs(stage.root.position.x - targetX) < 0.01 &&
						Math.abs(stage.root.position.y - targetY) < 0.01) {
						if(should_take_up > 0)
							stage.camera.position.z = targetZ;
						stage.root.position.set(targetX, targetY, stage.root.position.z);
						stage.root.director_animation = false;
						return false;
					}
					return true;
				});
			},

			getStageBounds: (container = null) => {
				if (!container) {
					container = stage.root;
				}
				
				const box = new THREE.Box3();
				let hasObjects = false;
				
				container.traverse((object) => {
					if (object.visible && object.geometry) {
						box.expandByObject(object);
						hasObjects = true;
					}
				});
				
				if (!hasObjects) {
					return { x: 0, y: 0, z: 0, width: 100, height: 100, depth: 100 };
				}
				
				const size = box.getSize(new THREE.Vector3());
				const min = box.min;
				
				return {
					x: min.x,
					y: min.y,
					z: min.z,
					width: size.x,
					height: size.y,
					depth: size.z
				};
			},

			centerViewOnBounds: (bounds = null, padding = 0.6) => {
				if (!bounds) {
					bounds = stage.director.getStageBounds();
				}
				
				const centerX = bounds.x + bounds.width / 2;
				const centerY = bounds.y + bounds.height / 2;
				const centerZ = bounds.z + bounds.depth / 2;
				
				const maxSize = Math.max(bounds.width, bounds.height, bounds.depth);
				const targetZ = maxSize / padding;
				
				const targetX = -centerX;
				const targetY = -centerY;
				
				if (stage.camera.director_animation) {
					stage.animation.remove(stage.camera.director_animation);
				}
				
				stage.camera.director_animation = stage.animate((dt) => {
					const lerpFactor = 0.1;
					
					stage.root.position.x += (targetX - stage.root.position.x) * lerpFactor;
					stage.root.position.y += (targetY - stage.root.position.y) * lerpFactor;
					stage.camera.position.z += (targetZ - stage.camera.position.z) * lerpFactor;

					const distance = Math.abs(targetX - stage.root.position.x) + 
									Math.abs(targetY - stage.root.position.y) + 
									Math.abs(targetZ - stage.camera.position.z);
					if (distance < 0.1) {
						stage.root.position.x = targetX;
						stage.root.position.y = targetY;
						stage.camera.position.z = targetZ;
						return false;
					}
					
					return true;
				});
			},
		};

		// Initialize materials and shapes
		stage.mat = {
			cursor: new THREE.MeshLambertMaterial({ 
				color: 0x156289, 
				emissive: 0x072534, 
				side: THREE.DoubleSide, 
				flatShading: true, 
				transparent: true, 
				opacity: 0.25 
			}),
			line: new THREE.LineBasicMaterial({ 
				color: 0x88ccff, 
				linewidth: 1 
			})
		};

		stage.shapes = {};

		await stage.init();
		return stage;
	},

}

return ThreeStage;

}));

