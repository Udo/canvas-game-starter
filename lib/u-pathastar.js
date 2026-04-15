(function (root, factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		var exports_obj = factory();
		for (var key in exports_obj) {
			if (exports_obj.hasOwnProperty(key)) {
				exports[key] = exports_obj[key];
			}
		}
	} else if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else {
		var exports_obj = factory();
		for (var key in exports_obj) {
			if (exports_obj.hasOwnProperty(key)) {
				root[key] = exports_obj[key];
			}
		}
	}
}(typeof self !== 'undefined' ? self : this, function () {

var PriorityQueue = {

	create : function(optionalCustomCompareFunction) {

		var q = {
			items : [],
			size : 0,
			current_lowest : false,
		};

		q.push = (prio, payload) => {
			var e = { pri : prio, payload : payload };
			if(q.current_lowest && prio <= q.current_lowest.pri) { 
				// special case, quick insert doesn't require a re-peek
				q.items.unshift(e);
				q.current_lowest = e;
			} else {
				q.items.push(e);
			}
			q.size = q.items.length;
		}

		q.get_lowest = () => {
			q.current_lowest = false;
			q.items.forEach((e) => {
				if(q.current_lowest === false || e.pri < q.current_lowest)
					q.current_lowest = e;
			});
			return(q.current_lowest);
		}

		q.peek = function() {
			if(q.size == 0) return(false);
			if(!q.current_lowest) q.get_lowest();
			if(q.current_lowest) return(q.current_lowest.payload);
			return(false);
		}

		q.pop = function() {
			if(q.size == 0) return(false);
			if(q.current_lowest === false) q.get_lowest();
			if(q.current_lowest === false) return(false);
			q.items.splice(q.items.indexOf(q.current_lowest), 1);
			var payload = q.current_lowest.payload;
			if(q.items.length > 0 && q.current_lowest.pri == q.items[0].pri) {
				// special case, hopefully to speed things up
				q.current_lowest = q.items[0];
			} else
				q.current_lowest = false;
			q.size = q.items.length;
			return(payload);
		}
		
		return(q);
		
	},

}

var PathAStar = {

	extractPath : function(history, endNode, idField) {
		var path = [];
		
		var n = endNode;
		
		while(n) {
			path.push(n);
			n = history[n[idField]];
		}
		
		return(path.reverse());
	},
	
	extractStepCost : function(history, endNode, idField, costSoFar) {
		var path = [];
		
		var n = endNode;
		
		while(n) {
			path.push(costSoFar[n[idField]]);
			n = history[n[idField]];
		}
		
		return(path.reverse());
	},
	
	config : {
		nodeIdField : 'id',
		trackStepCost : false,
		trackConsidered : false,
		defaultLinearDistance : function(fromNode, toNode) {
			var dx = fromNode.x - toNode.x;
			var dy = fromNode.y - toNode.y;
			return(Math.sqrt(
				(dx*dx)+(dy*dy)
				));
		},
	},

	find : function(startNode, endNode, eachNeighbor, getCost, getCostHeuristic) {
		
		var startTime = performance.now();
		var countConsidered = 0;
		var countHighWatermark = 0;
		var idField = PathAStar.config.nodeIdField;
		
		if(!getCost)
			getCost = PathAStar.config.defaultLinearDistance;

		if(!getCostHeuristic)
			getCostHeuristic = PathAStar.config.defaultLinearDistance;
			
		var objectIdCounter = 10000;
		var objectId = function(o) {
			if(!o[idField]) 
				o[idField] = 'N'+(objectIdCounter++);
			return(o[idField]);
		}
		
		objectId(startNode);
		objectId(endNode);

		var frontier = PriorityQueue.create();
		frontier.push(0, startNode);
		var history = {};
		var costSoFar = {};
		var consideredNodes = [];
		costSoFar[startNode[idField]] = 1;
		history[startNode[idField]] = false;
		
		while(frontier.size > 0) {
			var currentNode = frontier.pop();
			if(countHighWatermark < frontier.size)
				countHighWatermark = frontier.size;
			if(currentNode == endNode) {
				return({ 
					result : 'path', 
					debug : {
						time : (performance.now() - startTime) / 1000,
						highWaterMark : countHighWatermark,
						totalCost : costSoFar[currentNode[idField]],
						stepCost : PathAStar.config.trackStepCost ?
							PathAStar.extractStepCost(history, endNode, idField, costSoFar) : 'not tracked',
						nodesConsidered : countConsidered,
						consideredNodes : consideredNodes,
					},
					path : PathAStar.extractPath(history, endNode, idField) 
					});
			}
			eachNeighbor(currentNode, function(nextNode) {
				if(!nextNode)
					return;
				objectId(nextNode);
				var newCost = costSoFar[currentNode[idField]] + getCost(currentNode, nextNode);
				if(!costSoFar[nextNode[idField]] || newCost < costSoFar[nextNode[idField]]) {
					costSoFar[nextNode[idField]] = newCost; 
					var prio = newCost + getCostHeuristic(nextNode, endNode);
					frontier.push(prio, nextNode);
					if(PathAStar.config.trackConsidered)
						consideredNodes.push(nextNode[idField]);
					countConsidered++;
					history[nextNode[idField]] = currentNode;
				}
			});
		}
		 
		return({ 
			result : 'no-path', 
			debug : {
				time : (performance.now() - startTime) / 1000,
				highwaterMark : countHighWatermark,
				totalCost : 0,
				nodesConsidered : countConsidered,
				consideredNodes : consideredNodes,
			},
			path : [] });	 
	},

}

return {
	PathAStar: PathAStar,
	PriorityQueue: PriorityQueue
};

}));
