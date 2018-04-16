var Game = {
  
  init : function(stage, frame_info_element) {
    
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
      frame_info_element.text(inf.fps+'FPS');      
    })
    
    console.log('Pan stage with right mouse button');

    Game.createDemoObject();
  },
  
  createDemoObject : function() {
    
    // http://pixijs.download/dev/docs/index.html
    
    var r = new PIXI.Graphics();
    r.beginFill(0xffffff, 1.0);
    r.drawRect(-50, -50, 100, 100);
    r.position.x = 0;
    r.position.y = 0;
    Stage.root.addChild(r);

    Stage.animate(function(deltaTime) {
      r.rotation += -deltaTime;
      return(true);
    });

    var t = new PIXI.Text('Hello World',{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
    t.position.x = 0;
    t.position.y = 0;
    Stage.root.addChild(t);
    
    Stage.animation.add(function(deltaTime) {
      t.rotation += deltaTime;
    });
    
  },
  
}
