var Grid = {
  
  create : function(width, height, opt) {
    if(!opt) opt = {};
    this.width = width;
    this.height = height;
    this.cells = [];
    for(var y = 0; y < height; y++) {
      var row = [];
      for(var x = 0; x < width; x++) {
        var cell = { x: x, y: y, walkable : true };
        if(opt.onCreateCell)
          cell = opt.onCreateCell(cell, x, y);
        row.push(cell);
      }
      this.cells.push(row);
    }
    if(!opt.eachNeighbor)
      opt.eachNeighbor = Grid.eachNeighbor;
    this.eachNeighbor = opt.eachNeighbor.bind(this);
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

}