let PixiStage = {

	state : {

	},

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

	init : async () => {
		let app = PixiStage.app = new PIXI.Application();
		await app.init({ width: window.innerWidth, height: window.innerHeight });
		document.body.appendChild(app.view);
		window.addEventListener('resize', () => {
			app.renderer.resize(window.innerWidth, window.innerHeight);
		});
		app.ticker.add(PixiStage.do_animations);
		app.stage.target_scale = 1;
		app.view.addEventListener('wheel', (event) => {
			if(PixiStage.state.could_scroll)
				PixiStage.state.could_scroll.emit('wheel', event);
			else if(PixiStage.event_handlers.wheel)
				PixiStage.event_handlers.wheel(event);
		});
		app.view.addEventListener('mousedown', (e) => {
			PixiStage.state['mouse_button_'+e.button] = true;
			PixiStage.state.mouse = {
				x_down : e.clientX,
				y_down : e.clientY,
				x_down_stage : PixiStage.app.stage.x,
				y_down_stage : PixiStage.app.stage.y,
			}
			console.log('down');
		});
		app.view.addEventListener('mousemove', (e) => {
			if(PixiStage.state['mouse_button_'+PixiStage.params.stage.drag_button] &&
				!PixiStage.current_drag_object) {
				let scale = PixiStage.app.stage.scale.x;
				PixiStage.state.mouse.x_diff = (e.clientX-PixiStage.state.mouse.x_down);
				PixiStage.state.mouse.y_diff = (e.clientY-PixiStage.state.mouse.y_down);
				if(PixiStage.params.stage.draggable) {
					if(app.stage.director_animation)
						PixiStage.cancel_animation(app.stage.director_animation);
					PixiStage.app.stage.x = PixiStage.state.mouse.x_diff+PixiStage.state.mouse.x_down_stage;
					PixiStage.app.stage.y = PixiStage.state.mouse.y_diff+PixiStage.state.mouse.y_down_stage;
				}
			}
		});
		app.view.addEventListener('mouseup', (e) => {
			PixiStage.state['mouse_button_'+e.button] = false;
		});
		PIXI.Container.prototype.bring_to_front = function () {
			this.parent.setChildIndex(this, this.parent.children.length - 1);
		};
		PIXI.Container.prototype.send_to_back = function () {
			this.parent.setChildIndex(this, 0);
		};
		PIXI.Container.prototype.make_draggable = function () {
			PixiStage.make_draggable(this);
		};
		PIXI.Container.prototype.make_scrollable = function () {
			PixiStage.make_scrollable(this);
		};
		PIXI.Container.prototype.make_clickable = function (f) {
			PixiStage.make_clickable(this, f);
		};
		return app;
	},

	current_drag_object : false,

	make_scrollable : (o, f = false) => {
		o.interactive = true;
		o.on('mouseover', (e) => {
			PixiStage.state.could_scroll = o;
		});
		o.on('mouseout', (e) => {
			if(PixiStage.state.could_scroll == o)
				PixiStage.state.could_scroll = false;
		});
		if(f)
			o.on('wheel', f);
	},

	make_clickable : (o, f = false) => {
		o.interactive = true;
		o.on('click', f);
	},

	make_draggable : (o, f = false) => {
		o.interactive = true;

		o.on_drag_or_click_start = (e) => {
			if(PixiStage.current_drag_object ||
				e.target != o) return;
			PixiStage.current_drag_object = e.target;
			o.drag_data = {
				xm_start : e.client.x,
				ym_start : e.client.y,
				x_start : o.x,
				y_start : o.y,
				target : o,
			};
			o.emit('pick', { type: 'dragevent', data: o.drag_data, });
			o.is_dragging = true;
			window.addEventListener('mousemove', o.on_drag_move);
		}

		o.on_drag_end = () => {
			if(!o.is_dragging) return;
			if(f) f(o);
			window.removeEventListener('mousemove', o.on_drag_move);
			PixiStage.current_drag_object = false;
			o.is_dragging = false;
			o.is_drag_moving = false;
			o.drag_data = null;
			o.emit('dragend', { type: 'dragevent', data: o.drag_data, });
		}

		o.on_drag_move = (e) => {
			if(!o.is_dragging) return;
			o.drag_data.xm_delta = e.clientX - o.drag_data.xm_start;
			o.drag_data.ym_delta = e.clientY - o.drag_data.ym_start;
			o.x = o.drag_data.xm_delta/PixiStage.app.stage.scale.x + o.drag_data.x_start;
			o.y = o.drag_data.ym_delta/PixiStage.app.stage.scale.y + o.drag_data.y_start;
			if(!o.is_drag_moving) {
				o.is_drag_moving = true;
				o.emit('dragstart', { type: 'dragevent', data: o.drag_data, });
			}
			o.emit('dragmove', { type: 'dragevent', data: o.drag_data, });
		}

		o.on('pointerdown', o.on_drag_or_click_start);
		o.on('pointerup', o.on_drag_end);
		o.on('pointerupoutside', o.on_drag_end);
	},

	animations : [],

	animate : (f) => {
		PixiStage.animations.push(f);
		return(f);
	},

	cancel_animation : (f) => {
		PixiStage.animations = PixiStage.animations.filter(anim => anim !== f);
	},

	do_animations : (delta) => {
		let dt = delta.deltaTime;
		PixiStage.animations = PixiStage.animations.filter((f) => f(dt) !== false);
	},

	layers : {},

	add_layer : (name) => {
		PixiStage.layers[name] = new PIXI.Container();
		PixiStage.app.stage.addChild(PixiStage.layers[name]);
		return(PixiStage.layers[name]);
	},

	director : {

		zoom : (o, targetScale) => {
			let app = PixiStage.app;
			if(app.stage.director_animation)
				PixiStage.cancel_animation(app.stage.director_animation);
			app.stage.director_animation = PixiStage.animate((dt) => {
				const currentScale = app.stage.scale.x;
				const lerpFactor = 0.1;

				app.stage.scale.set(currentScale + (targetScale - currentScale) * lerpFactor);

				if ((Math.abs(app.stage.scale.x - targetScale) < 0.01)) {
					app.stage.scale.set(targetScale);
					o.director_animation = false;
					return false;
				}
				return true;
			});
		},

		focus_on : (o, should_take_up = 0.8) => {
			let app = PixiStage.app;
			const scaleX = app.renderer.width / o.width;
			const scaleY = app.renderer.height / o.height;
			let scale = Math.min(scaleX, scaleY) * should_take_up;
			o.bring_to_front();
			if(should_take_up < 0)
				// if should_take_up is negative, we're not going to change the zoom level
				scale = app.stage.scale.x;
			let targetScale = scale;
			let targetX = -(o.x * targetScale - app.renderer.width / 2 + (o.width * targetScale) / 2);
			let targetY = -(o.y * targetScale - app.renderer.height / 2 + (o.height * targetScale) / 2);
			if(app.stage.director_animation)
				PixiStage.cancel_animation(app.stage.director_animation);

			app.stage.director_animation = PixiStage.animate((dt) => {
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

	},

}
