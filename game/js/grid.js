var Grid = {
  
  create : function(width, height, opt) {
    if(!opt) opt = {};
    this.width = width;
    this.height = height;
    this.cells = [];
    if(!opt.eachNeighbor)
      opt.eachNeighbor = Grid.eachNeighbor;
    this.unprojectMouse = Grid.unprojectMouse.bind(this);
    this.get = Grid.get.bind(this);
    if(!opt.tileSize)
      opt.tileSize = 1;
    if(!opt.xOffset || !opt.yOffset) {
      opt.xOffset = 0.5*opt.tileSize*width;
      opt.yOffset = 0.5*opt.tileSize*height;
    }
    var o = this;
    each(opt, function(v, k) {
      if(typeof v == 'function')
        o[k] = v.bind(o);
      else 
        o[k] = v;
    });
    for(var y = 0; y < height; y++) {
      var row = [];
      for(var x = 0; x < width; x++) {
        var cell = { x: x, y: y, walkable : true };
        if(opt.onCreateCell)
          opt.onCreateCell(cell, x, y);
        row.push(cell);
      }
      this.cells.push(row);
    }
  },
  
  eachNeighbor : function(node, f) {
    var r = false;

    var c = false;
    r = this.cells[node.y]; 
    if(r) c = r[node.x-1]; 
    if(c && c.walkable) f(c);

    var c = false;
    r = this.cells[node.y];
    if(r) c = r[node.x+1]; 
    if(c && c.walkable) f(c);
    
    var c = false;
    r = this.cells[node.y-1];
    if(r) c = r[node.x]; 
    if(c && c.walkable) f(c);
    
    var c = false;
    r = this.cells[node.y+1];
    if(r) c = r[node.x]; 
    if(c && c.walkable) f(c);    
  },
  
  unprojectMouse : function(mx, my) {
    return({
      x : Math.floor((mx+this.xOffset)/this.tileSize),
      y : Math.floor((my+this.yOffset)/this.tileSize),
    });
  },
  
  get : function(x, y) {
    var r = this.cells[y];
    var c = false;
    if(r)
      c = r[x];
    return(c);
  },

}