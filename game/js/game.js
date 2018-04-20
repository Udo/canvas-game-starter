var Game = {
  
  stage : false,
  
  init : function(stage, frame_info_element) {
    
    Game.stage = stage;
    
    stage.on('mousedown_right', function(m) {
      stage.root.dragStart();
    });

    stage.on('mousemove', function(m) {          
      if(m.rightButton) {
        if(Math.abs(m.xd) > 3 || Math.abs(m.yd) > 3) {
          stage.panBy(m.xd, m.yd);
        }
        return;
      }    
    });
    
    stage.on('frameinfo', function(inf) { 
      frame_info_element.text(inf.fps+'FPS '+stage.root.children.length);      
    })
    
    Game.createDemoObject();
  },
  
  createDemoObject : function() {
    var scene = Game.stage.root;
    Game.stage.renderer.setClearColor( 0x000033, 1 );
    
    var lights = [];
    lights[ 0 ] = new THREE.PointLight( 0xaaffff, 1, 0 );
    lights[ 1 ] = new THREE.PointLight( 0xffaaff, 1, 0 );
    lights[ 2 ] = new THREE.PointLight( 0xffffaa, 1, 0 );

    lights[ 0 ].position.set( 0, 200, 0 );
    lights[ 1 ].position.set( 100, 200, 100 );
    lights[ 2 ].position.set( - 100, - 200, - 100 );

    scene.add( lights[ 0 ] );
    scene.add( lights[ 1 ] );
    scene.add( lights[ 2 ] );
    
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( geometry, material );
    scene.add(cube);
    Game.stage.camera.position.z = 1.5;
    
    Game.stage.animate(function(dt) {
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.005;
      });
  },
  
}
