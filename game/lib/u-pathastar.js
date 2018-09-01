/**
 * Udolib JavaScript Priority Queue
 * (c) Udo Schroeter udo@openfu.com
 * License: Public Domain
*/

var PriorityQueue = {

  defaultCompare : function(a, b) {
    return( a[0] < b[0] );
  },

  create : function(optionalCustomCompareFunction) {

    var q = {
      compare : optionalCustomCompareFunction || PriorityQueue.defaultCompare,
      items : [],
      size : 0,
    };

    q.push = function(prio, payload) {
      var v = [prio, payload];
      var i = q.size;
      q.items[q.size] = v;
      q.size += 1;
      var p;
      var ap;
      while (i > 0) {
        p = (i - 1) >> 1;
        ap = q.items[p];
        if (!q.compare(v, ap)) {
          break;
        }
        q.items[i] = ap;
        i = p;
      }
      q.items[i] = v;      
    }

    q.percolateDown = function(i) {
      var size = q.size;
      var hsize = q.size >>> 1;
      var ai = q.items[i];
      var l;
      var r;
      var bestc;
      while (i < hsize) {
        l = (i << 1) + 1;
        r = l + 1;
        bestc = q.items[l];
        if (r < size) {
          if (q.compare(q.items[r], bestc)) {
            l = r;
            bestc = q.items[r];
          }
        }
        if (!q.compare(bestc, ai)) {
          break;
        }
        q.items[i] = bestc;
        i = l;
      }
      q.items[i] = ai;      
    }

    q.peek = function() {
      if(q.size == 0) 
        return(false);      
      return(q.items[0][1]);
    }

    q.peekPriority = function() {
      if(q.size == 0) 
        return(false);      
      return(q.items[0][0]);
    }

    q.pop = function() {
      if(q.size == 0) 
        return(false);
      var res = q.items[0];
      if (q.size > 1) {
        q.items[0] = q.items[--q.size];
        q.percolateDown(0 | 0);
      } else {
        q.size -= 1;
      }
      return(res[1]);
    }
    
    q.cleanup = function() {
      q.items = q.items.slice(0, q.size);
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
