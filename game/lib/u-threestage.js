var ThreeStage = {
  
  implementation : {
    
    layers : {
      
    	create : function(name) {
      	var layer = new THREE.Object3D();
      	while(!name || this.layers[name])
      	  name = 'L'+(this._idCtr++);
        layer.name = name;
        this.layers[name] = layer;
        this.root.add(layer);
        return(layer);
    	},
    	
    	remove : function(name) {
      	var l = this.layers[name];
      	if(l) {
        	this.root.remove(l);
        	return(true);
      	}
      	return(false);
    	},	
      
    },

    bind : function(self, source, destination) {
      if(!destination)
        destination = {};
      for(var prop in source) if(source.hasOwnProperty(prop)) {
        if(typeof source[prop] == 'function')
          destination[prop] = source[prop].bind(self); 
        else 
          destination[prop] = source[prop];
      }
      return(destination);
    },

  	functions : {
    	
    	eachMouseSelect : function(objects, f, recurse) {
        if(!this.raycaster)
          return;
        this.raycaster.setFromCamera(this.mouse, this.camera);
      	var intersects = this.raycaster.intersectObjects( objects, recurse );
      	for ( var i = 0; i < intersects.length; i++ ) {
          f(intersects[ i ], i);
      	}
    	},
    	
    	getNearestMouseIntersect : function(objects, recurse) {
      	var result = false;
      	this.eachMouseSelect(objects, function(hit) {
        	if(result === false || result.distance > hit.distance) 
        	  result = hit;
        	}, recurse);
        return(result);
    	},

      clamp : function(v, min, max) {
        if(v < min)
          v = min;
        if(v > max)
          v = max;
        return(v);
      },
    
      makeDraggable : function(o, dragProp) {
        var stage = this;
        o.dragStart = function() {
          stage.mouse.x0 = stage.mouse.x;
          stage.mouse.y0 = stage.mouse.y;
          stage.mouse.ex0 = o.position.x;
          stage.mouse.ey0 = o.position.y;
        }
      },
    	
    	getViewportSize : function() {
    		return({
    			x : $(document).width(), 
    			y : $(document).height(),
    			xMid : Math.round($(document).width()/2),
    			yMid : Math.round($(document).height()/2),
    			});
    	},
    	
    	trigger : function(eventName, param1, param2, param3) {
      	if(this.options.stopped || this.options.stopEvents)
      	  return;
      	each(this.eventHandlers[eventName], function(f) {
        	f(param1, param2, param3)
      	});
    	},
    	
    	on : function(eventName, handlerFunc) {
      	if(!this.eventHandlers[eventName])
      	  this.eventHandlers[eventName] = [];
    	  this.eventHandlers[eventName].push(handlerFunc);
    	},
    	
    	zoom : function(zoomLevel) {
        this.mouse.zoom = this.clamp(zoomLevel, this.options.minZoom, this.options.maxZoom);
        this.trigger('zoom', this.mouse);
    	},
    
    	panBy : function(xd, yd) {
        this.root.position.x = this.mouse.ex0 + xd * this.mouse.panFactor;
        this.root.position.y = this.mouse.ey0 + yd * this.mouse.panFactor;
    	},
    	
    	panTo : function(x, y) {
        this.root.dragSetPosition(x, y);
    	},
    	
    	animate : function(f) {
      	this.animation.add(f);
    	},
    
      once : function(f) {
        this.animation.nextFrameCommandList.push(f);        
      },
    
      initRenderer : function() {
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.z = 30;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.view = this.renderer.domElement;
        if(this.parentElement)
          this.parentElement.append(this.renderer.view);
        else
          document.body.appendChild(this.renderer.view);
        $('canvas').on('contextmenu', this.hooks.sink); // disable right click
      	$(window).on('resize', this.hooks.resize);
        $(this.renderer.view).on('mousedown', this.hooks.mousedown);
        $(this.renderer.view).on('mouseup', this.hooks.mouseup);
        $(this.renderer.view).on('mouseout', this.hooks.mouseout);
        $(this.renderer.view).on('mouseenter', this.hooks.mouseenter);
        $(this.renderer.view).on('click', this.hooks.click);
        this.root = new THREE.Scene();
        this.renderer.view.addEventListener("mousemove", this.hooks.mousemove, false);
        this.renderer.view.addEventListener("mousewheel", this.hooks.wheel, false);
        this.renderer.view.addEventListener("DOMMouseScroll", this.hooks.wheel, false);    
        this.debug.animationTimestamp = new Date().getTime();
        this.debug.renderTimestamp = new Date().getTime();
        this.hooks.resize();
      },
    
      renderFrame : function() {
        if(this.debug.frameSkipStatus > 0) {
          this.debug.frameSkipStatus -= 1;
        }
      	else if(!this.options.stopAnimation) {
      		const st = new Date().getTime();
      		this.animation.doAll((st - this.debug.animationTimestamp) / 1000);
          this.renderer.render(this.root, this.camera);      
      		const ct = new Date().getTime();
      		this.debug.frameInterval = 
      		  ((this.debug.frameInterval || 10)*0.97) + 
      		  ((st-this.debug.renderTimestamp)*0.03);
      		this.debug.fps = Math.round(1000/this.debug.frameInterval);      		
      		this.debug.threadLoad = (this.debug.threadLoad || 0)*0.97 + (ct-st)*0.03;
      		var loadpct = Math.round(100*this.debug.threadLoad/this.debug.frameInterval);
      		if(loadpct < 10) loadpct = '0'+loadpct;
      		if(loadpct > this.options.frameSkipThreshold) {
            this.debug.frameSkipStatus += 1;
            this.debug.frameSkipCounter += 1;
      		}
      		this.debug.threadLoadPercent = loadpct;
      		this.debug.renderTimestamp = st;
      		this.debug.animationTimestamp = st;
      		this.trigger('frameinfo', this.debug);
      	}
      	if(!this.options.stopped)
          requestAnimationFrame(this.renderFrame);
    	},
    	
    	start : function() {
      	this.options.stopAnimation = false;
      	this.options.stopped = false;
      	this.options.stopEvents = false;
      	this.renderFrame();
    	},
  
      stop : function() {
      	this.options.stopped = true;
      },

  	},
	
	  animation : {
  	  
  	  list : [],
  	  queueSlots : {},
  	  queueSlotsActive : {},
      
      add : function(f, optionalQueueSlotID) { 
        if(optionalQueueSlotID) {
          f.queueSlot = optionalQueueSlotID;
          if(this.animation.queueSlotsActive[optionalQueueSlotID]) {
            // if there is an active animation in this slot, we need to queue
            if(!this.animation.queueSlots[optionalQueueSlotID])
              this.animation.queueSlots[optionalQueueSlotID] = [f];
            else
              this.animation.queueSlots[optionalQueueSlotID].push(f);
          } else {
            this.animation.queueSlotsActive[optionalQueueSlotID] = true;
            this.animation.add(f);
          }
        } else {
          this.animation.list.push(f); 
          this.trigger('animationstart', f, this.animation.list.length-1);
        }
      },
  
      remove : function(f) {
        var idx = this.animation.list.indexOf(f);
        if(idx > -1) {
          this.trigger('animationend', f, idx);
          this.animation.list.splice(idx, 1);
        }
        if(f.queueSlot) {
          var qs = this.animation.queueSlots[f.queueSlot];
          if(qs && qs.length > 0) {
            var next = qs.shift();
            if(qs.length == 0) {
              delete this.animation.queueSlots[f.queueSlot];
              this.animation.queueSlotsActive[optionalQueueSlotID] = false;             
            }
            this.animation.add(next);
          }
        }
      },
      
      doAll : function(deltaTime) {
        if(this.animation.commandList.length > 0) {
          each(this.animation.commandList, function(f) {
            f(deltaTime);
          });
          this.animation.commandList = this.animation.nextFrameCommandList;
          this.animation.nextFrameCommandList = [];
        }
        each(this.animation.list, function(f) {
          try {
            if(typeof f == 'function') {
              var r = f(deltaTime);
              if(r === false) {
                this.animation.remove(f);
              }
            }
          } catch(ee) {
            console.error('error during animation', ee);
            this.animation.remove(f);
          }
        });
      },
      
    },
  	
  	hooks : { // for incoming events
    	
    	click : function(e) {
      	this.hooks.updateMouseButtons(e, true);
        this.trigger('click', this.mouse);
      },

      updateMouseButtons : function(e, isDown) {
        this.mouse.anyButton = isDown;
        this.mouse.buttonContext = 'any';
        if(e.which == 1 || e.button == 0) {
          this.mouse.leftButton = isDown;
          this.mouse.buttonContext = 'left';
        } else if(e.which == 2 || e.button == 1) {
          this.mouse.middleButton = isDown;
          this.mouse.buttonContext = 'middle';
        } else if(e.which == 3 || e.button == 2) {
          this.mouse.rightButton = isDown;
          this.mouse.buttonContext = 'right';
        } else {
          this.mouse.otherButton = e.which+':'+e.button;
        }
      },
    	
      mousedown : function(e) {
      	this.hooks.updateMouseButtons(e, true);
        this.mouse.x0 = this.mouse.screenX;
        this.mouse.y0 = this.mouse.screenY;
        this.trigger('mousedown', this.mouse, this.mouse.buttonContext);        
        this.trigger('mousedown_'+this.mouse.buttonContext, this.mouse);        
      },
      
      mousemove : function(e) {
        this.mouse.screenX = e.x;
        this.mouse.screenY = e.y;
        this.mouse.x = ( e.clientX / this.size.x ) * 2 - 1;
        this.mouse.y = - ( e.clientY / this.size.y ) * 2 + 1;
        if(this.mouse.anyButton) {
          this.mouse.xd = (this.mouse.x - this.mouse.x0);
          this.mouse.yd = (this.mouse.y - this.mouse.y0);
        }
        this.trigger('mousemove', this.mouse, e);
      },
      
      mouseup : function(e) {
      	this.hooks.updateMouseButtons(e, false);
        this.trigger('mouseup', this.mouse, this.mouse.buttonContext);   
        this.trigger('mouseup_'+this.mouse.buttonContext, this.mouse);     
      },
      
      mouseout : function(e) {
        // cancel any dragging operations
        var stage = this;
        var buttonProps = ['left', 'middle', 'right', 'any'];
        buttonProps.forEach(function(buttonContext) {
          if(stage.mouse[buttonContext+'Button']) {
            stage.mouse[buttonContext+'Button'] = false;
            stage.trigger('mouseup', stage.mouse, buttonContext);   
            stage.trigger('mouseup_'+buttonContext, stage.mouse);     
          }
        });
        this.trigger('mouseout', this.mouse);        
      },

      mouseenter : function(e) {
        this.trigger('mouseenter', this.mouse);        
      },
      
    	resize : function(){    
    	  this.size = this.getViewportSize();
        this.trigger('resize', this.size);
      },
      
    	sink : function(e) { 
        e.preventDefault();
        return(false);
      },
    	
      wheel : function(e) {
        if(!this.options.disableWheelZoom) {
          if(e.wheelDeltaY < 0) {
            this.zoom(this.mouse.zoom - this.options.zoomStep);
          } else if(e.wheelDeltaY > 0) {
            this.zoom(this.mouse.zoom + this.options.zoomStep);
          }
        }
        this.trigger('wheel', e.wheelDeltaY, e.wheelDeltaX);
      },
    	
  	},
    
  },
  
  create : function(opt) {
    
    var s;
    s = {
        
      _idCtr : 1000,
      size : false, 
      renderer : false,
      root : false,
      debug : {
        fps : 60,
        threadLoad : 0,
        threadLoadPercent : 0,
        frameInterval : 33,
        frameSkipStatus : 0,
        frameSkipCounter : 0,
        animationTimestamp : 0,
        renderTimestamp : 0,
      },
    	mouse : {
      	leftButton : false,
      	middleButton : false,
      	rightButton : false,
      	anyButton : false,
      	zoom : 1.0,
      	x : 0, y : 0,
      	x0 : 0,	y0 : 0,
      	xd : 0,	yd : 0,
      	screenX : 0,
      	screenY : 0,
      	panFactor : 10,
    	},    	     
      eventHandlers : { 
        click : false,
        mousedown : false,
        mousemove : false,
        mouseup : false,
        resize : false,
        zoom : false,
      },
    	    	
    }
    
  	s.options = opt;
  	opt.frameSkipThreshold = opt.frameSkipThreshold || 50;
  	opt.minZoom = opt.minZoom || 0.5;
  	opt.maxZoom = opt.maxZoom || 3.0;
  	opt.zoomStep = opt.zoomStep || 0.2;
  	opt.stopped = true;
  	opt.stopEvents = true;
 
    ThreeStage.implementation.bind(s, ThreeStage.implementation.functions, s);
    s.layers = ThreeStage.implementation.bind(s, ThreeStage.implementation.layers);    
    s.hooks = ThreeStage.implementation.bind(s, ThreeStage.implementation.hooks);
    s.animation = ThreeStage.implementation.bind(s, ThreeStage.implementation.animation, {
      paused : false,
      stopped : false,
      list : [],
      commandList : [],
      nextFrameCommandList : [],
    });
    s.raycaster = new THREE.Raycaster();
    s.size = s.getViewportSize();
    s.initRenderer();
    if(opt.draggable)
      s.makeDraggable(s.root);
   
    return(s);
  	
  },
  	
}

