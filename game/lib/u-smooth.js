Smooth = {
  
  linear : function(v) {
    return(v);
  },
  
  start : function(v) {
    return(v*v);
  },

  start3 : function(v) {
    return(v*v*v);
  },

  start4 : function(v) {
    return(v*v*v*v);
  },

  stop : function(v) {
    v = 1-v;
    return(1 - v*v);
  },

  stop3 : function(v) {
    v = 1-v;
    return(1 - v*v*v);
  },

  stop4 : function(v) {
    v = 1-v;
    return(1 - v*v*v*v);
  },
  
  compose : {
    
    mix : function(f1, f2) {
      return(function(v) {
        return(f1(v) * f2(v));
      });
    },
    
    crossfade : function(f1, f2) {
      if(!f1 || !f2) {
        console.error('Smooth.compose_crossfade(f1, f2) function not defined');
        return;
      }
      return(function(v) {
        return(((1-v)*f1(v)) + ((v)*f2(v)));
      });
    },
    
    crossfade3 : function(f1, f2, f3) {
      return(function(v) {
        var cf1, cf2, cf3;
        if(v <= 0.5) {
          cf1 = 1 - v*2;
          cf2 = v*2;
          cf3 = 0;
        } else {
          cf1 = 0;
          cf2 = 1-((v-0.5)*2);
          cf3 = (v-0.5)*2;
        }
        return(f1(v)*cf1 + f2(v)*cf2 + f3(v)*cf3);
      });
    },
    
    reverse_y : function(f) {
      return(function(v) {
        return(1-f(v));
      });
    },
    
    reverse_x : function(f) {
      return(function(v) {
        return(f(1-v));
      });
    },
    
    reverse : function(f) {
      return(function(v) {
        return(1-f(1-v));
      });
    },
    
    chain : function(f1, f2) {
      var f = [];
      // not sure if this is necessary, but I seem to recall arguments is a special language construct
      for (var i = 0; i < arguments.length; i++) { 
        f.push(arguments[i]);
      }
      if(f.length == 2) {
        return(function(v) {
          if(v < 0.5)
            return(f1(v*2)*0.5);
          else
            return(0.5 + f2((v-0.5)*2)*0.5);
        });
      } else {
        
      }
    },
    
  },
  
  reverse : function(v) {
    return(1-v);
  },
  
  sin_start : function(v) {
    return(1+Math.sin((1.5+v*0.5)*Math.PI));
  },
  
  sin_stop : function(v) {
    return(Math.sin((0+v*0.5)*Math.PI));
  },
  
  sin_start_stop : function(v) {
    return(0.5+0.5*Math.sin((1.5+v)*Math.PI));
  },

  arch_peak : function(v) {
    return(4*((1-v)*v));
  },

  sin_peak : function(v) {
    return(0.5+0.5*Math.sin((-0.5+v*2)*Math.PI));
  },

  sin_wave_peak : function(v) {
    return(Math.sin((-0.0+v*2)*Math.PI));
  },
  
  bounce_stop : function(v) { // lifted this particular bounce from: https://github.com/sole/tween.js/blob/master/src/Tween.js
    if (v < (1 / 2.75)) {
		  return 7.5625 * v * v;
    } else if (v < (2 / 2.75)) {
			return 7.5625 * (v -= (1.5 / 2.75)) * v + 0.75;
		} else if (v < (2.5 / 2.75)) {
			return 7.5625 * (v -= (2.25 / 2.75)) * v + 0.9375;
		} else {
			return 7.5625 * (v -= (2.625 / 2.75)) * v + 0.984375;
		}
  },

  undershoot_start : function(v) {
    return((-(1-v*2)*v*2)*(1-v) + (v)*(v));
  },
  

}

Smooth.start_stop = Smooth.compose.crossfade(Smooth.start, Smooth.stop);
Smooth.start_stop3 = Smooth.compose.crossfade(Smooth.start3, Smooth.stop3);
Smooth.start_stop4 = Smooth.compose.crossfade(Smooth.start4, Smooth.stop4);
Smooth.bounce_start = Smooth.compose.reverse(Smooth.bounce_stop);
Smooth.bounce = Smooth.compose.chain(Smooth.bounce_start, Smooth.bounce_stop);
Smooth.sin = Smooth.compose.crossfade(Smooth.sin_wave_peak, Smooth.linear);
Smooth.overshoot_stop = Smooth.compose.reverse(Smooth.undershoot_start);
Smooth.under_overshoot = Smooth.compose.crossfade(Smooth.undershoot_start, Smooth.overshoot_stop);
