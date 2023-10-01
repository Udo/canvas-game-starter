function PixiStage2(opt = {}) {

	this.options = opt;

	this.size = {};
	this.layers = {};
	this.debug = {};
	this.mouse = {};
	this.root = {};
	this.map_root = {};
	this.event_handlers = {};
	var stage = this;
	var animation = [];

	this.trigger = function() {
		if(stage.options.stopped || stage.options.stopEvents)
			return;
		var params = [...arguments];
		let event_name = params.shift();
		var ret = false;
		if(stage.event_handlers[event_name]) each(stage.event_handlers[event_name], (eh) => {
			var r = eh(...params);
			if(r) ret = r;
			if(r == 'remove') this.off(event_name, eh);
		});
		return(ret);
	}

	this.animate = (f) => {
		this.animation.add(f);
	}

	var animation = {

		list : [],
		commandList : [],
		queueSlots : {},
		queueSlotsActive : {},

		add : function(f, optionalQueueSlotID) {
			if(optionalQueueSlotID) {
				f.queueSlot = optionalQueueSlotID;
				if(animation.queueSlotsActive[optionalQueueSlotID]) {
					// if there is an active animation in this slot, we need to queue
					if(!animation.queueSlots[optionalQueueSlotID])
						animation.queueSlots[optionalQueueSlotID] = [f];
					else
						animation.queueSlots[optionalQueueSlotID].push(f);
				} else {
					animation.queueSlotsActive[optionalQueueSlotID] = true;
					animation.add(f);
				}
			} else {
				animation.list.push(f);
				//trigger('animationstart', f, animation.list.length-1);
			}
		},

		remove : function(f) {
			var idx = animation.list.indexOf(f);
			if(idx > -1) {
				//trigger('animationend', f, idx);
				animation.list.splice(idx, 1);
			}
			if(f.queueSlot) {
				var qs = animation.queueSlots[f.queueSlot];
				if(qs && qs.length > 0) {
					var next = qs.shift();
					if(qs.length == 0) {
						delete animation.queueSlots[f.queueSlot];
						animation.queueSlotsActive[optionalQueueSlotID] = false;
					}
					animation.add(next);
				}
			}
		},

		doAll : function(deltaTime) {
			each(animation.list, (f) => {
				try {
					if(typeof f == 'function') {
						var r = f(deltaTime);
						if(r === false) {
							animation.remove(f);
						}
					}
				} catch(ee) {
					console.error('error during animation', ee);
					animation.remove(f);
				}
			});
		},

	};
	this.animation = animation;

	this.on = (eventName, handlerFunc) => {
		if(!this.event_handlers[eventName])
			this.event_handlers[eventName] = [];
		this.event_handlers[eventName].push(handlerFunc);
	}

	this.off = (eventName, handlerFunc) => {
		if(!this.event_handlers[eventName])
			return;
		var idx = this.event_handlers[eventName].indexOf(handlerFunc);
		if(idx > -1)
			this.event_handlers[eventName].splice(idx, 1);
	}

	this.resize = () => {
		this.size = {
			x : $(document).width(),
			y : $(document).height(),
		};
		this.renderer.resize(this.size.x, this.size.y);
		this.trigger('resize', this.size);
	}

	var mouse_button = (e, down) => {
		this.mouse.anyButton = down;
		if(e.which == 1 || e.button == 0) {
			this.mouse.leftButton = down;
			this.mouse.buttonContext = 'left';
		} else if(e.which == 2 || e.button == 1) {
			this.mouse.middleButton = down;
			this.mouse.buttonContext = 'middle';
		} else if(e.which == 3 || e.button == 2) {
			this.mouse.rightButton = down;
			this.mouse.buttonContext = 'right';
		} else {
			this.mouse.otherButton = e.which+':'+e.button;
		}
	}

	var mousedown = (e) => {
		mouse_button(e, true);
		this.mouse.x0 = this.mouse.screenX;
		this.mouse.y0 = this.mouse.screenY;
		this.trigger('mousedown', this.mouse, this.mouse.buttonContext);
		this.trigger('mousedown_'+this.mouse.buttonContext, this.mouse);
	}

	var mousemove = (e) => {
		var x = e.offsetX;
		var y = e.offsetY;
		this.mouse.screenX = x;
		this.mouse.screenY = y;
		this.mouse.x = ((x - this.map_root.position.x) / this.map_root.scale.x) + this.map_root.pivot.x;
		this.mouse.y = ((y - this.map_root.position.y) / this.map_root.scale.y) + this.map_root.pivot.y;
		if(this.mouse.anyButton) {
			this.mouse.xd = (this.mouse.screenX - this.mouse.x0) / this.map_root.scale.x;
			this.mouse.yd = (this.mouse.screenY - this.mouse.y0) / this.map_root.scale.y;
		}
		this.trigger('mousemove', this.mouse, e);
	}

	var mouseup = (e) => {
		mouse_button(e, false);
		this.trigger('mouseup', this.mouse, this.mouse.buttonContext);
		this.trigger('mouseup_'+this.mouse.buttonContext, this.mouse);
		if(this.mouse.x0 == this.mouse.screenX &&
			this.mouse.y0 == this.mouse.screenY)
			this.trigger('click', this.mouse);
	}

	var mouseout = (e) => {
		var buttonProps = ['left', 'middle', 'right', 'any'];
		this.trigger('mouseout', this.mouse);
	}

	var mouseenter = (e) => {
		this.trigger('mouseenter', this.mouse);
	}

	var mousewheel = (e) => {
		if(this.options.zoomStep == 0)
			return;
		if(e.wheelDeltaY < 0) {
			this.zoom(this.mouse.zoom - this.options.zoomStep);
		} else if(e.wheelDeltaY > 0) {
			this.zoom(this.mouse.zoom + this.options.zoomStep);
		}
		this.trigger('wheel', e.wheelDeltaY, e.wheelDeltaX);
	}

	this.create_renderer = () => {
		this.renderer = PIXI.autoDetectRenderer(
			this.size.x,
			this.size.y,
			{
				transparent : false,
				autoResize : true,
				antialias : false,
			}
		);
		document.body.appendChild(this.renderer.view);

		this.root = new PIXI.Container();
		this.map_root = new PIXI.Container();
		this.root.addChild(this.map_root);

		$('canvas').on('contextmenu', (e) => {
			e.preventDefault();
			return(false);
		}); // disable right click
		$(window).on('resize', this.resize);
		$(this.renderer.view).on('mousedown', mousedown);
		$(this.renderer.view).on('mouseup', mouseup);
		$(this.renderer.view).on('mouseout', mouseout);
		$(this.renderer.view).on('mouseenter', mouseenter);
		$(this.renderer.view).on('mousemove', mousemove);
		$(this.renderer.view).on('mousewheel', mousewheel);
		$(this.renderer.view).on('DOMMouseScroll', mousewheel);
		this.resize();
		this.debug.animationTimestamp = new Date().getTime();
		this.debug.renderTimestamp = new Date().getTime();
	}

	this.render_stats = (frame_start_time) => {
		const ct = new Date().getTime();
		this.debug.frameInterval =
			((this.debug.frameInterval || 10)*0.97) +
			((frame_start_time-this.debug.renderTimestamp)*0.03);
		this.debug.fps = Math.round(1000/this.debug.frameInterval);
		this.debug.threadLoad = (this.debug.threadLoad || 0)*0.97 + (ct-frame_start_time)*0.03;
		var loadpct = Math.round(100*this.debug.threadLoad/this.debug.frameInterval);
		if(loadpct < 10) loadpct = '0'+loadpct;
		if(loadpct > this.options.frameSkipThreshold) {
			this.debug.frameSkipStatus += 1;
			this.debug.frameSkipCounter += 1;
		}
		this.debug.threadLoadPercent = loadpct;
		this.debug.renderTimestamp = frame_start_time;
		this.debug.animationTimestamp = frame_start_time;
		this.trigger('frameinfo', this.debug);
	}

	this.speed_step = 1;

	this.render = () => {
		if(this.debug.frameSkipStatus > 0) {
			this.debug.frameSkipStatus -= 1;
		}
		else if(!this.options.stopAnimation) {
			const frame_start_time = new Date().getTime();
			/*if(this.map_root.scale.x != this.mouse.zoom) {
				if(this.options.smoothZoom) {
					this.map_root.scale.x =
						(this.options.smoothZoom*this.map_root.scale.x) +
						(1-this.options.smoothZoom)*this.mouse.zoom;
					this.map_root.scale.y =
						(this.options.smoothZoom*this.map_root.scale.y) +
						(1-this.options.smoothZoom)*this.mouse.zoom;
				}	else {
					this.map_root.scale.x = this.mouse.zoom;
					this.map_root.scale.y = this.mouse.zoom;
				}
			}*/
			var dt = (frame_start_time - this.debug.animationTimestamp) / 1000;
			this.speed_step = clamp(this.speed_step+dt*0.5, 0, 1);
			dt = dt*this.speed_step;
			this.trigger('animate', dt);
			this.animation.doAll(dt);
			this.renderer.render(this.root);
			this.render_stats(frame_start_time);
		}
		if(!this.options.stopped)
			requestAnimationFrame(this.render);
	}

	this.create_layer = (name, parent = false) => {
		if(this.layers[name])
			return(this.layers[name]);
		this.layers[name] = new PIXI.Container();
		if(!parent) parent = this.map_root;
		parent.addChild(this.layers[name]);
		return(this.layers[name]);
	}

	this.start = function() {
		const frame_start_time = new Date().getTime();
		this.render_stats(frame_start_time);
		this.options.stopAnimation = false;
		this.options.stopped = false;
		this.options.stopEvents = false;
		this.render();
	};

	this.stop = function() {
		this.options.stopped = true;
		this.options.stopAnimation = true;
		this.options.stopEvents = true;
	};

	var drag_start = (o, e, button) =>	{
		if(this.mouse.drag_object || o.drag_button != button)
			return;
		if(o.ondrag_start && o.ondrag_start(o, e, button) === 'cancel')
			return;
		o.drag_start_pos_x = o.x;
		o.drag_start_pos_y = o.y;
		o.drag_local_start_pos = e.data.getLocalPosition(o);
		o.drag_data = e.data;
		this.mouse.drag_object = o;
		this.mouse.dragging = true;
	}

	var drag_end = (o, e) => {
		this.mouse.drag_object = false;
		this.mouse.dragging = false;
		o.drag_data = false;
		if(o.ondrag_end && o.ondrag_end(o, e) === 'cancel') {
			o.x = o.drag_start_pos_x;
			o.y = o.drag_start_pos_y;
		}
	}

	var drag_move = (o, e) => {
		if (this.mouse.drag_object == o) {
			var newPosition = o.drag_data.getLocalPosition(o.parent);
			o.position.x = newPosition.x - o.drag_local_start_pos.x;
			o.position.y = newPosition.y - o.drag_local_start_pos.y;
			if(o.ondragmove)
				o.ondragmove(o, e);
		}
	}

	this.make_draggable = (o, mouse_button = 'left') => {
		o.interactive = true;
		o.drag_button = mouse_button;
		o
			.on('rightdown', 	(e) => { drag_start(o, e, 'right') })
			.on('mousedown', 	(e) => { drag_start(o, e, 'left') })
			.on('touchstart', 	(e) => { drag_start(o, e, 'left') })
			.on('mouseup', 		(e) => { drag_end(o, e) })
			.on('rightup', 		(e) => { drag_end(o, e) })
			.on('mouseupoutside', (e) => { drag_end(o, e) })
			.on('touchend', 	(e) => { drag_end(o, e) })
			.on('touchendoutside', (e) => { drag_end(o, e) })
			.on('mousemove', 	(e) => { drag_move(o, e) })
			.on('touchmove', 	(e) => { drag_move(o, e) })
	}

	this.create_renderer();
	this.start();

}
