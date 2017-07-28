var Stage = {  

  size : false, 
  fpsIndicatorElement : false,
  renderer : false,
  container : false,
  
	/** initialize the stage with Pixi.js */
	init : function() {
  	this.size = this.getViewportSize();
  	this.fpsIndicatorElement = $('#frame-rate');
		this.renderer = PIXI.autoDetectRenderer(
  		this.size.x, 
			this.size.y, {
  			transparent : true,
  			autoResize : true,
  		});
		document.body.appendChild(this.renderer.view);
    this.container = merge(new PIXI.Container(), {
      //pivot : { x : Stage.size.x/2, y : Stage.size.y/2 },
    	});
		$( window ).on('resize' , function(){    
  		Stage.renderer.resize($(document).width(), $(document).height());
    });
    this.lastAnimationTimestamp = new Date().getTime();
	},
	
	/** @returns {PointXY} viewport dimensions */
	getViewportSize : function() {
		return({
			x : $(document).width(), 
			y : $(document).height(), 
			});
	},

	/** Animation functions 
  	* @namespace
  	* @prop list {array} - list of all active animations
  	*/
  animation : {
    paused : false,
    list : [],
  	/** add an animation function 
    	* @param {function} f
    	*/
    add : function(f) { 
      Stage.animation.list.push(f); 
    },
  	/** remove an animation function 
    	* @param {function} f
    	*/
    remove : function(f) {
      var idx = Stage.animation.list.indexOf(f);
      if(idx > -1) Stage.animation.list.splice(idx, 1);
    },
  	/** execute all stage animations
    	*/
    doAll : function(deltaTime) {
      each(Stage.animation.list, function(f) {
        try {
          if(typeof f !== 'function' || f(deltaTime) == 'done')
            Stage.animation.remove(f);
        } catch(ee) {
          console.error('error during animation', ee);
          Stage.animation.remove(f);
        }
      });
    },
  },

	/** render and animate (this function gets called automatically for
    * every frame)
  	*/
  animate : function() {
  	if(!Stage.animation.paused) {
  		const startTimestamp = new Date().getTime();
  		
  		Stage.animation.doAll((startTimestamp - Stage.lastAnimationTimestamp) / 1000);
      Stage.renderer.render(Stage.container);
  
  		const currentTimestamp = new Date().getTime();
  		Stage.currentThreadLoad = (Stage.currentThreadLoad || 0)*0.98 + (currentTimestamp-startTimestamp)*0.02;
  		var msFree = Math.round((Stage.currentThreadLoad)/(10/60));
  		if(msFree < 10) msFree = '0'+msFree;
  		Stage.currentRenderInterval = 
  		  ((Stage.currentRenderInterval || 10)*0.98) + 
  		  ((currentTimestamp-Stage.lastRenderTimestamp)*0.02);
  		Stage.fpsIndicatorElement.text(Math.round(1000/Stage.currentRenderInterval)+'fps CPU:'+msFree+'%');
  		Stage.lastRenderTimestamp = currentTimestamp;
  		Stage.lastAnimationTimestamp = currentTimestamp;
  	}
  	
    requestAnimationFrame(Stage.animate);
	},
	
}


