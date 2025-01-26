function mapkey_to_xy(s) {
	if(!s) return [];
	return s.split(':');
}

function update_gameobject_position(o, x, y) {
	o.position.x = Graphics.grid_size * x;
	o.position.y = Graphics.grid_size * y;
}

Graphics = {

	mesh : {},
	geo : {},
	mat : {},

	grid_size : 4,

	look_at : (x, y) => {
		Graphics.stage.camera.position.x = Graphics.grid_size * x;
		Graphics.stage.camera.position.y = Graphics.grid_size * (y - 3);
	},

	go : {

	},

	handlers : {

		reset : () => {
			Graphics.stage.root.rotation.x = -0.5;
			Graphics.stage.root.rotation
			Graphics.stage.root.clear();
			Graphics.stage.animation.list.length = 0;
			Graphics.create.lights();
			Graphics.go = {};
			Graphics.stage.animate((dt) => {
				if(Graphics.go.player) {
					Graphics.stage.camera.position.x =
						Graphics.stage.camera.position.x*0.9 + Graphics.go.player.position.x*0.1;
					Graphics.stage.camera.position.y =
						Graphics.stage.camera.position.y*0.9 + Graphics.go.player.position.y*0.1;
				}
			});
		},

		newmap : () => {
			Graphics.handlers.reset();
			Graphics.create.map();
			Graphics.create.player();
		},

	},

	create : {

		map : () => {
			each(Game.state.map.plan, (cell, kp) => {
				let pos = mapkey_to_xy(kp);
				let cg = Graphics.mesh.box.clone();
				update_gameobject_position(cg, pos[0], pos[1]);
				cg.position.z = cell.type == 0 ? 0 : Graphics.grid_size;
				Graphics.stage.root.add(cg);
			});

			Graphics.look_at(Math.round(Game.state.map.x_max/2), Math.round(Game.state.map.y_max/2));
		},

		player : () => {
			var po = Graphics.go.player = new THREE.Mesh( Graphics.geo.box, Graphics.mat.player );
			update_gameobject_position(po, 2, 2);
		},

		lights : () => {
			var light = new THREE.PointLight( 0xff0000, 1, 100 );
			light.position.set( 0, 50, 50 );
			Graphics.stage.root.add( light );

			light = new THREE.PointLight( 0x00ff00, 1, 100 );
			light.position.set( 50, -50, -50 );
			Graphics.stage.root.add( light );

			var ambient = new THREE.AmbientLight( 0x404040 ); // soft white light
			Graphics.stage.root.add( ambient );
		},

	},

	init : () => {

		var stage = Graphics.stage;

		stage.start();
		Graphics.create.lights();

		Graphics.geo.box = new THREE.BoxBufferGeometry(
			Graphics.grid_size, Graphics.grid_size, Graphics.grid_size );
		Graphics.mat.default = new THREE.MeshStandardMaterial(
			{color: 0xaaaaaa, metalness : 0.5, roughness : 0.5, } );
		Graphics.mat.player = new THREE.MeshStandardMaterial(
			{color: 0x88cc88, metalness : 0.5, roughness : 0.5, } );
		Graphics.mesh.box = new THREE.Mesh( Graphics.geo.box, Graphics.mat.default );
		let cube = Graphics.mesh.box.clone();
		stage.root.add( cube );

		stage.animate(function(dt) {

			cube.rotation.x += dt;
			cube.rotation.y += dt*2;

			return(true);

		});

		Events.batch_subscribe(Graphics.handlers);

		return(true);
	},

}
