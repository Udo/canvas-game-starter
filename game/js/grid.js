var Grid = {
  
  create : function(colCount, rowCount, opt) {
    if(!opt) opt = {};
    var grid = {
      colCount : colCount,
      rowCount : rowCount,
      cells : [],
    }
    if(!opt.eachNeighbor)
      opt.eachNeighbor = Grid.eachNeighbor;
    grid.unprojectMouse = Grid.unprojectMouse.bind(grid);
    grid.get = Grid.get.bind(grid);
    if(!opt.cellSize)
      opt.cellSize = 1;
    if(!opt.xOffset || !opt.yOffset) {
      opt.xOffset = 0.5*opt.cellSize*colCount;
      opt.yOffset = 0.5*opt.cellSize*rowCount;
    }
    each(opt, function(v, k) {
      if(typeof v == 'function')
        grid[k] = v.bind(grid);
      else 
        grid[k] = v;
    });
    for(var y = 0; y < rowCount; y++) {
      var row = [];
      for(var x = 0; x < colCount; x++) {
        var cell = { x: x, y: y, walkable : true };
        if(opt.onCreateCell)
          opt.onCreateCell(cell, x, y);
        row.push(cell);
      }
      grid.cells.push(row);
    }
    return(grid);
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
      x : Math.floor((mx+this.xOffset)/this.cellSize),
      y : Math.floor((my+this.yOffset)/this.cellSize),
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