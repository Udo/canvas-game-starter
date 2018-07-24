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
    
  },
  
}
