
(function(){
	async function initGame() {
        Keyboard.keybindings = Keyboard.keybindings_default;

		let stage = await PixiStage.create();
		stage.layers.add('world');

		let nav = document.querySelector('nav');
		if (nav) nav.textContent = document.title;

		stage.event_handlers.wheel = (e) => {
			//if (e.deltaY > 0) stage.app.stage.target_scale *= 0.9; else stage.app.stage.target_scale *= 1.1;
			//stage.app.stage.target_scale = clamp(stage.app.stage.target_scale, stage.params.zoom.min, stage.params.zoom.max);
			//stage.director.zoom(stage.app.stage, stage.app.stage.target_scale);
		};

		let world = stage.layers.get('world');

		let COLORS = { bg: 0x11131a, ground: 0x3a3f5a, platform: 0x556080, player: 0xffe066 };
		stage.app.renderer.background.color = COLORS.bg;

		let platforms = [
			{ x: -400, y: 300, w: 1200, h: 40 },
			{ x: -300, y: 180, w: 160, h: 20 },
			{ x: -40,  y: 120, w: 160, h: 20 },
			{ x: 240,  y: 80,  w: 160, h: 20 },
			{ x: 520,  y: 40,  w: 160, h: 20 }
		];

		for (let p of platforms) {
			let g = new PIXI.Graphics();
			g.beginFill(p.y >= 300 ? COLORS.ground : COLORS.platform);
			g.drawRect(0, 0, p.w, p.h);
			g.endFill();
			g.x = p.x; g.y = p.y;
			world.addChild(g);
		}

		let player = new PIXI.Graphics();
		let pw = 32, ph = 48;
		player.beginFill(COLORS.player);
		player.drawRect(0, 0, pw, ph);
		player.endFill();
		player.x = -360;
		player.y = 300 - ph;
		world.addChild(player);

		let state = {
			pos: { x: player.x, y: player.y },
			vel: { x: 0, y: 0 },
			acc: { x: 0, y: 0 },
			grounded: false,
		};

		let physics = {
			GRAVITY: 1600,
			MOVE_SPEED: 1200,
			JUMP_SPEED: 700,
		};

		Keyboard.listen();

		function aabbIntersect(ax, ay, aw, ah, bx, by, bw, bh) {
			return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
		}

		function resolveCollisions(px, py, vx, vy) {
			let nx = px;
			let ny = state.pos.y;
			for (let p of platforms) {
				if (!aabbIntersect(nx, ny, pw, ph, p.x, p.y, p.w, p.h)) continue;
				if (vx > 0) nx = Math.min(nx, p.x - pw);
				else if (vx < 0) nx = Math.max(nx, p.x + p.w);
				state.vel.x = 0;
			}
			ny = py;
			let onGround = false;
			for (let p of platforms) {
				if (!aabbIntersect(nx, ny, pw, ph, p.x, p.y, p.w, p.h)) continue;
				if (vy > 0) { ny = Math.min(ny, p.y - ph); onGround = true; }
				else if (vy < 0) { ny = Math.max(ny, p.y + p.h); }
				state.vel.y = 0;
			}
			return { x: nx, y: ny, onGround };
		}

		function update(dt) {
			dt = Math.min(dt, 1/30);
			let move = 0;
			if (Keyboard.keys['move_left']) move -= 1;
			if (Keyboard.keys['move_right']) move += 1;
			state.acc.x = dt * move * physics.MOVE_SPEED * 10.0;
			state.vel.x += (state.acc.x - state.vel.x) * Math.min(1, dt * 10);
			if (Keyboard.keys['jump'] && state.grounded) {
				state.vel.y = -physics.JUMP_SPEED;
				state.grounded = false;
			}
			state.vel.y += physics.GRAVITY * dt;
			let nextX = state.pos.x + state.vel.x * dt;
			let nextY = state.pos.y + state.vel.y * dt;
			let res = resolveCollisions(nextX, nextY, state.vel.x, state.vel.y);
			state.pos.x = res.x;
			state.pos.y = res.y;
			state.grounded = res.onGround;
			player.x = state.pos.x;
			player.y = state.pos.y;
			stage.director.focus_on(player, 0.25);
			document.getElementById('frame-rate').innerText = `FPS: ${stage.app.ticker.FPS.toFixed(2)}`;
		}

		stage.app.ticker.add(() => {
			let dt = stage.app.ticker.deltaMS / 1000;
			update(dt);
		});

		stage.director.focus_on(player);
	}

	window.addEventListener('load', initGame);
})();
