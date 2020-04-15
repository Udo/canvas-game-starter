var Game = {
	
	stage : false,
	
	debugInfo : {
		lastRenderTime : 0,
	},
	
	state : {
		
	},
	
	init : function(stage, frame_info_element) {
		
		Game.stage = stage;
		
		stage.on('mousedown_right', function(m) {
			if(stage.root.dragStart)
				stage.root.dragStart();
		});

		stage.on('wheel', function(m) {		
			console.log('wheel', m);
		});

		stage.on('mousemove', function(m) {		
			if(m.rightButton) {
				//if(Math.abs(m.xd) > 3 || Math.abs(m.yd) > 3) {
					stage.panBy(m.xd, m.yd);
				//}
				return;
			}		
		});
		
		stage.on('frameinfo', function(inf) {			 
			frame_info_element.text('FPS:'+inf.fps+' CPU:'+inf.threadLoadPercent+'%');			
		})
		
	},
	
}
