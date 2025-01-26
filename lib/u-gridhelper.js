// todo: this needs to be refactored, badly

var GridMap3D = bindThis({

  init : function(grid, stage) {

    this.grid = grid;
    this.stage = stage;
    this.createCursor();
    this.createGroundPlane();

  },

  mousePlane : { xw : 0, yw : 0, x : 0, y : 0, cell : 0 },

  mouseToGroundPlane : function() {
    this.stage.raycaster.setFromCamera(this.stage.mouse, this.stage.camera);
    this.groundPlane.visible = true;
  	var hit = this.stage.raycaster.intersectObject( this.groundPlane );
    this.groundPlane.visible = false;
    if(hit[0]) {
      this.mousePlane.xw = -this.grid.mapOffsetX + (hit[0].uv.x-0.5)*1000;
      this.mousePlane.yw = -this.grid.mapOffsetY + (hit[0].uv.y-0.5)*1000;
      this.grid.projectMapToCell(this.mousePlane.xw, this.mousePlane.yw, this.mousePlane);
      // enable this if useful
      // this.mousePlane.cell = grid.get(this.mousePlane.x, this.mousePlane.y);
    }
  },

  createGroundPlane : function() {
    this.groundPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1000, 1000, 1 ), new THREE.MeshBasicMaterial() );
    this.groundPlane.visible = false;
    this.stage.root.add(this.groundPlane);
  },

  createCursor : function() {
    this.cursor = this.stage.wireframe(new THREE.Mesh( this.stage.shapes.tile, this.stage.mat.cursor ));
    this.cursor.position.z = this.grid.cellSize*0.5;
    if(this.grid.topology == 'hex') {
      this.cursor.rotation.x = Math.PI * 0.5;
    }
    this.stage.layers.ui.add(this.cursor);
  },

  placeXY : function(o, pos) {
    this.grid.projectCellToMap(pos.x, pos.y, o.position);
  },

  highlightedTiles : [],

  resetHighlight : function() {
    var grid = this;
    each(this.highlightedTiles, function(t) {
      t.material = grid.stage.mat.tile;
    });
    this.highlightedTiles.length = 0;
  },

  highlightTileAt : function(x, y) {
    var hlCell = this.grid.get(x, y);
    if(hlCell) {
      var hlTile = this.stage.layers.map.children[hlCell.goIndex];
      this.highlightedTiles.push(hlTile);
      hlTile.material = this.stage.mat.highlight;
    }
  },


})

