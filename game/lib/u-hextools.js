var HexTools = {
	
	options : {
		oddOffset : 0,
		evenOffset : 1,
	},
	
	/* creates a hex grid backing store */
	createGrid : function(colCount, rowCount, options) {
		if(!options) options = {};
		if(typeof options.oddOffset == 'undefined')
			options.oddOffset = 0;
		if(typeof options.evenOffset == 'undefined')
			options.evenOffset = 1;
		if(typeof options.type == 'undefined')
			options.type = HexTools.pointyTop;
		var grid = {
			colCount : colCount,
			rowCount : rowCount,
			cells : [],
			options : options,
			get : function(x, y) {
				if(x > colCount-1 || x < 0 || y > rowCount-1 || y < 0 || isNaN(x) || isNaN(y))
					return(false);
				return(grid.cells[y][x]);
			},
			call : function(x, y, f) {
				if(x > colCount-1 || x < 0 || y > rowCount-1 || y < 0 || isNaN(x) || isNaN(y))
					return(false);
				return(f(grid.cells[y][x], x, y));
			},
			each : function(f) {
				grid.cells.forEach(function(row, rowIndex) {
					row.forEach(function(cell, colIndex) {
						f(cell, colIndex, rowIndex);
					});
				});
			},
		}
		// include functions from the geometry-specific section 
		for(var prop in options.type) if(options.type.hasOwnProperty(prop)) {
			grid[prop] = options.type[prop].bind(grid); 
		}
		// include functions from the generic section
		for(var prop in HexTools.generic) if(HexTools.generic.hasOwnProperty(prop)) {
			grid[prop] = HexTools.generic[prop].bind(grid); 
		}
		// include functions that have been supplied by the user
		for(var prop in options) if(options.hasOwnProperty(prop)) {
			var f = options[prop];
			if(typeof f == 'function') 
				grid[prop] = f.bind(grid); 
			else
				grid[prop] = f;
		}
		// init all the cells
		for(var y = 0; y < rowCount; y++) {
			grid.cells[y] = [];
			for(var x = 0; x < colCount; x++) {
				var cell = {
						x : x,
						y : y,
					};
				cell.pos = grid.projectHexToMap(cell.x, cell.y, options.cellSize || 1.0);
				if(grid.onCreateCell)
					grid.onCreateCell(cell);
				grid.cells[y][x] = cell;
			}
		}
		return(grid);
	},

	sqrt3 : Math.sqrt(3),
	pi6th : Math.PI/6,
	pi12th : Math.PI/12,
	
	generic : {
		
		// for serialization/deserialization
		data : function(instantiateFromData) {
			// todo
		},

		eachInAreaOf : function(cells, depth, cellCallback) {
			var visitedList = { };
			var openList = [ ];
			cells.forEach(function(cell) {
				visitedList[cell.x+':'+cell.y] = true;
				cellCallback(cell, 0);
				openList.push(cell);
			});
			var grid = this;
			var vHash = false;
			for(var depthIndex = 0; depthIndex < depth; depthIndex++) {
				var newOpenList = [];
				if(openList.length > 0) for(var olIdx = 0; olIdx < openList.length; olIdx++) {
					var c = openList[olIdx];
					grid.eachNeighborOf(c, function(n) {
						vHash = n.x+':'+n.y;
						if(!visitedList[vHash]) {
							newOpenList.push(n);
							visitedList[vHash] = true;
							cellCallback(n, depthIndex+1);
						}
					});
				}
				openList = newOpenList;
			}
		},
		
		eachInLine : function(c1, c2, eachCellCallback) {
			if(!c1 || !c2)
				return;
			var cc = c1;
			var grid = this;
			var distCounter = 0;
			var distLength = 0;
			var pvx = c2.pos.x - c1.pos.x;
			var pvy = c2.pos.y - c1.pos.y;
			var pvlength = grid.mapDistance(0, 0, pvx, pvy);
			pvx = pvx / pvlength;
			pvy = pvy / pvlength;
			var unitLength = grid.options.cellSize || 1.0;
			if(eachCellCallback)
				eachCellCallback(cc, distCounter);
			while(cc.x != c2.x || cc.y != c2.y) {
				distLength += unitLength;
				distCounter += 1;
				var closestCell = false;
				var closestSquareDist = false;
				var referencePositionX = c1.pos.x + (pvx * distLength);
				var referencePositionY = c1.pos.y + (pvy * distLength);
				grid.eachNeighborOf(cc, function(nc) {
					var ncdist = grid.mapDistance(nc.pos.x, nc.pos.y, referencePositionX, referencePositionY);
					if(closestSquareDist === false || ncdist < closestSquareDist) {
						closestSquareDist = ncdist;
						closestCell = nc;
					}
				});
				if(closestCell) {
					if(eachCellCallback)
						eachCellCallback(closestCell, distCounter);
					cc = closestCell;
					distLength = grid.mapDistance(c1.pos.x, c1.pos.y, cc.pos.x, cc.pos.y);
				} else {
					return(distCounter);
				}
			}
			return(distCounter);
		},
		
		stepDistance : function(c1, c2) {
			return(this.eachInLine(c1, c2)-1);
		},

		mapDistance : function(x1, y1, x2, y2) {
			if(x1.pos && y1.pos) {
				return(this.mapDistance(x1.pos.x, x1.pos.y, y1.pos.x, y1.pos.y));
			}
			var dx = x1 - x2;
			var dy = y1 - y2;
			return(Math.sqrt(dx*dx + dy*dy));
		},
		
	},
	
	pointyTop : {
		
		eachNeighborOf : function(cell, eachNeighborCallback) {
			var options = this.options || HexTools.options;
			var x = cell.x;
			var y = cell.y;
			var offset1 = (y % 2 != 0 ? options.oddOffset : options.evenOffset);				
			this.call(offset1+x-1, y-1, eachNeighborCallback);
			this.call(offset1+x+0, y-1, eachNeighborCallback);
			this.call(x+1, y+0, eachNeighborCallback);
			this.call(offset1+x+0, y+1, eachNeighborCallback);
			this.call(offset1+x-1, y+1, eachNeighborCallback);
			this.call(x-1, y+0, eachNeighborCallback);
		},
		
		// todo: this needs another pass to unify both hex topology functions
		heightFromWidth : function(width) {
			return(width / (HexTools.sqrt3/2));
		},
		
		// todo: this needs another pass to unify both hex topology functions
		rowHeightFromWidth : function(width) {
			return(width / (HexTools.sqrt3/2)) * 0.75;
		},
		
		createDrawPath : function(size) {
			var height = HexTools.pointyTop.heightFromWidth(size);
			var width = size;
			return([
				0.00 * width,	 -0.50 * height,
				0.50 * width,	 -0.25 * height,
				0.50 * width,		0.25 * height,
				0.00 * width,		0.50 * height,
				-0.50 *width,		0.25 * height,
				-0.50 *width,	 -0.25 * height,
				0.00 * width,	 -0.50 * height,
			]);	
		},
		
		projectHexToMap : function(hx, hy, cellSize, optionalDestination) {
			if(!optionalDestination)
				optionalDestination = {};
			return(HexTools.abstract.projectHexToMap(
				hy, hx, 
				cellSize || this.options.cellSize, 
				optionalDestination, 
				'y', 'x', 
				HexTools.pointyTop.rowHeightFromWidth, 
				this.options || HexTools.options));
		},
		
		// todo: this needs another pass to unify both hex topology functions
		projectMapToHex : function(xc, yc, cellSize, optionalDestination) {
			if(!optionalDestination)
				optionalDestination = {};
			var options = this.options || HexTools.options;
			if(!cellSize)
				cellSize = options.cellSize;
			var cellWidth = cellSize || options.cellSize;
			var cellHeight = HexTools.pointyTop.rowHeightFromWidth(cellWidth);
			var y = (yc / cellHeight) + 1/6;
			var x = (xc / cellWidth) - 
				(Math.round(y) % 2 == 0 ? options.evenOffset*0.5 : options.oddOffset*0.5);
			var fx = x - Math.round(x);
			var fy = y - Math.round(y);
			if(fy < -0.5+HexTools.sqrt3/5 && (Math.abs(fx) - (fy+0.5)*(1+HexTools.sqrt3/3) ) > 0) {
				y -= 1;
				x += (Math.round(y) % 2 == 0 ? -options.evenOffset : -options.oddOffset) + (fx > 0 ? 1 : 0);
			}
			optionalDestination.x = Math.round(x);
			optionalDestination.y = Math.round(y);
			return(optionalDestination);
		},
		
	},

	abstract : {

		projectHexToMap : function(h1, h2, cellSize, dest, f1, f2, f1DimFunction, options) {
			if(!cellSize)
				cellSize = options.cellSize;
			var offset = (h1 % 2 != 0 ? options.oddOffset/2 : options.evenOffset/2);
			dest[f1] = h1 * f1DimFunction(cellSize);
			dest[f2] = (h2 + offset) * cellSize;
			return(dest);
		},
		
	},
	
	flatTop : {

		eachNeighborOf : function(cell, eachNeighborCallback) {
			var options = this.options || HexTools.options;
			var x = cell.x;
			var y = cell.y;
			var offset1 = (x % 2 != 0 ? options.oddOffset : options.evenOffset);				
			this.call(x+0, y-1, eachNeighborCallback);
			this.call(x+1, offset1+y-1, eachNeighborCallback);
			this.call(x+1, offset1+y+0, eachNeighborCallback);
			this.call(x+0, y+1, eachNeighborCallback);
			this.call(x-1, offset1+y+0, eachNeighborCallback);
			this.call(x-1, offset1+y-1, eachNeighborCallback);
		},

		// todo: this needs another pass to unify both hex topology functions
		widthFromHeight : function(height) {
			return(height / (HexTools.sqrt3/2));
		},
		
		// todo: this needs another pass to unify both hex topology functions
		colWidthFromHeight : function(height) {
			return(height / (HexTools.sqrt3/2) * 0.75);
		},
		
		createDrawPath : function(size) {
			var width = HexTools.flatTop.widthFromHeight(size);
			var height = size;
			return([
				-0.50 * width,	0.00 * height,
				-0.25 * width,	0.50 * height,	 
				 0.25 * width,	0.50 * height,
				 0.50 * width,	0.00 * height,		
				 0.25 * width, -0.50 * height,		
				-0.25 * width, -0.50 * height,
				-0.50 * width,	0.00 * height,	 
			]);	
		},
		
		projectHexToMap : function(hx, hy, cellSize, optionalDestination) {
			if(!optionalDestination)
				optionalDestination = {};
			return(HexTools.abstract.projectHexToMap(
				hx, hy, 
				cellSize || this.options.cellSize, 
				optionalDestination, 
				'x', 'y', 
				HexTools.flatTop.colWidthFromHeight, 
				this.options || HexTools.options));
		},
		
		// todo: this needs another pass to unify both hex topology functions
		projectMapToHex : function(xc, yc, cellSize) {
			var options = this.options || HexTools.options;
			if(!cellSize)
				cellSize = options.cellSize;
			var cellHeight = cellSize || options.cellSize;
			var cellWidth = HexTools.flatTop.colWidthFromHeight(cellHeight);
			var x = (xc / cellWidth) + 1/6;
			var y = (yc / cellHeight) - 
				(Math.round(x) % 2 == 0 ? options.evenOffset*0.5 : options.oddOffset*0.5);
			var fx = x - Math.round(x);
			var fy = y - Math.round(y);
			if(fx < -0.5+HexTools.sqrt3/5 && (Math.abs(fy) - (fx+0.5)*(1+HexTools.sqrt3/3) ) > 0) {
				x -= 1;
				y += (Math.round(x) % 2 == 0 ? -options.evenOffset : -options.oddOffset) + (fy > 0 ? 1 : 0);
			}
			return({ x : Math.round(x), y : Math.round(y) });
		},
		
	},
		
}

if(typeof exports !== 'undefined') {
	for(var prop in HexTools) {
		exports[prop] = HexTools[prop];
	}
}
