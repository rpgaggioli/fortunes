;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var Point = require("./point.js");
var Fortunes = require("./fortunes.js");

var dimension = 600;
var numPoints = 10;
var sweepLine = 0;

var canvas, data, pBeach;
var bAnimate;
var context;

var fortunes;
var siteList;


function onLoad() {
	// create canvas
    canvas = document.createElement('canvas');
    canvas.width = canvas.height = dimension;
    canvas.style.border = '1px solid #000';
    document.body.appendChild(canvas);
	context = canvas.getContext('2d');
	
	// create data labels
	pBeach = document.createElement('div');
	document.body.appendChild(pBeach);
	
	data = document.createElement('div');
	document.body.appendChild(data);
	
	// create controls
    bAnimate = document.createElement('button');
	bAnimate.appendChild(document.createTextNode('Animate Sweep Line'));
	bAnimate.style.padding = '10px';
	bAnimate.style.display = 'block';
	document.body.appendChild(bAnimate);
	
	// initialize algorithm
	createSites();
	animate();
    
	// canvas events
    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function(e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function(e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function(e) {
        findxy('out', e)
    }, false);
	
	// control events
	bAnimate.addEventListener("click", function(e) {
		animate();
	}, false);
}


function createSites() {
	siteList = new Array(numPoints);
	for (var i = 0; i < numPoints; i++) {
		do {
			var x = (Math.random() * (dimension - 1)) + 1;
			var y = (Math.random() * (dimension - 1)) + 1;
		} while (isRepeat(x,y));
		siteList[i] = Point(x,y);
	}
}


function isRepeat(x,y) {
	siteList.forEach(function(site) {
		if (x == site.x || y == site.y) {
			return true;
		}
	});
	return false;
}
	

function animate() {
	for (sweepLine = 0; sweepLine <= dimension + 400; sweepLine++) {
		(function(x){
			setTimeout(function() {resetCanvas(x)}, x*10);
        })(sweepLine);
	}
}
	
	
function drawFrame() {
	fortunes = Fortunes(siteList, sweepLine);
	
	drawSweep();
	drawSites();
	drawEdges();
	drawArcs();
}


function drawSweep() {
	context.restore();
	context.strokeStyle = 'black';
	context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0,sweepLine);
    context.lineTo(dimension,sweepLine);
    context.closePath();
    context.stroke();
	
	data.textContent = "SweepLine-Y: " + sweepLine;
}


function drawSites() {
	context.restore();
	context.fillStyle = "rgb(255, 0, 0)";
	for (var i = 0; i < siteList.length; i++) {
		context.beginPath();
		context.arc(siteList[i].x, siteList[i].y, 2, 0, Math.PI*2, true);
		context.fill();
	}
}


function drawEdges() {
	context.restore();
	context.strokeStyle = 'green';
	for (var i = 0; i < fortunes.edgeList.length; i++) {
		context.beginPath();
		context.moveTo(fortunes.edgeList[i].lVertex.x, fortunes.edgeList[i].lVertex.y);
		context.lineTo(fortunes.edgeList[i].rVertex.x, fortunes.edgeList[i].rVertex.y);
		context.stroke();
	}
}


function drawArcs() {
	context.restore();
	context.strokeStyle = 'blue';
	for (curr = fortunes.beachLine; curr; curr = curr.rArc) {
		context.beginPath();
		context.moveTo(curr.lBreak.x, curr.lBreak.y);
		context.quadraticCurveTo(curr.k.x, curr.k.y, curr.rBreak.x, curr.rBreak.y);
		context.stroke();
	}
}


// handles events used to change the sweepLine in the canvas
var flag = false;
function findxy(res, e) {
    if (res == 'down') {
		resetCanvas(e.clientY - canvas.offsetTop);
        flag = true;
    }
    if (res == 'up' || res == 'out') {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            resetCanvas(e.clientY - canvas.offsetTop);
        }
    }
}


// resets the canvas with the given sweepLine value s
function resetCanvas(s) {
	sweepLine = s;
    context.clearRect(0, 0, dimension, dimension);
	drawFrame();
}

// start
onLoad();



// LOG
function logDataPoint(label,p) {
	var tmp = document.createElement('p');
	tmp.textContent = label + ": " + "x: " + p.x + ", y: " + p.y;
	pBeach.appendChild(tmp);
}
},{"./fortunes.js":10,"./point.js":12}],2:[function(require,module,exports){

module.exports = createArc;
	var leftRight = require("left-right");
	var computeBreak = require("./computeBreak.js")
	
	function Arc(site){		
		this.site = site;				
		this.lArc;
		this.rArc;
		
		this.event;
		
		this.lBreak;
		this.rBreak;
		this.lDone = false;
		this.rDone = false;
		
		this.lEdge;
		this.rEdge;
		this.k;
		
	}
	Arc.prototype.setlArc = function(arc){
		this.lArc = arc;
	}
	Arc.prototype.setrArc = function(arc){
		this.rArc = arc;
	}
	
	Arc.prototype.updateVert = function(sweepLine){
		if(this.lArc){	
			
			this.lBreak = this.lArc.rBreak;
		}
		if(this.rArc){
			this.rBreak = computeBreak(this.site, this.rArc.site,  sweepLine);
		}
	}
	
	function createArc(site){
		return new Arc(site);
	}
},{"./computeBreak.js":5,"left-right":13}],3:[function(require,module,exports){

module.exports = function(arc, sweepLine){
	var intersection = require("./intersection.js");
	var Point = require("./point.js");
	
	var C = arc.site;

	if(!arc.lBreak){
		var A = Point(0, sweepLine);	
		var slope = negRecSlope(A,C);
		var H = midpoint(A,C);
		var D = Point(0, (slope * -H.x) + H.y);
	}else{
		var D = arc.lBreak;
		var A = Point(D.x, sweepLine);
		var H = midpoint(A,C);
	}
	
	
	if(!arc.rBreak){
		var B = Point(600,sweepLine);
		var slope = negRecSlope(B,C);
		var J = midpoint(B,C);
		var E = Point(600, (slope * (600 - J.x) + J.y));
	}else{
		var E = arc.rBreak;
		var B = Point(E.x, sweepLine);
		var J = midpoint(C,B);
	}
	
	
	var tmp = intersection(D,H,E,J);
	var k = Point(tmp.x,tmp.y);
	
	return {
		k:k, 
		rBreak:E, 
		lBreak:D
		};
	
	function midpoint(a,b){
		var px = (a.x + b.x)/2;
		var py = (a.y + b.y)/2;
		return Point(px,py);
	}
	
}

function negRecSlope(a,b) {
	return -((b.x - a.x)/(b.y - a.y));
}


},{"./intersection.js":11,"./point.js":12}],4:[function(require,module,exports){

	
module.exports = function circumcenter(threePoints) {
		var Point = require("./point.js");
		var dot = require("./dot.js")
		
        // algorithm from farin and hansford's Practical Linear Algegra: a Geometry Toolbox page 146.
        var p1 = threePoints[0];
        var p2 = threePoints[1];
        var p3 = threePoints[2];
        
        var d1 = dot(vSubtract(p2,p1), vSubtract(p3,p1));
        var d2 = dot(vSubtract(p1,p2), vSubtract(p3,p2));
        var d3 = dot(vSubtract(p1,p3), vSubtract(p2,p3));
        var D = 2*(d1*d2 + d2*d3 + d3*d1);
        
        //Barycentric Coordinates
        var cc1 = d1*(d2+d3) / D;
        var cc2 = d2*(d1+d3) / D;
        var cc3 = d3*(d1+d2) / D;
        
        var center = Point(cc1*p1[0] + cc2*p2[0] + cc3*p3[0], cc1*p1[1] + cc2*p2[1] + cc3*p3[1]);
        // center[0] = cc1*p1[0] + cc2*p2[0] + cc3*p3[0];
        // center[1] = cc1*p1[1] + cc2*p2[1] + cc3*p3[1];
		
		function distance(p1, p2) {
			var d = (p1[0]-p2[0]) * (p1[0]-p2[0]) + (p1[1]-p2[1]) * (p1[1]-p2[1]);
			d = Math.sqrt(d);
			return d;
		}
        
		var radius = distance(threePoints[0], [center.x, center.y])
        
		return {
		center: center,
		radius: radius
		
	}
}

	function vSubtract(v1, v2) {
		var v = new Array(2);
		v[0] = v1[0] - v2[0];
		v[1] = v1[1] - v2[1];
		return v;
	}
},{"./dot.js":7,"./point.js":12}],5:[function(require,module,exports){

module.exports = function (p1, p2, ys) {
 	var intersection = require("./intersection.js");
	var Point = require("./point.js");

	var x1 = p1.x;
	var y1 = p1.y;
	var x2 = p2.x;
	var y2 = p2.y;

	
	//0.00004539992
	
	
	var resX;
	if(Math.abs(y1-ys) == 0 && Math.abs(y2-ys) == 0) {
		resX = (x1+x2)/2;
	}
	else if(Math.abs(y1-ys) == 0) {
		resX = x1;
	}
	else if(Math.abs(y2-ys) == 0) {
		resX = x2;
	} else {
		var a1 = 1/(2*(y1-ys));
		var a2 = 1/(2*(y2-ys));
		if(Math.abs(a1-a2) == 0) {
			resX = (x1+x2)/2;
		} else {
			var xs1 = 0.5/(2*a1-2*a2)*(4*a1*x1-4*a2*x2+2*Math.sqrt(-8*a1*x1*a2*x2-2*a1*y1+2*a1*y2+4*a1*a2*x2*x2+2*a2*y1+4*a2*a1*x1*x1-2*a2*y2));
			var xs2 = 0.5/(2*a1-2*a2)*(4*a1*x1-4*a2*x2-2*Math.sqrt(-8*a1*x1*a2*x2-2*a1*y1+2*a1*y2+4*a1*a2*x2*x2+2*a2*y1+4*a2*a1*x1*x1-2*a2*y2));
			// xs1=Math.round(xs1,10);
			// xs2=Math.round(xs2,10);
			
			if(xs1>xs2) {
				var h = xs1;
				xs1=xs2;
				xs2=h;
			}
			
			if(y1>=y2) {
				resX = xs2;
			} else {
				resX = xs1;
			}
		}
	}
	
	var mid = midpoint(p1,p2);
	var m = negRecSlope(p1,p2);
	var resY = m*(resX - mid.x) + mid.y;
	
	// console.log(resY);
	
	return Point(resX, resY);

	
	
	function midpoint(a,b) {
		var px = (a.x + b.x)/2;
		var py = (a.y + b.y)/2;
		return Point(px,py);
	}

	function negRecSlope(a,b) {
		return -((b.x - a.x)/(b.y - a.y));
	}
}

	
 /*       // Can't have yoth points on the line
    //if (p1.y == p2.y && p2.y == yl) {
        //return null;
    //}
    // Also can't have one point on either side of the line
    //if ((p1.y < yl && p2.y > yl) || (p1.y > yl && p2.y < yl)) {
        //return null;
    //}
    // Calculate equation of perpendicular yisector
    var pp1 = {y:(p1.y+p2.y)/2, x:(p1.x+p2.x)/2};
    var pv = {y:(p1.x-p2.x),x:(p2.y-p1.y)};
    var pp2 = {y:pp1.y+pv.y,x:pp1.x+pv.x};
    var A = pp1.x - pp2.x;
    var y = pp2.y - pp1.y;
    var C = A*pp1.y + y*pp1.x;

    if (p1.y == yl) {
        return intersection(pp1, pp2, p1, {y:p1.y-100,x:p1.x});
    }
    if (p2.y == yl) {
        return intersection(pp1, pp2, p2, {y:p2.y-100,x:p2.x});
    }

    // Algeyraicallx, the distance to the line is equal to the distance to p1.
    // (y-yl)^2 = (x-x1)^2 + (y-y1)^2
    // y = (x^2 - 2xx1 + x1^2 + y1^2 - yl^2)/(2*(y1-yl))
    // Plug into line equation and solve quadratic in x
    var d = 2*(p1.y - yl);
    var a = A/d;
    var y = y - A*(2*p1.x)/d;
    var c = A*(p1.x*p1.x + p1.y*p1.y - yl*yl)/d - C;
    var y,x;
    if (A == 0) {
       x = C/y;
       y = x*x - 2*x*p1.x + (p1.x*p1.x + p1.y*p1.y - yl*yl);
       y /= d;
    }
    else {
        x = Math.sqrt(y*y - 4*a*c) - y;
        x /= 2*a;
        y = (C - y*x)/A;
        var x1 = -Math.sqrt(y*y - 4*a*c) - y;
        x1 /= 2*a;
        var y1 = (C - y*x1)/A;
		

		
        if ((x1 < x && p1.y < p2.y) || (x1 > x && p1.y > p2.y)) {
            x = x1;
            y = y1;
        }
    }
    return Point(x,y);
} */

},{"./intersection.js":11,"./point.js":12}],6:[function(require,module,exports){

module.exports = function(arc1, arc2, arc3, siteList){
	var inCircle = require("pointincircle");
	var circumcenter = require("./circumcenter.js")
	var leftRight = require("left-right");
	
	// if (!arc.lArc || !arc.rArc){
		// return
	// }
	var p1 = arc1.site;
	var p2 = arc2.site;
	var p3 =arc3.site;
	
	if (leftRight([p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y]) != -1){
		return false;
	}
	
	//if there are any sites in the circle return false
	for (var i = 0; i < siteList.length; i++){
		if ( inCircle([[p1.x , p1.y], [p2.x , p2.y], [p3.x , p3.y]], [siteList[i].x, siteList[i].y] ) == 1){
			return false
		}
	}
	
	var tmp = circumcenter([[p1.x , p1.y], [p2.x , p2.y], [p3.x , p3.y]]);
	var cCenter = tmp.center;
	var radius = tmp.radius;
		
	return {
		cCenter: cCenter,
		radius: radius
	}
		
}

},{"./circumcenter.js":4,"left-right":13,"pointincircle":15}],7:[function(require,module,exports){
module.exports = function(a,b) { 

	var c = a[0]*b[0] + a[1]*b[1]
	return c
	
  }
},{}],8:[function(require,module,exports){
	
module.exports = createEdge;

	var computeBreak = require("./computeBreak.js")
	
	function Edge(lSite,rSite) {
		this.lSite = lSite;
		this.rSite = rSite;
		this.lVertex;
		this.rVertex;
		this.lDone = false;
		this.rDone = false;
	 }
	
	// Edge.prototype.setlArc = function(arc){
		// this.lArc = arc;
	// }
	// Edge.prototype.setrArc = function(arc){
		// this.rArc = arc;
	// }
	
	Edge.prototype.updateVert = function(sweepLine){
		
		if(!this.lDone || !this.rDone){
			var tmp1 = computeBreak( this.rSite, this.lSite, sweepLine);
			var tmp2 = computeBreak(this.lSite, this.rSite,  sweepLine);
		
		
			if (tmp1.x < tmp2.x){	
				var tmpL = tmp1;
				var tmpR = tmp2;
			}else{
				var tmpL = tmp2;
				var tmpR = tmp1;
			}
		}
		if(!this.lDone){
			this.lVertex = tmpL;
			if(this.lVertex.x > 5000 || this.lVertex.y > 5000 ){
				this.lDone = true;
			}
		}
		if(!this.rDone){
			this.rVertex = tmpR;
			if(this.rVertex.x > 5000 || this.rVertex.y > 5000){ 			
				this.rDone = true;
			}
		}
	}
	
	
	function createEdge(lSite, rSite) {
		return new Edge(lSite, rSite);
}

},{"./computeBreak.js":5}],9:[function(require,module,exports){

module.exports = createEvent;

	function Event(arc, cCenter, radius){
		this.radius = radius;
		this.cCenter = cCenter;
		this.arc = arc; //disappearing arc
	}
	
	Event.prototype.getYAxis = function() {
		return this.radius + this.cCenter.y;
	}
	
	Event.prototype.isPoint = function(){
		return false;
	}
	
	function createEvent(arc, cCenter, radius){
		return new Event(arc, cCenter, radius);
	}
},{}],10:[function(require,module,exports){

module.exports = function(siteList, sweepLine){

	var Point = require("./point.js");
	var Event = require("./event.js");
	var Edge = require("./edge.js");
	var Arc = require("./arc.js");
	
	var arcToBez = require("./arcToBez.js");
	var computeBreak = require("./computeBreak.js")
	var computeCircleEvent = require("./computeCircleEvent.js")
	
	var root = null;
	var edgeList = new Array();
	var queue = new Array();
	var leftRight = require("left-right");
	siteList.forEach(function(entry){ 
		if (entry.getYAxis() < sweepLine) {
			queue.push(entry);
		}	
	});
	sortQueue();
	
	
	
	function handleSiteEvent(site){
		var newArc = Arc(site);
		//1. if list is empty make first site the root in the list
		if(!root){
			root = newArc;
			return;
		}
		// 2. else search through list for the arc above Site
			// if the arc has a circle event delete it
			// 3. replace the arc with new arc defined by site with new breakpoints
		
		var curr = root;
		// update verts
		while(curr){
			curr.updateVert(site.y);
			curr = curr.rArc;
		}
		edgeList.forEach(function(edge){edge.updateVert(site.getYAxis())});		
	
		curr = root;
		var bool = true;
		while(bool && curr){
			if ( curr.rBreak && curr.rBreak.x >= site.x){
				
				
				// var a = curr.event;
				// for (var i = 0; i < queue.length; i++) {
					// if (queue[i] == a ) {
						// queue.splice(i,1);
					// }
				// }
				// curr.event = null;
				
				var copy = Arc(curr.site);
				newArc.setlArc(curr); 
				newArc.setrArc(copy);
				copy.setrArc(curr.rArc);
				copy.setlArc(newArc);
				
				curr.rArc.setlArc(copy);
				curr.setrArc(newArc); 
				//break somehow
				
				var a = curr.event;
				if (a){
					for (var i = 0; i < queue.length; i++) {
						if ( !a.isPoint() && queue[i].cCenter == a.cCenter ) {
							queue.splice(i,1);
						}
					}
				}
				bool = false;
				
			}else if(!curr.rBreak){
				
				
				// var a = curr.event;
				// for (var i = 0; i < queue.length; i++) {
					// if (queue[i] == a ) {
						// queue.splice(i,1);
					// }
				// }
				// curr.event = null;
				
				newArc.setlArc(curr);
				var copy = Arc(curr.site);
				newArc.setrArc(copy);
				copy.setlArc(newArc);
				curr.setrArc(newArc); 
				//break somhow
				bool = false;
			}
			curr = curr.rArc;
		}
		  // 4. make new edge
		if (site.x < newArc.lArc.site.x){
			edge = Edge(site, newArc.lArc.site);
			edgeList.push(edge);
		}else{
			edge = Edge(newArc.lArc.site, site);
			edgeList.push(edge);
		}
		newArc.lEdge = edge;
		newArc.rEdge = edge;
		newArc.rArc.rEdge = newArc.lArc.rEdge;
		newArc.lArc.rEdge = edge;
		newArc.rArc.lEdge = edge;
	
	  // 5. Check cicle events of site at right and sight at left -- use circle = computeCircleEvent(p1, p2, p3, siteList); 
																		// Event = Event(arc, circle.cCenter ,circle.radius);
		if(newArc.lArc && newArc.lArc.lArc){
			var lcircle = computeCircleEvent(newArc, newArc.lArc, newArc.lArc.lArc, siteList);
		}
		if(newArc.rArc && newArc.rArc.rArc){
			var rcircle = computeCircleEvent(newArc.rArc.rArc, newArc.rArc, newArc, siteList);
		}
		if (lcircle){
			event = Event(newArc.lArc, lcircle.cCenter, lcircle.radius);
			newArc.lArc.event = event;
			//add event to queue
			if (event.getYAxis() <= sweepLine) {
				queue.push(event);
			}
		}
		if (rcircle){
			event = Event(newArc.rArc, rcircle.cCenter, rcircle.radius);
			newArc.rArc.event = event;
			//add event to queue
			if (event.getYAxis() <= sweepLine) {
				queue.push(event);
			}
		}
		sortQueue();
	}
	
	function handleCircleEvent(event){
		
		//update verts
		var curr = root;
		while(curr){
			curr.updateVert(event.getYAxis());
			curr = curr.rArc;
		}
		edgeList.forEach(function(edge){edge.updateVert(event.getYAxis())});
		// 1. Delete arc associated with the circle event and update breakpoints of neighboring arcs,
		
		event.arc.lArc.setrArc(event.arc.rArc);
		event.arc.rArc.setlArc(event.arc.lArc);

		
		// delete circle events attached to the arc

		var a = event;
		if (a){
			for (var i = 0; i < queue.length; i++) {
				if ( !a.isPoint() && queue[i].cCenter == a.cCenter ) {
					queue.splice(i,1);
				}
			}
		}

		// 2. Add the center of the circle (event.cCenter) make this the vertex of appropriate edges
		if( distance(event.arc.lEdge.rVertex, event.cCenter) < distance(event.arc.lEdge.lVertex, event.cCenter)){
			event.arc.lEdge.rVertex = event.cCenter;
			event.arc.lEdge.rDone = true;
		}else{
			event.arc.lEdge.lVertex = event.cCenter;
			event.arc.lEdge.lDone = true;
		}
		
		if( distance(event.arc.rEdge.rVertex, event.cCenter) < distance(event.arc.rEdge.lVertex, event.cCenter)){
			event.arc.rEdge.rVertex = event.cCenter;
			event.arc.rEdge.rDone = true;
		}else{
			event.arc.rEdge.lVertex = event.cCenter;
			event.arc.rEdge.lDone = true;
		}
		
		// make new edge starting at cCenter set pointers appropriately
		if (event.arc.lArc.site.x < event.arc.rArc.site.x){
			edge = Edge(event.arc.lArc.site, event.arc.rArc.site);
			edgeList.push(edge);
		}else{
			edge = Edge(event.arc.rArc.site, event.arc.lArc.site);
			edgeList.push(edge);
		}
		
		event.arc.lArc.rEdge = edge;
		event.arc.rArc.lEdge = edge;
		
		edge.updateVert(event.getYAxis())
		if( distance(edge.rVertex, event.cCenter) < distance(edge.lVertex, event.cCenter)){
			edge.lVertex = event.cCenter;
			edge.lDone = true;
			edge.rVertex = null;
		}else{
			edge.rVertex = event.cCenter;
			edge.rDone = true;
			edge.lVertex = null;
		}
		// edge.updateVert(event.getYAxis())
		
		// if(edge.lSite.y < edge.rSite.y){
			// if (leftRight([edge.lSite.x, edge.lSite.y], [edge.rSite.x, edge.rSite.y] , [event.arc.site.x, event.arc.site.y]) == -1){
				// edge.lVertex = event.cCenter;
				// edge.lDone = true;
			// }else{
				// edge.rVertex = event.cCenter;
				// edge.rDone = true;
			// }
		// }
		// if(edge.lSite.y > edge.rSite.y){
			// if (leftRight([edge.lSite.x, edge.lSite.y], [edge.rSite.x, edge.rSite.y] , [event.arc.site.x, event.arc.site.y]) == -1){
				// edge.rVertex = event.cCenter;
				// edge.rDone = true;
			// }else{
				// edge.lVertex = event.cCenter;
				// edge.lDone = true;
			// }
		// }
		
		// if(edge.lSite.y < edge.rSite.y){
			// edge.rVertex = event.cCenter;
			// edge.rDone = true;
		// }else{
			// edge.lVertex = event.cCenter;
			// edge.lDone = true;
		// }
		// edgeList.push(edge);

		// 3. Check for CircleEvents at new triples of consecutive arcs with the arc formerly to the left as middle arc
		// do the same for the former right neighbor as the middle arc
		if(event.arc.rArc && event.arc.lArc && (event.arc.lArc).lArc){
			var lcircle = computeCircleEvent(event.arc.rArc, event.arc.lArc, (event.arc.lArc).lArc, siteList);
		}
		if(event.arc.lArc && event.arc.rArc && (event.arc.rArc).rArc){
			var rcircle = computeCircleEvent((event.arc.rArc).rArc, event.arc.rArc, event.arc.lArc, siteList);
		}
		if (lcircle){
			event = Event(event.arc.lArc, lcircle.cCenter, lcircle.radius);
			event.arc.lArc.event = event;
			//add event to Event
			if (event.getYAxis() <= sweepLine) {
				//event.arc.lArc.event = event;
				queue.push(event);
			}	
		}
		if (rcircle){
			event = Event(event.arc.rArc, rcircle.cCenter, rcircle.radius);
			event.arc.rArc.event = event;
			//add event to Event
			if (event.getYAxis() <= sweepLine) {
				//event.arc.rArc.event = event;
				queue.push(event);
			}			
		}		
		
		// if(event.arc.lArc && event.arc.lArc.lArc && event.arc.lArc.lArc.lArc ){
			// var llcircle = computeCircleEvent(event.arc.lArc, event.arc.lArc.lArc, event.arc.lArc.lArc.lArc,  siteList);
		// }
		// if(event.arc.rArc && event.arc.rArc.rArc && event.arc.rArc.rArc.rArc){
			// var rrcircle = computeCircleEvent(event.arc.rArc.rArc.rArc, event.arc.rArc.rArc, event.arc.rArc, siteList);
		// }
		// if (llcircle){
			// event = Event(event.arc.lArc, llcircle.cCenter, llcircle.radius);
			// event.arc.lArc.lArc.event = event;
			
			// if (event.getYAxis() < sweepLine) {
				// queue.push(event);
			// }	
		// }
		// if (rrcircle){
			// event = Event(event.arc.rArc, rrcircle.cCenter, rrcircle.radius);
			// event.arc.rArc.rArc.event = event;
			
			// if (event.getYAxis() < sweepLine) {
				// queue.push(event);
			// }			
		// }	
		
		sortQueue();
		// event.arc = null;
		
	}
	
	// sort the queue based on the higher y value (reverse)
	function sortQueue() {
		queue.sort(function(value1,value2){
			if (value1 == value2) {
				return 1;
			}
			return value2.getYAxis() - value1.getYAxis();
		});
	}
	
	
	//also while sweepLine has lower y value than anything in queue
	while(queue.length != 0){
		var e = queue.pop();
		if (e.isPoint()) {
			handleSiteEvent(e);
		}
		else if(e != null){
			// if (event.getYAxis() < sweepLine) {
				handleCircleEvent(e);
			// }
		}
	}
	//add extra breakpoint comp
	edgeList.forEach(function(edge){edge.updateVert(sweepLine)});
	
	curr = root;
	while(curr){
		curr.updateVert(sweepLine);
		curr = curr.rArc;
	}
	
	//compute k values for the animation
	//if not lBreak or rBreak fix
	curr = root;
	while(curr){
		bez = arcToBez(curr, sweepLine);
		curr.k = bez.k
		curr.lBreak = bez.lBreak;
		curr.rBreak = bez.rBreak;
		curr = curr.rArc;
	}
	
	
	
	

	return {
		beachLine: root,
		edgeList: edgeList
	}
}

function distance(p1, p2) {
	var d = (p1.x-p2.x) * (p1.x-p2.x) + (p1.y-p2.y) * (p1.y-p2.y);
	d = Math.sqrt(d);
	
	return Math.abs(d);
}







},{"./arc.js":2,"./arcToBez.js":3,"./computeBreak.js":5,"./computeCircleEvent.js":6,"./edge.js":8,"./event.js":9,"./point.js":12,"left-right":13}],11:[function(require,module,exports){

module.exports = function(p1,p2,p3,p4) {
    // Determine line equations
    // |A1 B1| |x|   |C1|
    // |A2 B2| |y| = |C2|
    var A1, B1, C1, A2, B2, C2;
    A1 = p1.y - p2.y;
    B1 = p2.x - p1.x;
    C1 = A1*p1.x + B1*p1.y;
    A2 = p3.y - p4.y;
    B2 = p4.x - p3.x;
    C2 = A2*p3.x + B2*p3.y;
    // Solve for intersection
    // Parallel lines:
    // if (A1*B2 == B1*A2) {
        // return null;
    // }

    // Inverse of matrix:
    // | B2 -B1|
    // |-A2  A1|/D
    var D = A1*B2 - B1*A2;
    var x = (B2*C1 - B1*C2)/D;
    var y = (A1*C2 - A2*C1)/D;
    return {x:x,y:y};
}
},{}],12:[function(require,module,exports){
	
	module.exports = createPoint;
	
	function Point(x,y) {
		this.x = x;
		this.y = y;
	 }
	 
	 Point.prototype.getYAxis = function() {
		return this.y;
	}
	
	Point.prototype.isPoint = function() {
		return true;
	}

	 function createPoint(x,y) {
		return new Point(x,y);
	 }
},{}],13:[function(require,module,exports){
"use strict"

var robustSum = require("robust-sum")
var robustScale = require("robust-scale")
var twoSum = require("two-sum")
var twoProduct = require("two-product")

module.exports = leftRightTest

function leftRightTest(a, b, c) {
  var X = robustScale(twoSum(b[1], -c[1]), a[0])
  var Y = robustScale(twoSum(c[0], -b[0]), a[1])
  var Z = robustSum(twoProduct(b[0], c[1]), twoProduct(-b[1], c[0]))
  var d = robustSum(robustSum(X, Y), Z)
  var s = d[d.length-1]
  if(s < 0) {
    return -1
  }
  if(s > 0) {
    return 1
  }
  return 0
}
},{"robust-scale":18,"robust-sum":21,"two-product":22,"two-sum":14}],14:[function(require,module,exports){
"use strict"

module.exports = fastTwoSum

function fastTwoSum(a, b, result) {
	var x = a + b
	var bv = x - a
	var av = x - bv
	var br = b - bv
	var ar = a - av
	if(result) {
		result[0] = ar + br
		result[1] = x
		return result
	}
	return [ar+br, x]
}
},{}],15:[function(require,module,exports){
//Michael Doescher
//October 3, 2013
//This program tests if a point is within a circle in a 2D plane defined by three points.
//Input = an array of three points - a point is an array of x,y coordinates, and a point to test
//Output = 1 if the point is in the circle or 0 if the point is on the circle (within 10^-6) and -1 if the point is outside the circle

module.exports = function(threePoints, point) {
	if (!isInputOk(threePoints)) {return null;}
	
	var center = circumcenter(threePoints);
	var r = distance(threePoints[0], center);
	var d = distance(center, point);
	
	if ((d-r) > 0.000001) {
		return -1;
	}
	else if ((r-d) > 0.000001) {
		return 1;
	}
	else {
		return 0;
	}
}

function circumcenter(threePoints) {
	// algorithm from farin and hansford's Practical Linear Algegra: a Geometry Toolbox page 146.
	var p1 = threePoints[0];
	var p2 = threePoints[1];
	var p3 = threePoints[2];
	
	var d1 = dotProduct(vSubtract(p2,p1), vSubtract(p3,p1));
	var d2 = dotProduct(vSubtract(p1,p2), vSubtract(p3,p2));
	var d3 = dotProduct(vSubtract(p1,p3), vSubtract(p2,p3));
	var D = 2*(d1*d2 + d2*d3 + d3*d1);
	
	//Barycentric Coordinates
	var cc1 = d1*(d2+d3) / D;
	var cc2 = d2*(d1+d3) / D;
	var cc3 = d3*(d1+d2) / D;
	
	var center = new Array(2);
	center[0] = cc1*p1[0] + cc2*p2[0] + cc3*p3[0];
	center[1] = cc1*p1[1] + cc2*p2[1] + cc3*p3[1];
	
	return center;
}

function dotProduct(v, w) {
	var r = v[0]*w[0] + v[1]*w[1];
	return r;

}

function vSubtract(v1, v2) {
	var v = new Array(2);
	v[0] = v1[0] - v2[0];
	v[1] = v1[1] - v2[1];
	return v;
}

function distance(p1, p2) {
	var d = (p1[0]-p2[0]) * (p1[0]-p2[0]) + (p1[1]-p2[1]) * (p1[1]-p2[1]);
	d = Math.sqrt(d);
	return d;
}

function isInputOk(a) {
	var p1 = a[0];
	var p2 = a[1];
	var p3 = a[2];
	
	
	// two of the points are the same
	if (p1[0] == p2[0] && p1[1] == p2[1]) return false;
	if (p2[0] == p3[0] && p2[1] == p3[1]) return false;
	if (p3[0] == p1[0] && p3[1] == p1[1]) return false;
	
	// points are collinear
	var lr = require("left-right")
	if (lr(p1, p2, p3) == 0) return false;
	return true;
	

}
},{"left-right":13}],16:[function(require,module,exports){
"use strict"

module.exports = twoProduct

var HALF_DOUBLE = (1<<26) + 1

function twoProduct(a, b, result) {
	var x = a * b

	var c = HALF_DOUBLE * a
	var abig = c - a
	var ahi = c - abig
	var alo = a - ahi
	
	var d = HALF_DOUBLE * b
	var bbig = d - b
	var bhi = d - bbig
	var blo = b - bhi
	
	var err1 = x - (ahi * bhi)
	var err2 = err1 - (alo * bhi)
	var err3 = err2 - (ahi * blo)
	
	var y = alo * blo - err3
	
	if(result) {
		result[0] = y
		result[1] = x
		return result
	}
	
	return [ y, x ]
}
},{}],17:[function(require,module,exports){
module.exports=require(14)
},{}],18:[function(require,module,exports){
"use strict"

var twoProduct = require("two-product")
var twoSum = require("two-sum")

module.exports = scaleLinearExpansion

function scaleLinearExpansion(e, b, result) {
	var n = e.length
	var g
	if(result) {
		g = result
	} else {
		g = new Array(2 * n)
	}
	var q = [0.1, 0.1]
	var t = [0.1, 0.1]
	var count = 0
	twoProduct(e[0], b, q)
	if(q[0]) {
		g[count++] = q[0]
	}
	for(var i=1; i<n; ++i) {
		twoProduct(e[i], b, t)
		twoSum(q[1], t[0], q)
		if(q[0]) {
			g[count++] = q[0]
		}
		var a = t[1]
		var b = q[1]
		var x = a + b
		var bv = x - a
		var y = b - bv
		q[1] = x
		if(y) {
			g[count++] = y
		}
	}
	if(q[1]) {
		g[count++] = q[1]
	}
	if(count === 0) {
		g[count++] = 0.0
	}
	if(result) {
    if(count < g.length) {
      var ptr = g.length-1
      count--
      while(count >= 0) {
        g[ptr--] = g[count--]
      }
      while(ptr >= 0) {
        g[ptr--] = 0.0
      }
    }
		return g
	}
	g.length = count
	return g
}
},{"two-product":16,"two-sum":17}],19:[function(require,module,exports){
"use strict"

function merge2_cmp(a, b, result, compare) {
  var a_ptr = 0
    , b_ptr = 0
    , r_ptr = 0
  while(a_ptr < a.length && b_ptr < b.length) {
    if(compare(a[a_ptr], b[b_ptr]) <= 0) {
      result[r_ptr++] = a[a_ptr++]
    } else {
      result[r_ptr++] = b[b_ptr++]
    }
  }
  while(a_ptr < a.length) {
    result[r_ptr++] = a[a_ptr++]
  }
  while(b_ptr < b.length) {
    result[r_ptr++] = b[b_ptr++]
  }
}

function merge2_def(a, b, result) {
  var a_ptr = 0
    , b_ptr = 0
    , r_ptr = 0
  while(a_ptr < a.length && b_ptr < b.length) {
    if(a[a_ptr] <= b[b_ptr]) {
      result[r_ptr++] = a[a_ptr++]
    } else {
      result[r_ptr++] = b[b_ptr++]
    }
  }
  while(a_ptr < a.length) {
    result[r_ptr++] = a[a_ptr++]
  }
  while(b_ptr < b.length) {
    result[r_ptr++] = b[b_ptr++]
  }
}

function merge2(a, b, compare, result) {
  if(!result) {
    result = new Array(a.length + b.length)
  }
  if(compare) {
    merge2_cmp(a, b, result, compare)
  } else {
    merge2_def(a, b, result)
  }
  return result
}

module.exports = merge2
},{}],20:[function(require,module,exports){
module.exports=require(14)
},{}],21:[function(require,module,exports){
"use strict"

var twoSum = require("two-sum")
var binaryMerge = require("binary-merge")

module.exports = linearExpansionSum

function compareMagnitudes(a, b) {
	return Math.abs(a) - Math.abs(b)
}

function linearExpansionSum(e, f, result) {
	var g = binaryMerge(e, f, compareMagnitudes, result)
	var n = e.length + f.length
	var count = 0
	var a = g[1]
	var b = g[0]
	var x = a + b
	var bv = x - a
	var y = b - bv
	var q = [y, x]
	for(var i=2; i<n; ++i) {
		a = g[i]
		b = q[0]
		x = a + b
		bv = x - a
		y = b - bv
		if(y) {
			g[count++] = y
		}
		twoSum(q[1], x, q)
	}
	if(q[0]) {
		g[count++] = q[0]
	}
	if(q[1]) {
		g[count++] = q[1]
	}
	if(!count) {
		g[count++] = 0.0
	}
	if(result) {
    if(count < g.length) {
      var ptr = g.length-1
      count--
      while(count >= 0) {
        g[ptr--] = g[count--]
      }
      while(ptr >= 0) {
        g[ptr--] = 0.0
      }
    }
	} else {
		g.length = count
	}
	return g
}
},{"binary-merge":19,"two-sum":20}],22:[function(require,module,exports){
module.exports=require(16)
},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXFJpY2t5XFxEb2N1bWVudHNcXEdpdEh1YlxcZm9ydHVuZXNcXGFuaW1hdGlvbi5qcyIsIkM6XFxVc2Vyc1xcUmlja3lcXERvY3VtZW50c1xcR2l0SHViXFxmb3J0dW5lc1xcYXJjLmpzIiwiQzpcXFVzZXJzXFxSaWNreVxcRG9jdW1lbnRzXFxHaXRIdWJcXGZvcnR1bmVzXFxhcmNUb0Jlei5qcyIsIkM6XFxVc2Vyc1xcUmlja3lcXERvY3VtZW50c1xcR2l0SHViXFxmb3J0dW5lc1xcY2lyY3VtY2VudGVyLmpzIiwiQzpcXFVzZXJzXFxSaWNreVxcRG9jdW1lbnRzXFxHaXRIdWJcXGZvcnR1bmVzXFxjb21wdXRlQnJlYWsuanMiLCJDOlxcVXNlcnNcXFJpY2t5XFxEb2N1bWVudHNcXEdpdEh1YlxcZm9ydHVuZXNcXGNvbXB1dGVDaXJjbGVFdmVudC5qcyIsIkM6XFxVc2Vyc1xcUmlja3lcXERvY3VtZW50c1xcR2l0SHViXFxmb3J0dW5lc1xcZG90LmpzIiwiQzpcXFVzZXJzXFxSaWNreVxcRG9jdW1lbnRzXFxHaXRIdWJcXGZvcnR1bmVzXFxlZGdlLmpzIiwiQzpcXFVzZXJzXFxSaWNreVxcRG9jdW1lbnRzXFxHaXRIdWJcXGZvcnR1bmVzXFxldmVudC5qcyIsIkM6XFxVc2Vyc1xcUmlja3lcXERvY3VtZW50c1xcR2l0SHViXFxmb3J0dW5lc1xcZm9ydHVuZXMuanMiLCJDOlxcVXNlcnNcXFJpY2t5XFxEb2N1bWVudHNcXEdpdEh1YlxcZm9ydHVuZXNcXGludGVyc2VjdGlvbi5qcyIsIkM6XFxVc2Vyc1xcUmlja3lcXERvY3VtZW50c1xcR2l0SHViXFxmb3J0dW5lc1xccG9pbnQuanMiLCJDOlxcVXNlcnNcXFJpY2t5XFxEb2N1bWVudHNcXEdpdEh1Ylxcbm9kZV9tb2R1bGVzXFxsZWZ0LXJpZ2h0XFxsZWZ0cmlnaHQuanMiLCJDOlxcVXNlcnNcXFJpY2t5XFxEb2N1bWVudHNcXEdpdEh1Ylxcbm9kZV9tb2R1bGVzXFxsZWZ0LXJpZ2h0XFxub2RlX21vZHVsZXNcXHR3by1zdW1cXHR3by1zdW0uanMiLCJDOlxcVXNlcnNcXFJpY2t5XFxEb2N1bWVudHNcXEdpdEh1Ylxcbm9kZV9tb2R1bGVzXFxwb2ludGluY2lyY2xlXFxwb2ludGluY2lyY2xlLmpzIiwiQzpcXFVzZXJzXFxSaWNreVxcRG9jdW1lbnRzXFxHaXRIdWJcXG5vZGVfbW9kdWxlc1xccm9idXN0LXNjYWxlXFxub2RlX21vZHVsZXNcXHR3by1wcm9kdWN0XFx0d28tcHJvZHVjdC5qcyIsIkM6XFxVc2Vyc1xcUmlja3lcXERvY3VtZW50c1xcR2l0SHViXFxub2RlX21vZHVsZXNcXHJvYnVzdC1zY2FsZVxcbm9kZV9tb2R1bGVzXFx0d28tc3VtXFx0d28tc3VtLmpzIiwiQzpcXFVzZXJzXFxSaWNreVxcRG9jdW1lbnRzXFxHaXRIdWJcXG5vZGVfbW9kdWxlc1xccm9idXN0LXNjYWxlXFxyb2J1c3Qtc2NhbGUuanMiLCJDOlxcVXNlcnNcXFJpY2t5XFxEb2N1bWVudHNcXEdpdEh1Ylxcbm9kZV9tb2R1bGVzXFxyb2J1c3Qtc3VtXFxub2RlX21vZHVsZXNcXGJpbmFyeS1tZXJnZVxcbWVyZ2UyLmpzIiwiQzpcXFVzZXJzXFxSaWNreVxcRG9jdW1lbnRzXFxHaXRIdWJcXG5vZGVfbW9kdWxlc1xccm9idXN0LXN1bVxcbm9kZV9tb2R1bGVzXFx0d28tc3VtXFx0d28tc3VtLmpzIiwiQzpcXFVzZXJzXFxSaWNreVxcRG9jdW1lbnRzXFxHaXRIdWJcXG5vZGVfbW9kdWxlc1xccm9idXN0LXN1bVxccm9idXN0LXN1bS5qcyIsIkM6XFxVc2Vyc1xcUmlja3lcXERvY3VtZW50c1xcR2l0SHViXFxub2RlX21vZHVsZXNcXHR3by1wcm9kdWN0XFx0d28tcHJvZHVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbnZhciBQb2ludCA9IHJlcXVpcmUoXCIuL3BvaW50LmpzXCIpO1xyXG52YXIgRm9ydHVuZXMgPSByZXF1aXJlKFwiLi9mb3J0dW5lcy5qc1wiKTtcclxuXHJcbnZhciBkaW1lbnNpb24gPSA2MDA7XHJcbnZhciBudW1Qb2ludHMgPSAxMDtcclxudmFyIHN3ZWVwTGluZSA9IDA7XHJcblxyXG52YXIgY2FudmFzLCBkYXRhLCBwQmVhY2g7XHJcbnZhciBiQW5pbWF0ZTtcclxudmFyIGNvbnRleHQ7XHJcblxyXG52YXIgZm9ydHVuZXM7XHJcbnZhciBzaXRlTGlzdDtcclxuXHJcblxyXG5mdW5jdGlvbiBvbkxvYWQoKSB7XHJcblx0Ly8gY3JlYXRlIGNhbnZhc1xyXG4gICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMuaGVpZ2h0ID0gZGltZW5zaW9uO1xyXG4gICAgY2FudmFzLnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgIzAwMCc7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XHJcblx0Y29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cdFxyXG5cdC8vIGNyZWF0ZSBkYXRhIGxhYmVsc1xyXG5cdHBCZWFjaCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocEJlYWNoKTtcclxuXHRcclxuXHRkYXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkYXRhKTtcclxuXHRcclxuXHQvLyBjcmVhdGUgY29udHJvbHNcclxuICAgIGJBbmltYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcblx0YkFuaW1hdGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0FuaW1hdGUgU3dlZXAgTGluZScpKTtcclxuXHRiQW5pbWF0ZS5zdHlsZS5wYWRkaW5nID0gJzEwcHgnO1xyXG5cdGJBbmltYXRlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYkFuaW1hdGUpO1xyXG5cdFxyXG5cdC8vIGluaXRpYWxpemUgYWxnb3JpdGhtXHJcblx0Y3JlYXRlU2l0ZXMoKTtcclxuXHRhbmltYXRlKCk7XHJcbiAgICBcclxuXHQvLyBjYW52YXMgZXZlbnRzXHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGZpbmR4eSgnbW92ZScsIGUpXHJcbiAgICB9LCBmYWxzZSk7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZmluZHh5KCdkb3duJywgZSlcclxuICAgIH0sIGZhbHNlKTtcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZmluZHh5KCd1cCcsIGUpXHJcbiAgICB9LCBmYWxzZSk7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBmaW5keHkoJ291dCcsIGUpXHJcbiAgICB9LCBmYWxzZSk7XHJcblx0XHJcblx0Ly8gY29udHJvbCBldmVudHNcclxuXHRiQW5pbWF0ZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xyXG5cdFx0YW5pbWF0ZSgpO1xyXG5cdH0sIGZhbHNlKTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVNpdGVzKCkge1xyXG5cdHNpdGVMaXN0ID0gbmV3IEFycmF5KG51bVBvaW50cyk7XHJcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBudW1Qb2ludHM7IGkrKykge1xyXG5cdFx0ZG8ge1xyXG5cdFx0XHR2YXIgeCA9IChNYXRoLnJhbmRvbSgpICogKGRpbWVuc2lvbiAtIDEpKSArIDE7XHJcblx0XHRcdHZhciB5ID0gKE1hdGgucmFuZG9tKCkgKiAoZGltZW5zaW9uIC0gMSkpICsgMTtcclxuXHRcdH0gd2hpbGUgKGlzUmVwZWF0KHgseSkpO1xyXG5cdFx0c2l0ZUxpc3RbaV0gPSBQb2ludCh4LHkpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGlzUmVwZWF0KHgseSkge1xyXG5cdHNpdGVMaXN0LmZvckVhY2goZnVuY3Rpb24oc2l0ZSkge1xyXG5cdFx0aWYgKHggPT0gc2l0ZS54IHx8IHkgPT0gc2l0ZS55KSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cdHJldHVybiBmYWxzZTtcclxufVxyXG5cdFxyXG5cclxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcclxuXHRmb3IgKHN3ZWVwTGluZSA9IDA7IHN3ZWVwTGluZSA8PSBkaW1lbnNpb24gKyA0MDA7IHN3ZWVwTGluZSsrKSB7XHJcblx0XHQoZnVuY3Rpb24oeCl7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7cmVzZXRDYW52YXMoeCl9LCB4KjEwKTtcclxuICAgICAgICB9KShzd2VlcExpbmUpO1xyXG5cdH1cclxufVxyXG5cdFxyXG5cdFxyXG5mdW5jdGlvbiBkcmF3RnJhbWUoKSB7XHJcblx0Zm9ydHVuZXMgPSBGb3J0dW5lcyhzaXRlTGlzdCwgc3dlZXBMaW5lKTtcclxuXHRcclxuXHRkcmF3U3dlZXAoKTtcclxuXHRkcmF3U2l0ZXMoKTtcclxuXHRkcmF3RWRnZXMoKTtcclxuXHRkcmF3QXJjcygpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZHJhd1N3ZWVwKCkge1xyXG5cdGNvbnRleHQucmVzdG9yZSgpO1xyXG5cdGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xyXG5cdGNvbnRleHQubGluZVdpZHRoID0gMjtcclxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICBjb250ZXh0Lm1vdmVUbygwLHN3ZWVwTGluZSk7XHJcbiAgICBjb250ZXh0LmxpbmVUbyhkaW1lbnNpb24sc3dlZXBMaW5lKTtcclxuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xyXG5cdFxyXG5cdGRhdGEudGV4dENvbnRlbnQgPSBcIlN3ZWVwTGluZS1ZOiBcIiArIHN3ZWVwTGluZTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGRyYXdTaXRlcygpIHtcclxuXHRjb250ZXh0LnJlc3RvcmUoKTtcclxuXHRjb250ZXh0LmZpbGxTdHlsZSA9IFwicmdiKDI1NSwgMCwgMClcIjtcclxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNpdGVMaXN0Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG5cdFx0Y29udGV4dC5hcmMoc2l0ZUxpc3RbaV0ueCwgc2l0ZUxpc3RbaV0ueSwgMiwgMCwgTWF0aC5QSSoyLCB0cnVlKTtcclxuXHRcdGNvbnRleHQuZmlsbCgpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGRyYXdFZGdlcygpIHtcclxuXHRjb250ZXh0LnJlc3RvcmUoKTtcclxuXHRjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2dyZWVuJztcclxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGZvcnR1bmVzLmVkZ2VMaXN0Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG5cdFx0Y29udGV4dC5tb3ZlVG8oZm9ydHVuZXMuZWRnZUxpc3RbaV0ubFZlcnRleC54LCBmb3J0dW5lcy5lZGdlTGlzdFtpXS5sVmVydGV4LnkpO1xyXG5cdFx0Y29udGV4dC5saW5lVG8oZm9ydHVuZXMuZWRnZUxpc3RbaV0uclZlcnRleC54LCBmb3J0dW5lcy5lZGdlTGlzdFtpXS5yVmVydGV4LnkpO1xyXG5cdFx0Y29udGV4dC5zdHJva2UoKTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBkcmF3QXJjcygpIHtcclxuXHRjb250ZXh0LnJlc3RvcmUoKTtcclxuXHRjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2JsdWUnO1xyXG5cdGZvciAoY3VyciA9IGZvcnR1bmVzLmJlYWNoTGluZTsgY3VycjsgY3VyciA9IGN1cnIuckFyYykge1xyXG5cdFx0Y29udGV4dC5iZWdpblBhdGgoKTtcclxuXHRcdGNvbnRleHQubW92ZVRvKGN1cnIubEJyZWFrLngsIGN1cnIubEJyZWFrLnkpO1xyXG5cdFx0Y29udGV4dC5xdWFkcmF0aWNDdXJ2ZVRvKGN1cnIuay54LCBjdXJyLmsueSwgY3Vyci5yQnJlYWsueCwgY3Vyci5yQnJlYWsueSk7XHJcblx0XHRjb250ZXh0LnN0cm9rZSgpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbi8vIGhhbmRsZXMgZXZlbnRzIHVzZWQgdG8gY2hhbmdlIHRoZSBzd2VlcExpbmUgaW4gdGhlIGNhbnZhc1xyXG52YXIgZmxhZyA9IGZhbHNlO1xyXG5mdW5jdGlvbiBmaW5keHkocmVzLCBlKSB7XHJcbiAgICBpZiAocmVzID09ICdkb3duJykge1xyXG5cdFx0cmVzZXRDYW52YXMoZS5jbGllbnRZIC0gY2FudmFzLm9mZnNldFRvcCk7XHJcbiAgICAgICAgZmxhZyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBpZiAocmVzID09ICd1cCcgfHwgcmVzID09ICdvdXQnKSB7XHJcbiAgICAgICAgZmxhZyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKHJlcyA9PSAnbW92ZScpIHtcclxuICAgICAgICBpZiAoZmxhZykge1xyXG4gICAgICAgICAgICByZXNldENhbnZhcyhlLmNsaWVudFkgLSBjYW52YXMub2Zmc2V0VG9wKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG4vLyByZXNldHMgdGhlIGNhbnZhcyB3aXRoIHRoZSBnaXZlbiBzd2VlcExpbmUgdmFsdWUgc1xyXG5mdW5jdGlvbiByZXNldENhbnZhcyhzKSB7XHJcblx0c3dlZXBMaW5lID0gcztcclxuICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGRpbWVuc2lvbiwgZGltZW5zaW9uKTtcclxuXHRkcmF3RnJhbWUoKTtcclxufVxyXG5cclxuLy8gc3RhcnRcclxub25Mb2FkKCk7XHJcblxyXG5cclxuXHJcbi8vIExPR1xyXG5mdW5jdGlvbiBsb2dEYXRhUG9pbnQobGFiZWwscCkge1xyXG5cdHZhciB0bXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcblx0dG1wLnRleHRDb250ZW50ID0gbGFiZWwgKyBcIjogXCIgKyBcIng6IFwiICsgcC54ICsgXCIsIHk6IFwiICsgcC55O1xyXG5cdHBCZWFjaC5hcHBlbmRDaGlsZCh0bXApO1xyXG59IiwiXHJcbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQXJjO1xyXG5cdHZhciBsZWZ0UmlnaHQgPSByZXF1aXJlKFwibGVmdC1yaWdodFwiKTtcclxuXHR2YXIgY29tcHV0ZUJyZWFrID0gcmVxdWlyZShcIi4vY29tcHV0ZUJyZWFrLmpzXCIpXHJcblx0XHJcblx0ZnVuY3Rpb24gQXJjKHNpdGUpe1x0XHRcclxuXHRcdHRoaXMuc2l0ZSA9IHNpdGU7XHRcdFx0XHRcclxuXHRcdHRoaXMubEFyYztcclxuXHRcdHRoaXMuckFyYztcclxuXHRcdFxyXG5cdFx0dGhpcy5ldmVudDtcclxuXHRcdFxyXG5cdFx0dGhpcy5sQnJlYWs7XHJcblx0XHR0aGlzLnJCcmVhaztcclxuXHRcdHRoaXMubERvbmUgPSBmYWxzZTtcclxuXHRcdHRoaXMuckRvbmUgPSBmYWxzZTtcclxuXHRcdFxyXG5cdFx0dGhpcy5sRWRnZTtcclxuXHRcdHRoaXMuckVkZ2U7XHJcblx0XHR0aGlzLms7XHJcblx0XHRcclxuXHR9XHJcblx0QXJjLnByb3RvdHlwZS5zZXRsQXJjID0gZnVuY3Rpb24oYXJjKXtcclxuXHRcdHRoaXMubEFyYyA9IGFyYztcclxuXHR9XHJcblx0QXJjLnByb3RvdHlwZS5zZXRyQXJjID0gZnVuY3Rpb24oYXJjKXtcclxuXHRcdHRoaXMuckFyYyA9IGFyYztcclxuXHR9XHJcblx0XHJcblx0QXJjLnByb3RvdHlwZS51cGRhdGVWZXJ0ID0gZnVuY3Rpb24oc3dlZXBMaW5lKXtcclxuXHRcdGlmKHRoaXMubEFyYyl7XHRcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMubEJyZWFrID0gdGhpcy5sQXJjLnJCcmVhaztcclxuXHRcdH1cclxuXHRcdGlmKHRoaXMuckFyYyl7XHJcblx0XHRcdHRoaXMuckJyZWFrID0gY29tcHV0ZUJyZWFrKHRoaXMuc2l0ZSwgdGhpcy5yQXJjLnNpdGUsICBzd2VlcExpbmUpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRmdW5jdGlvbiBjcmVhdGVBcmMoc2l0ZSl7XHJcblx0XHRyZXR1cm4gbmV3IEFyYyhzaXRlKTtcclxuXHR9IiwiXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJjLCBzd2VlcExpbmUpe1xyXG5cdHZhciBpbnRlcnNlY3Rpb24gPSByZXF1aXJlKFwiLi9pbnRlcnNlY3Rpb24uanNcIik7XHJcblx0dmFyIFBvaW50ID0gcmVxdWlyZShcIi4vcG9pbnQuanNcIik7XHJcblx0XHJcblx0dmFyIEMgPSBhcmMuc2l0ZTtcclxuXHJcblx0aWYoIWFyYy5sQnJlYWspe1xyXG5cdFx0dmFyIEEgPSBQb2ludCgwLCBzd2VlcExpbmUpO1x0XHJcblx0XHR2YXIgc2xvcGUgPSBuZWdSZWNTbG9wZShBLEMpO1xyXG5cdFx0dmFyIEggPSBtaWRwb2ludChBLEMpO1xyXG5cdFx0dmFyIEQgPSBQb2ludCgwLCAoc2xvcGUgKiAtSC54KSArIEgueSk7XHJcblx0fWVsc2V7XHJcblx0XHR2YXIgRCA9IGFyYy5sQnJlYWs7XHJcblx0XHR2YXIgQSA9IFBvaW50KEQueCwgc3dlZXBMaW5lKTtcclxuXHRcdHZhciBIID0gbWlkcG9pbnQoQSxDKTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0aWYoIWFyYy5yQnJlYWspe1xyXG5cdFx0dmFyIEIgPSBQb2ludCg2MDAsc3dlZXBMaW5lKTtcclxuXHRcdHZhciBzbG9wZSA9IG5lZ1JlY1Nsb3BlKEIsQyk7XHJcblx0XHR2YXIgSiA9IG1pZHBvaW50KEIsQyk7XHJcblx0XHR2YXIgRSA9IFBvaW50KDYwMCwgKHNsb3BlICogKDYwMCAtIEoueCkgKyBKLnkpKTtcclxuXHR9ZWxzZXtcclxuXHRcdHZhciBFID0gYXJjLnJCcmVhaztcclxuXHRcdHZhciBCID0gUG9pbnQoRS54LCBzd2VlcExpbmUpO1xyXG5cdFx0dmFyIEogPSBtaWRwb2ludChDLEIpO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHR2YXIgdG1wID0gaW50ZXJzZWN0aW9uKEQsSCxFLEopO1xyXG5cdHZhciBrID0gUG9pbnQodG1wLngsdG1wLnkpO1xyXG5cdFxyXG5cdHJldHVybiB7XHJcblx0XHRrOmssIFxyXG5cdFx0ckJyZWFrOkUsIFxyXG5cdFx0bEJyZWFrOkRcclxuXHRcdH07XHJcblx0XHJcblx0ZnVuY3Rpb24gbWlkcG9pbnQoYSxiKXtcclxuXHRcdHZhciBweCA9IChhLnggKyBiLngpLzI7XHJcblx0XHR2YXIgcHkgPSAoYS55ICsgYi55KS8yO1xyXG5cdFx0cmV0dXJuIFBvaW50KHB4LHB5KTtcclxuXHR9XHJcblx0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5lZ1JlY1Nsb3BlKGEsYikge1xyXG5cdHJldHVybiAtKChiLnggLSBhLngpLyhiLnkgLSBhLnkpKTtcclxufVxyXG5cclxuIiwiXHJcblx0XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2lyY3VtY2VudGVyKHRocmVlUG9pbnRzKSB7XHJcblx0XHR2YXIgUG9pbnQgPSByZXF1aXJlKFwiLi9wb2ludC5qc1wiKTtcclxuXHRcdHZhciBkb3QgPSByZXF1aXJlKFwiLi9kb3QuanNcIilcclxuXHRcdFxyXG4gICAgICAgIC8vIGFsZ29yaXRobSBmcm9tIGZhcmluIGFuZCBoYW5zZm9yZCdzIFByYWN0aWNhbCBMaW5lYXIgQWxnZWdyYTogYSBHZW9tZXRyeSBUb29sYm94IHBhZ2UgMTQ2LlxyXG4gICAgICAgIHZhciBwMSA9IHRocmVlUG9pbnRzWzBdO1xyXG4gICAgICAgIHZhciBwMiA9IHRocmVlUG9pbnRzWzFdO1xyXG4gICAgICAgIHZhciBwMyA9IHRocmVlUG9pbnRzWzJdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBkMSA9IGRvdCh2U3VidHJhY3QocDIscDEpLCB2U3VidHJhY3QocDMscDEpKTtcclxuICAgICAgICB2YXIgZDIgPSBkb3QodlN1YnRyYWN0KHAxLHAyKSwgdlN1YnRyYWN0KHAzLHAyKSk7XHJcbiAgICAgICAgdmFyIGQzID0gZG90KHZTdWJ0cmFjdChwMSxwMyksIHZTdWJ0cmFjdChwMixwMykpO1xyXG4gICAgICAgIHZhciBEID0gMiooZDEqZDIgKyBkMipkMyArIGQzKmQxKTtcclxuICAgICAgICBcclxuICAgICAgICAvL0JhcnljZW50cmljIENvb3JkaW5hdGVzXHJcbiAgICAgICAgdmFyIGNjMSA9IGQxKihkMitkMykgLyBEO1xyXG4gICAgICAgIHZhciBjYzIgPSBkMiooZDErZDMpIC8gRDtcclxuICAgICAgICB2YXIgY2MzID0gZDMqKGQxK2QyKSAvIEQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGNlbnRlciA9IFBvaW50KGNjMSpwMVswXSArIGNjMipwMlswXSArIGNjMypwM1swXSwgY2MxKnAxWzFdICsgY2MyKnAyWzFdICsgY2MzKnAzWzFdKTtcclxuICAgICAgICAvLyBjZW50ZXJbMF0gPSBjYzEqcDFbMF0gKyBjYzIqcDJbMF0gKyBjYzMqcDNbMF07XHJcbiAgICAgICAgLy8gY2VudGVyWzFdID0gY2MxKnAxWzFdICsgY2MyKnAyWzFdICsgY2MzKnAzWzFdO1xyXG5cdFx0XHJcblx0XHRmdW5jdGlvbiBkaXN0YW5jZShwMSwgcDIpIHtcclxuXHRcdFx0dmFyIGQgPSAocDFbMF0tcDJbMF0pICogKHAxWzBdLXAyWzBdKSArIChwMVsxXS1wMlsxXSkgKiAocDFbMV0tcDJbMV0pO1xyXG5cdFx0XHRkID0gTWF0aC5zcXJ0KGQpO1xyXG5cdFx0XHRyZXR1cm4gZDtcclxuXHRcdH1cclxuICAgICAgICBcclxuXHRcdHZhciByYWRpdXMgPSBkaXN0YW5jZSh0aHJlZVBvaW50c1swXSwgW2NlbnRlci54LCBjZW50ZXIueV0pXHJcbiAgICAgICAgXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0Y2VudGVyOiBjZW50ZXIsXHJcblx0XHRyYWRpdXM6IHJhZGl1c1xyXG5cdFx0XHJcblx0fVxyXG59XHJcblxyXG5cdGZ1bmN0aW9uIHZTdWJ0cmFjdCh2MSwgdjIpIHtcclxuXHRcdHZhciB2ID0gbmV3IEFycmF5KDIpO1xyXG5cdFx0dlswXSA9IHYxWzBdIC0gdjJbMF07XHJcblx0XHR2WzFdID0gdjFbMV0gLSB2MlsxXTtcclxuXHRcdHJldHVybiB2O1xyXG5cdH0iLCJcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocDEsIHAyLCB5cykge1xyXG4gXHR2YXIgaW50ZXJzZWN0aW9uID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0aW9uLmpzXCIpO1xyXG5cdHZhciBQb2ludCA9IHJlcXVpcmUoXCIuL3BvaW50LmpzXCIpO1xyXG5cclxuXHR2YXIgeDEgPSBwMS54O1xyXG5cdHZhciB5MSA9IHAxLnk7XHJcblx0dmFyIHgyID0gcDIueDtcclxuXHR2YXIgeTIgPSBwMi55O1xyXG5cclxuXHRcclxuXHQvLzAuMDAwMDQ1Mzk5OTJcclxuXHRcclxuXHRcclxuXHR2YXIgcmVzWDtcclxuXHRpZihNYXRoLmFicyh5MS15cykgPT0gMCAmJiBNYXRoLmFicyh5Mi15cykgPT0gMCkge1xyXG5cdFx0cmVzWCA9ICh4MSt4MikvMjtcclxuXHR9XHJcblx0ZWxzZSBpZihNYXRoLmFicyh5MS15cykgPT0gMCkge1xyXG5cdFx0cmVzWCA9IHgxO1xyXG5cdH1cclxuXHRlbHNlIGlmKE1hdGguYWJzKHkyLXlzKSA9PSAwKSB7XHJcblx0XHRyZXNYID0geDI7XHJcblx0fSBlbHNlIHtcclxuXHRcdHZhciBhMSA9IDEvKDIqKHkxLXlzKSk7XHJcblx0XHR2YXIgYTIgPSAxLygyKih5Mi15cykpO1xyXG5cdFx0aWYoTWF0aC5hYnMoYTEtYTIpID09IDApIHtcclxuXHRcdFx0cmVzWCA9ICh4MSt4MikvMjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHZhciB4czEgPSAwLjUvKDIqYTEtMiphMikqKDQqYTEqeDEtNCphMip4MisyKk1hdGguc3FydCgtOCphMSp4MSphMip4Mi0yKmExKnkxKzIqYTEqeTIrNCphMSphMip4Mip4MisyKmEyKnkxKzQqYTIqYTEqeDEqeDEtMiphMip5MikpO1xyXG5cdFx0XHR2YXIgeHMyID0gMC41LygyKmExLTIqYTIpKig0KmExKngxLTQqYTIqeDItMipNYXRoLnNxcnQoLTgqYTEqeDEqYTIqeDItMiphMSp5MSsyKmExKnkyKzQqYTEqYTIqeDIqeDIrMiphMip5MSs0KmEyKmExKngxKngxLTIqYTIqeTIpKTtcclxuXHRcdFx0Ly8geHMxPU1hdGgucm91bmQoeHMxLDEwKTtcclxuXHRcdFx0Ly8geHMyPU1hdGgucm91bmQoeHMyLDEwKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHhzMT54czIpIHtcclxuXHRcdFx0XHR2YXIgaCA9IHhzMTtcclxuXHRcdFx0XHR4czE9eHMyO1xyXG5cdFx0XHRcdHhzMj1oO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZih5MT49eTIpIHtcclxuXHRcdFx0XHRyZXNYID0geHMyO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJlc1ggPSB4czE7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0dmFyIG1pZCA9IG1pZHBvaW50KHAxLHAyKTtcclxuXHR2YXIgbSA9IG5lZ1JlY1Nsb3BlKHAxLHAyKTtcclxuXHR2YXIgcmVzWSA9IG0qKHJlc1ggLSBtaWQueCkgKyBtaWQueTtcclxuXHRcclxuXHQvLyBjb25zb2xlLmxvZyhyZXNZKTtcclxuXHRcclxuXHRyZXR1cm4gUG9pbnQocmVzWCwgcmVzWSk7XHJcblxyXG5cdFxyXG5cdFxyXG5cdGZ1bmN0aW9uIG1pZHBvaW50KGEsYikge1xyXG5cdFx0dmFyIHB4ID0gKGEueCArIGIueCkvMjtcclxuXHRcdHZhciBweSA9IChhLnkgKyBiLnkpLzI7XHJcblx0XHRyZXR1cm4gUG9pbnQocHgscHkpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gbmVnUmVjU2xvcGUoYSxiKSB7XHJcblx0XHRyZXR1cm4gLSgoYi54IC0gYS54KS8oYi55IC0gYS55KSk7XHJcblx0fVxyXG59XHJcblxyXG5cdFxyXG4gLyogICAgICAgLy8gQ2FuJ3QgaGF2ZSB5b3RoIHBvaW50cyBvbiB0aGUgbGluZVxyXG4gICAgLy9pZiAocDEueSA9PSBwMi55ICYmIHAyLnkgPT0geWwpIHtcclxuICAgICAgICAvL3JldHVybiBudWxsO1xyXG4gICAgLy99XHJcbiAgICAvLyBBbHNvIGNhbid0IGhhdmUgb25lIHBvaW50IG9uIGVpdGhlciBzaWRlIG9mIHRoZSBsaW5lXHJcbiAgICAvL2lmICgocDEueSA8IHlsICYmIHAyLnkgPiB5bCkgfHwgKHAxLnkgPiB5bCAmJiBwMi55IDwgeWwpKSB7XHJcbiAgICAgICAgLy9yZXR1cm4gbnVsbDtcclxuICAgIC8vfVxyXG4gICAgLy8gQ2FsY3VsYXRlIGVxdWF0aW9uIG9mIHBlcnBlbmRpY3VsYXIgeWlzZWN0b3JcclxuICAgIHZhciBwcDEgPSB7eToocDEueStwMi55KS8yLCB4OihwMS54K3AyLngpLzJ9O1xyXG4gICAgdmFyIHB2ID0ge3k6KHAxLngtcDIueCkseDoocDIueS1wMS55KX07XHJcbiAgICB2YXIgcHAyID0ge3k6cHAxLnkrcHYueSx4OnBwMS54K3B2Lnh9O1xyXG4gICAgdmFyIEEgPSBwcDEueCAtIHBwMi54O1xyXG4gICAgdmFyIHkgPSBwcDIueSAtIHBwMS55O1xyXG4gICAgdmFyIEMgPSBBKnBwMS55ICsgeSpwcDEueDtcclxuXHJcbiAgICBpZiAocDEueSA9PSB5bCkge1xyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb24ocHAxLCBwcDIsIHAxLCB7eTpwMS55LTEwMCx4OnAxLnh9KTtcclxuICAgIH1cclxuICAgIGlmIChwMi55ID09IHlsKSB7XHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbihwcDEsIHBwMiwgcDIsIHt5OnAyLnktMTAwLHg6cDIueH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFsZ2V5cmFpY2FsbHgsIHRoZSBkaXN0YW5jZSB0byB0aGUgbGluZSBpcyBlcXVhbCB0byB0aGUgZGlzdGFuY2UgdG8gcDEuXHJcbiAgICAvLyAoeS15bCleMiA9ICh4LXgxKV4yICsgKHkteTEpXjJcclxuICAgIC8vIHkgPSAoeF4yIC0gMnh4MSArIHgxXjIgKyB5MV4yIC0geWxeMikvKDIqKHkxLXlsKSlcclxuICAgIC8vIFBsdWcgaW50byBsaW5lIGVxdWF0aW9uIGFuZCBzb2x2ZSBxdWFkcmF0aWMgaW4geFxyXG4gICAgdmFyIGQgPSAyKihwMS55IC0geWwpO1xyXG4gICAgdmFyIGEgPSBBL2Q7XHJcbiAgICB2YXIgeSA9IHkgLSBBKigyKnAxLngpL2Q7XHJcbiAgICB2YXIgYyA9IEEqKHAxLngqcDEueCArIHAxLnkqcDEueSAtIHlsKnlsKS9kIC0gQztcclxuICAgIHZhciB5LHg7XHJcbiAgICBpZiAoQSA9PSAwKSB7XHJcbiAgICAgICB4ID0gQy95O1xyXG4gICAgICAgeSA9IHgqeCAtIDIqeCpwMS54ICsgKHAxLngqcDEueCArIHAxLnkqcDEueSAtIHlsKnlsKTtcclxuICAgICAgIHkgLz0gZDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHggPSBNYXRoLnNxcnQoeSp5IC0gNCphKmMpIC0geTtcclxuICAgICAgICB4IC89IDIqYTtcclxuICAgICAgICB5ID0gKEMgLSB5KngpL0E7XHJcbiAgICAgICAgdmFyIHgxID0gLU1hdGguc3FydCh5KnkgLSA0KmEqYykgLSB5O1xyXG4gICAgICAgIHgxIC89IDIqYTtcclxuICAgICAgICB2YXIgeTEgPSAoQyAtIHkqeDEpL0E7XHJcblx0XHRcclxuXHJcblx0XHRcclxuICAgICAgICBpZiAoKHgxIDwgeCAmJiBwMS55IDwgcDIueSkgfHwgKHgxID4geCAmJiBwMS55ID4gcDIueSkpIHtcclxuICAgICAgICAgICAgeCA9IHgxO1xyXG4gICAgICAgICAgICB5ID0geTE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIFBvaW50KHgseSk7XHJcbn0gKi9cclxuIiwiXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJjMSwgYXJjMiwgYXJjMywgc2l0ZUxpc3Qpe1xyXG5cdHZhciBpbkNpcmNsZSA9IHJlcXVpcmUoXCJwb2ludGluY2lyY2xlXCIpO1xyXG5cdHZhciBjaXJjdW1jZW50ZXIgPSByZXF1aXJlKFwiLi9jaXJjdW1jZW50ZXIuanNcIilcclxuXHR2YXIgbGVmdFJpZ2h0ID0gcmVxdWlyZShcImxlZnQtcmlnaHRcIik7XHJcblx0XHJcblx0Ly8gaWYgKCFhcmMubEFyYyB8fCAhYXJjLnJBcmMpe1xyXG5cdFx0Ly8gcmV0dXJuXHJcblx0Ly8gfVxyXG5cdHZhciBwMSA9IGFyYzEuc2l0ZTtcclxuXHR2YXIgcDIgPSBhcmMyLnNpdGU7XHJcblx0dmFyIHAzID1hcmMzLnNpdGU7XHJcblx0XHJcblx0aWYgKGxlZnRSaWdodChbcDEueCwgcDEueV0sIFtwMi54LCBwMi55XSwgW3AzLngsIHAzLnldKSAhPSAtMSl7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdC8vaWYgdGhlcmUgYXJlIGFueSBzaXRlcyBpbiB0aGUgY2lyY2xlIHJldHVybiBmYWxzZVxyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2l0ZUxpc3QubGVuZ3RoOyBpKyspe1xyXG5cdFx0aWYgKCBpbkNpcmNsZShbW3AxLnggLCBwMS55XSwgW3AyLnggLCBwMi55XSwgW3AzLnggLCBwMy55XV0sIFtzaXRlTGlzdFtpXS54LCBzaXRlTGlzdFtpXS55XSApID09IDEpe1xyXG5cdFx0XHRyZXR1cm4gZmFsc2VcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0dmFyIHRtcCA9IGNpcmN1bWNlbnRlcihbW3AxLnggLCBwMS55XSwgW3AyLnggLCBwMi55XSwgW3AzLnggLCBwMy55XV0pO1xyXG5cdHZhciBjQ2VudGVyID0gdG1wLmNlbnRlcjtcclxuXHR2YXIgcmFkaXVzID0gdG1wLnJhZGl1cztcclxuXHRcdFxyXG5cdHJldHVybiB7XHJcblx0XHRjQ2VudGVyOiBjQ2VudGVyLFxyXG5cdFx0cmFkaXVzOiByYWRpdXNcclxuXHR9XHJcblx0XHRcclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGEsYikgeyBcclxuXHJcblx0dmFyIGMgPSBhWzBdKmJbMF0gKyBhWzFdKmJbMV1cclxuXHRyZXR1cm4gY1xyXG5cdFxyXG4gIH0iLCJcdFxyXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUVkZ2U7XHJcblxyXG5cdHZhciBjb21wdXRlQnJlYWsgPSByZXF1aXJlKFwiLi9jb21wdXRlQnJlYWsuanNcIilcclxuXHRcclxuXHRmdW5jdGlvbiBFZGdlKGxTaXRlLHJTaXRlKSB7XHJcblx0XHR0aGlzLmxTaXRlID0gbFNpdGU7XHJcblx0XHR0aGlzLnJTaXRlID0gclNpdGU7XHJcblx0XHR0aGlzLmxWZXJ0ZXg7XHJcblx0XHR0aGlzLnJWZXJ0ZXg7XHJcblx0XHR0aGlzLmxEb25lID0gZmFsc2U7XHJcblx0XHR0aGlzLnJEb25lID0gZmFsc2U7XHJcblx0IH1cclxuXHRcclxuXHQvLyBFZGdlLnByb3RvdHlwZS5zZXRsQXJjID0gZnVuY3Rpb24oYXJjKXtcclxuXHRcdC8vIHRoaXMubEFyYyA9IGFyYztcclxuXHQvLyB9XHJcblx0Ly8gRWRnZS5wcm90b3R5cGUuc2V0ckFyYyA9IGZ1bmN0aW9uKGFyYyl7XHJcblx0XHQvLyB0aGlzLnJBcmMgPSBhcmM7XHJcblx0Ly8gfVxyXG5cdFxyXG5cdEVkZ2UucHJvdG90eXBlLnVwZGF0ZVZlcnQgPSBmdW5jdGlvbihzd2VlcExpbmUpe1xyXG5cdFx0XHJcblx0XHRpZighdGhpcy5sRG9uZSB8fCAhdGhpcy5yRG9uZSl7XHJcblx0XHRcdHZhciB0bXAxID0gY29tcHV0ZUJyZWFrKCB0aGlzLnJTaXRlLCB0aGlzLmxTaXRlLCBzd2VlcExpbmUpO1xyXG5cdFx0XHR2YXIgdG1wMiA9IGNvbXB1dGVCcmVhayh0aGlzLmxTaXRlLCB0aGlzLnJTaXRlLCAgc3dlZXBMaW5lKTtcclxuXHRcdFxyXG5cdFx0XHJcblx0XHRcdGlmICh0bXAxLnggPCB0bXAyLngpe1x0XHJcblx0XHRcdFx0dmFyIHRtcEwgPSB0bXAxO1xyXG5cdFx0XHRcdHZhciB0bXBSID0gdG1wMjtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dmFyIHRtcEwgPSB0bXAyO1xyXG5cdFx0XHRcdHZhciB0bXBSID0gdG1wMTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYoIXRoaXMubERvbmUpe1xyXG5cdFx0XHR0aGlzLmxWZXJ0ZXggPSB0bXBMO1xyXG5cdFx0XHRpZih0aGlzLmxWZXJ0ZXgueCA+IDUwMDAgfHwgdGhpcy5sVmVydGV4LnkgPiA1MDAwICl7XHJcblx0XHRcdFx0dGhpcy5sRG9uZSA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmKCF0aGlzLnJEb25lKXtcclxuXHRcdFx0dGhpcy5yVmVydGV4ID0gdG1wUjtcclxuXHRcdFx0aWYodGhpcy5yVmVydGV4LnggPiA1MDAwIHx8IHRoaXMuclZlcnRleC55ID4gNTAwMCl7IFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuckRvbmUgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdGZ1bmN0aW9uIGNyZWF0ZUVkZ2UobFNpdGUsIHJTaXRlKSB7XHJcblx0XHRyZXR1cm4gbmV3IEVkZ2UobFNpdGUsIHJTaXRlKTtcclxufVxyXG4iLCJcclxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVFdmVudDtcclxuXHJcblx0ZnVuY3Rpb24gRXZlbnQoYXJjLCBjQ2VudGVyLCByYWRpdXMpe1xyXG5cdFx0dGhpcy5yYWRpdXMgPSByYWRpdXM7XHJcblx0XHR0aGlzLmNDZW50ZXIgPSBjQ2VudGVyO1xyXG5cdFx0dGhpcy5hcmMgPSBhcmM7IC8vZGlzYXBwZWFyaW5nIGFyY1xyXG5cdH1cclxuXHRcclxuXHRFdmVudC5wcm90b3R5cGUuZ2V0WUF4aXMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB0aGlzLnJhZGl1cyArIHRoaXMuY0NlbnRlci55O1xyXG5cdH1cclxuXHRcclxuXHRFdmVudC5wcm90b3R5cGUuaXNQb2ludCA9IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdGZ1bmN0aW9uIGNyZWF0ZUV2ZW50KGFyYywgY0NlbnRlciwgcmFkaXVzKXtcclxuXHRcdHJldHVybiBuZXcgRXZlbnQoYXJjLCBjQ2VudGVyLCByYWRpdXMpO1xyXG5cdH0iLCJcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaXRlTGlzdCwgc3dlZXBMaW5lKXtcclxuXHJcblx0dmFyIFBvaW50ID0gcmVxdWlyZShcIi4vcG9pbnQuanNcIik7XHJcblx0dmFyIEV2ZW50ID0gcmVxdWlyZShcIi4vZXZlbnQuanNcIik7XHJcblx0dmFyIEVkZ2UgPSByZXF1aXJlKFwiLi9lZGdlLmpzXCIpO1xyXG5cdHZhciBBcmMgPSByZXF1aXJlKFwiLi9hcmMuanNcIik7XHJcblx0XHJcblx0dmFyIGFyY1RvQmV6ID0gcmVxdWlyZShcIi4vYXJjVG9CZXouanNcIik7XHJcblx0dmFyIGNvbXB1dGVCcmVhayA9IHJlcXVpcmUoXCIuL2NvbXB1dGVCcmVhay5qc1wiKVxyXG5cdHZhciBjb21wdXRlQ2lyY2xlRXZlbnQgPSByZXF1aXJlKFwiLi9jb21wdXRlQ2lyY2xlRXZlbnQuanNcIilcclxuXHRcclxuXHR2YXIgcm9vdCA9IG51bGw7XHJcblx0dmFyIGVkZ2VMaXN0ID0gbmV3IEFycmF5KCk7XHJcblx0dmFyIHF1ZXVlID0gbmV3IEFycmF5KCk7XHJcblx0dmFyIGxlZnRSaWdodCA9IHJlcXVpcmUoXCJsZWZ0LXJpZ2h0XCIpO1xyXG5cdHNpdGVMaXN0LmZvckVhY2goZnVuY3Rpb24oZW50cnkpeyBcclxuXHRcdGlmIChlbnRyeS5nZXRZQXhpcygpIDwgc3dlZXBMaW5lKSB7XHJcblx0XHRcdHF1ZXVlLnB1c2goZW50cnkpO1xyXG5cdFx0fVx0XHJcblx0fSk7XHJcblx0c29ydFF1ZXVlKCk7XHJcblx0XHJcblx0XHJcblx0XHJcblx0ZnVuY3Rpb24gaGFuZGxlU2l0ZUV2ZW50KHNpdGUpe1xyXG5cdFx0dmFyIG5ld0FyYyA9IEFyYyhzaXRlKTtcclxuXHRcdC8vMS4gaWYgbGlzdCBpcyBlbXB0eSBtYWtlIGZpcnN0IHNpdGUgdGhlIHJvb3QgaW4gdGhlIGxpc3RcclxuXHRcdGlmKCFyb290KXtcclxuXHRcdFx0cm9vdCA9IG5ld0FyYztcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0Ly8gMi4gZWxzZSBzZWFyY2ggdGhyb3VnaCBsaXN0IGZvciB0aGUgYXJjIGFib3ZlIFNpdGVcclxuXHRcdFx0Ly8gaWYgdGhlIGFyYyBoYXMgYSBjaXJjbGUgZXZlbnQgZGVsZXRlIGl0XHJcblx0XHRcdC8vIDMuIHJlcGxhY2UgdGhlIGFyYyB3aXRoIG5ldyBhcmMgZGVmaW5lZCBieSBzaXRlIHdpdGggbmV3IGJyZWFrcG9pbnRzXHJcblx0XHRcclxuXHRcdHZhciBjdXJyID0gcm9vdDtcclxuXHRcdC8vIHVwZGF0ZSB2ZXJ0c1xyXG5cdFx0d2hpbGUoY3Vycil7XHJcblx0XHRcdGN1cnIudXBkYXRlVmVydChzaXRlLnkpO1xyXG5cdFx0XHRjdXJyID0gY3Vyci5yQXJjO1xyXG5cdFx0fVxyXG5cdFx0ZWRnZUxpc3QuZm9yRWFjaChmdW5jdGlvbihlZGdlKXtlZGdlLnVwZGF0ZVZlcnQoc2l0ZS5nZXRZQXhpcygpKX0pO1x0XHRcclxuXHRcclxuXHRcdGN1cnIgPSByb290O1xyXG5cdFx0dmFyIGJvb2wgPSB0cnVlO1xyXG5cdFx0d2hpbGUoYm9vbCAmJiBjdXJyKXtcclxuXHRcdFx0aWYgKCBjdXJyLnJCcmVhayAmJiBjdXJyLnJCcmVhay54ID49IHNpdGUueCl7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gdmFyIGEgPSBjdXJyLmV2ZW50O1xyXG5cdFx0XHRcdC8vIGZvciAodmFyIGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdC8vIGlmIChxdWV1ZVtpXSA9PSBhICkge1xyXG5cdFx0XHRcdFx0XHQvLyBxdWV1ZS5zcGxpY2UoaSwxKTtcclxuXHRcdFx0XHRcdC8vIH1cclxuXHRcdFx0XHQvLyB9XHJcblx0XHRcdFx0Ly8gY3Vyci5ldmVudCA9IG51bGw7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIGNvcHkgPSBBcmMoY3Vyci5zaXRlKTtcclxuXHRcdFx0XHRuZXdBcmMuc2V0bEFyYyhjdXJyKTsgXHJcblx0XHRcdFx0bmV3QXJjLnNldHJBcmMoY29weSk7XHJcblx0XHRcdFx0Y29weS5zZXRyQXJjKGN1cnIuckFyYyk7XHJcblx0XHRcdFx0Y29weS5zZXRsQXJjKG5ld0FyYyk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Y3Vyci5yQXJjLnNldGxBcmMoY29weSk7XHJcblx0XHRcdFx0Y3Vyci5zZXRyQXJjKG5ld0FyYyk7IFxyXG5cdFx0XHRcdC8vYnJlYWsgc29tZWhvd1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciBhID0gY3Vyci5ldmVudDtcclxuXHRcdFx0XHRpZiAoYSl7XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHF1ZXVlLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdGlmICggIWEuaXNQb2ludCgpICYmIHF1ZXVlW2ldLmNDZW50ZXIgPT0gYS5jQ2VudGVyICkge1xyXG5cdFx0XHRcdFx0XHRcdHF1ZXVlLnNwbGljZShpLDEpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGJvb2wgPSBmYWxzZTtcclxuXHRcdFx0XHRcclxuXHRcdFx0fWVsc2UgaWYoIWN1cnIuckJyZWFrKXtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRcclxuXHRcdFx0XHQvLyB2YXIgYSA9IGN1cnIuZXZlbnQ7XHJcblx0XHRcdFx0Ly8gZm9yICh2YXIgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0Ly8gaWYgKHF1ZXVlW2ldID09IGEgKSB7XHJcblx0XHRcdFx0XHRcdC8vIHF1ZXVlLnNwbGljZShpLDEpO1xyXG5cdFx0XHRcdFx0Ly8gfVxyXG5cdFx0XHRcdC8vIH1cclxuXHRcdFx0XHQvLyBjdXJyLmV2ZW50ID0gbnVsbDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRuZXdBcmMuc2V0bEFyYyhjdXJyKTtcclxuXHRcdFx0XHR2YXIgY29weSA9IEFyYyhjdXJyLnNpdGUpO1xyXG5cdFx0XHRcdG5ld0FyYy5zZXRyQXJjKGNvcHkpO1xyXG5cdFx0XHRcdGNvcHkuc2V0bEFyYyhuZXdBcmMpO1xyXG5cdFx0XHRcdGN1cnIuc2V0ckFyYyhuZXdBcmMpOyBcclxuXHRcdFx0XHQvL2JyZWFrIHNvbWhvd1xyXG5cdFx0XHRcdGJvb2wgPSBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjdXJyID0gY3Vyci5yQXJjO1xyXG5cdFx0fVxyXG5cdFx0ICAvLyA0LiBtYWtlIG5ldyBlZGdlXHJcblx0XHRpZiAoc2l0ZS54IDwgbmV3QXJjLmxBcmMuc2l0ZS54KXtcclxuXHRcdFx0ZWRnZSA9IEVkZ2Uoc2l0ZSwgbmV3QXJjLmxBcmMuc2l0ZSk7XHJcblx0XHRcdGVkZ2VMaXN0LnB1c2goZWRnZSk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0ZWRnZSA9IEVkZ2UobmV3QXJjLmxBcmMuc2l0ZSwgc2l0ZSk7XHJcblx0XHRcdGVkZ2VMaXN0LnB1c2goZWRnZSk7XHJcblx0XHR9XHJcblx0XHRuZXdBcmMubEVkZ2UgPSBlZGdlO1xyXG5cdFx0bmV3QXJjLnJFZGdlID0gZWRnZTtcclxuXHRcdG5ld0FyYy5yQXJjLnJFZGdlID0gbmV3QXJjLmxBcmMuckVkZ2U7XHJcblx0XHRuZXdBcmMubEFyYy5yRWRnZSA9IGVkZ2U7XHJcblx0XHRuZXdBcmMuckFyYy5sRWRnZSA9IGVkZ2U7XHJcblx0XHJcblx0ICAvLyA1LiBDaGVjayBjaWNsZSBldmVudHMgb2Ygc2l0ZSBhdCByaWdodCBhbmQgc2lnaHQgYXQgbGVmdCAtLSB1c2UgY2lyY2xlID0gY29tcHV0ZUNpcmNsZUV2ZW50KHAxLCBwMiwgcDMsIHNpdGVMaXN0KTsgXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIEV2ZW50ID0gRXZlbnQoYXJjLCBjaXJjbGUuY0NlbnRlciAsY2lyY2xlLnJhZGl1cyk7XHJcblx0XHRpZihuZXdBcmMubEFyYyAmJiBuZXdBcmMubEFyYy5sQXJjKXtcclxuXHRcdFx0dmFyIGxjaXJjbGUgPSBjb21wdXRlQ2lyY2xlRXZlbnQobmV3QXJjLCBuZXdBcmMubEFyYywgbmV3QXJjLmxBcmMubEFyYywgc2l0ZUxpc3QpO1xyXG5cdFx0fVxyXG5cdFx0aWYobmV3QXJjLnJBcmMgJiYgbmV3QXJjLnJBcmMuckFyYyl7XHJcblx0XHRcdHZhciByY2lyY2xlID0gY29tcHV0ZUNpcmNsZUV2ZW50KG5ld0FyYy5yQXJjLnJBcmMsIG5ld0FyYy5yQXJjLCBuZXdBcmMsIHNpdGVMaXN0KTtcclxuXHRcdH1cclxuXHRcdGlmIChsY2lyY2xlKXtcclxuXHRcdFx0ZXZlbnQgPSBFdmVudChuZXdBcmMubEFyYywgbGNpcmNsZS5jQ2VudGVyLCBsY2lyY2xlLnJhZGl1cyk7XHJcblx0XHRcdG5ld0FyYy5sQXJjLmV2ZW50ID0gZXZlbnQ7XHJcblx0XHRcdC8vYWRkIGV2ZW50IHRvIHF1ZXVlXHJcblx0XHRcdGlmIChldmVudC5nZXRZQXhpcygpIDw9IHN3ZWVwTGluZSkge1xyXG5cdFx0XHRcdHF1ZXVlLnB1c2goZXZlbnQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZiAocmNpcmNsZSl7XHJcblx0XHRcdGV2ZW50ID0gRXZlbnQobmV3QXJjLnJBcmMsIHJjaXJjbGUuY0NlbnRlciwgcmNpcmNsZS5yYWRpdXMpO1xyXG5cdFx0XHRuZXdBcmMuckFyYy5ldmVudCA9IGV2ZW50O1xyXG5cdFx0XHQvL2FkZCBldmVudCB0byBxdWV1ZVxyXG5cdFx0XHRpZiAoZXZlbnQuZ2V0WUF4aXMoKSA8PSBzd2VlcExpbmUpIHtcclxuXHRcdFx0XHRxdWV1ZS5wdXNoKGV2ZW50KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0c29ydFF1ZXVlKCk7XHJcblx0fVxyXG5cdFxyXG5cdGZ1bmN0aW9uIGhhbmRsZUNpcmNsZUV2ZW50KGV2ZW50KXtcclxuXHRcdFxyXG5cdFx0Ly91cGRhdGUgdmVydHNcclxuXHRcdHZhciBjdXJyID0gcm9vdDtcclxuXHRcdHdoaWxlKGN1cnIpe1xyXG5cdFx0XHRjdXJyLnVwZGF0ZVZlcnQoZXZlbnQuZ2V0WUF4aXMoKSk7XHJcblx0XHRcdGN1cnIgPSBjdXJyLnJBcmM7XHJcblx0XHR9XHJcblx0XHRlZGdlTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGVkZ2Upe2VkZ2UudXBkYXRlVmVydChldmVudC5nZXRZQXhpcygpKX0pO1xyXG5cdFx0Ly8gMS4gRGVsZXRlIGFyYyBhc3NvY2lhdGVkIHdpdGggdGhlIGNpcmNsZSBldmVudCBhbmQgdXBkYXRlIGJyZWFrcG9pbnRzIG9mIG5laWdoYm9yaW5nIGFyY3MsXHJcblx0XHRcclxuXHRcdGV2ZW50LmFyYy5sQXJjLnNldHJBcmMoZXZlbnQuYXJjLnJBcmMpO1xyXG5cdFx0ZXZlbnQuYXJjLnJBcmMuc2V0bEFyYyhldmVudC5hcmMubEFyYyk7XHJcblxyXG5cdFx0XHJcblx0XHQvLyBkZWxldGUgY2lyY2xlIGV2ZW50cyBhdHRhY2hlZCB0byB0aGUgYXJjXHJcblxyXG5cdFx0dmFyIGEgPSBldmVudDtcclxuXHRcdGlmIChhKXtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmICggIWEuaXNQb2ludCgpICYmIHF1ZXVlW2ldLmNDZW50ZXIgPT0gYS5jQ2VudGVyICkge1xyXG5cdFx0XHRcdFx0cXVldWUuc3BsaWNlKGksMSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gMi4gQWRkIHRoZSBjZW50ZXIgb2YgdGhlIGNpcmNsZSAoZXZlbnQuY0NlbnRlcikgbWFrZSB0aGlzIHRoZSB2ZXJ0ZXggb2YgYXBwcm9wcmlhdGUgZWRnZXNcclxuXHRcdGlmKCBkaXN0YW5jZShldmVudC5hcmMubEVkZ2UuclZlcnRleCwgZXZlbnQuY0NlbnRlcikgPCBkaXN0YW5jZShldmVudC5hcmMubEVkZ2UubFZlcnRleCwgZXZlbnQuY0NlbnRlcikpe1xyXG5cdFx0XHRldmVudC5hcmMubEVkZ2UuclZlcnRleCA9IGV2ZW50LmNDZW50ZXI7XHJcblx0XHRcdGV2ZW50LmFyYy5sRWRnZS5yRG9uZSA9IHRydWU7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0ZXZlbnQuYXJjLmxFZGdlLmxWZXJ0ZXggPSBldmVudC5jQ2VudGVyO1xyXG5cdFx0XHRldmVudC5hcmMubEVkZ2UubERvbmUgPSB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiggZGlzdGFuY2UoZXZlbnQuYXJjLnJFZGdlLnJWZXJ0ZXgsIGV2ZW50LmNDZW50ZXIpIDwgZGlzdGFuY2UoZXZlbnQuYXJjLnJFZGdlLmxWZXJ0ZXgsIGV2ZW50LmNDZW50ZXIpKXtcclxuXHRcdFx0ZXZlbnQuYXJjLnJFZGdlLnJWZXJ0ZXggPSBldmVudC5jQ2VudGVyO1xyXG5cdFx0XHRldmVudC5hcmMuckVkZ2UuckRvbmUgPSB0cnVlO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdGV2ZW50LmFyYy5yRWRnZS5sVmVydGV4ID0gZXZlbnQuY0NlbnRlcjtcclxuXHRcdFx0ZXZlbnQuYXJjLnJFZGdlLmxEb25lID0gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gbWFrZSBuZXcgZWRnZSBzdGFydGluZyBhdCBjQ2VudGVyIHNldCBwb2ludGVycyBhcHByb3ByaWF0ZWx5XHJcblx0XHRpZiAoZXZlbnQuYXJjLmxBcmMuc2l0ZS54IDwgZXZlbnQuYXJjLnJBcmMuc2l0ZS54KXtcclxuXHRcdFx0ZWRnZSA9IEVkZ2UoZXZlbnQuYXJjLmxBcmMuc2l0ZSwgZXZlbnQuYXJjLnJBcmMuc2l0ZSk7XHJcblx0XHRcdGVkZ2VMaXN0LnB1c2goZWRnZSk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0ZWRnZSA9IEVkZ2UoZXZlbnQuYXJjLnJBcmMuc2l0ZSwgZXZlbnQuYXJjLmxBcmMuc2l0ZSk7XHJcblx0XHRcdGVkZ2VMaXN0LnB1c2goZWRnZSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGV2ZW50LmFyYy5sQXJjLnJFZGdlID0gZWRnZTtcclxuXHRcdGV2ZW50LmFyYy5yQXJjLmxFZGdlID0gZWRnZTtcclxuXHRcdFxyXG5cdFx0ZWRnZS51cGRhdGVWZXJ0KGV2ZW50LmdldFlBeGlzKCkpXHJcblx0XHRpZiggZGlzdGFuY2UoZWRnZS5yVmVydGV4LCBldmVudC5jQ2VudGVyKSA8IGRpc3RhbmNlKGVkZ2UubFZlcnRleCwgZXZlbnQuY0NlbnRlcikpe1xyXG5cdFx0XHRlZGdlLmxWZXJ0ZXggPSBldmVudC5jQ2VudGVyO1xyXG5cdFx0XHRlZGdlLmxEb25lID0gdHJ1ZTtcclxuXHRcdFx0ZWRnZS5yVmVydGV4ID0gbnVsbDtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRlZGdlLnJWZXJ0ZXggPSBldmVudC5jQ2VudGVyO1xyXG5cdFx0XHRlZGdlLnJEb25lID0gdHJ1ZTtcclxuXHRcdFx0ZWRnZS5sVmVydGV4ID0gbnVsbDtcclxuXHRcdH1cclxuXHRcdC8vIGVkZ2UudXBkYXRlVmVydChldmVudC5nZXRZQXhpcygpKVxyXG5cdFx0XHJcblx0XHQvLyBpZihlZGdlLmxTaXRlLnkgPCBlZGdlLnJTaXRlLnkpe1xyXG5cdFx0XHQvLyBpZiAobGVmdFJpZ2h0KFtlZGdlLmxTaXRlLngsIGVkZ2UubFNpdGUueV0sIFtlZGdlLnJTaXRlLngsIGVkZ2UuclNpdGUueV0gLCBbZXZlbnQuYXJjLnNpdGUueCwgZXZlbnQuYXJjLnNpdGUueV0pID09IC0xKXtcclxuXHRcdFx0XHQvLyBlZGdlLmxWZXJ0ZXggPSBldmVudC5jQ2VudGVyO1xyXG5cdFx0XHRcdC8vIGVkZ2UubERvbmUgPSB0cnVlO1xyXG5cdFx0XHQvLyB9ZWxzZXtcclxuXHRcdFx0XHQvLyBlZGdlLnJWZXJ0ZXggPSBldmVudC5jQ2VudGVyO1xyXG5cdFx0XHRcdC8vIGVkZ2UuckRvbmUgPSB0cnVlO1xyXG5cdFx0XHQvLyB9XHJcblx0XHQvLyB9XHJcblx0XHQvLyBpZihlZGdlLmxTaXRlLnkgPiBlZGdlLnJTaXRlLnkpe1xyXG5cdFx0XHQvLyBpZiAobGVmdFJpZ2h0KFtlZGdlLmxTaXRlLngsIGVkZ2UubFNpdGUueV0sIFtlZGdlLnJTaXRlLngsIGVkZ2UuclNpdGUueV0gLCBbZXZlbnQuYXJjLnNpdGUueCwgZXZlbnQuYXJjLnNpdGUueV0pID09IC0xKXtcclxuXHRcdFx0XHQvLyBlZGdlLnJWZXJ0ZXggPSBldmVudC5jQ2VudGVyO1xyXG5cdFx0XHRcdC8vIGVkZ2UuckRvbmUgPSB0cnVlO1xyXG5cdFx0XHQvLyB9ZWxzZXtcclxuXHRcdFx0XHQvLyBlZGdlLmxWZXJ0ZXggPSBldmVudC5jQ2VudGVyO1xyXG5cdFx0XHRcdC8vIGVkZ2UubERvbmUgPSB0cnVlO1xyXG5cdFx0XHQvLyB9XHJcblx0XHQvLyB9XHJcblx0XHRcclxuXHRcdC8vIGlmKGVkZ2UubFNpdGUueSA8IGVkZ2UuclNpdGUueSl7XHJcblx0XHRcdC8vIGVkZ2UuclZlcnRleCA9IGV2ZW50LmNDZW50ZXI7XHJcblx0XHRcdC8vIGVkZ2UuckRvbmUgPSB0cnVlO1xyXG5cdFx0Ly8gfWVsc2V7XHJcblx0XHRcdC8vIGVkZ2UubFZlcnRleCA9IGV2ZW50LmNDZW50ZXI7XHJcblx0XHRcdC8vIGVkZ2UubERvbmUgPSB0cnVlO1xyXG5cdFx0Ly8gfVxyXG5cdFx0Ly8gZWRnZUxpc3QucHVzaChlZGdlKTtcclxuXHJcblx0XHQvLyAzLiBDaGVjayBmb3IgQ2lyY2xlRXZlbnRzIGF0IG5ldyB0cmlwbGVzIG9mIGNvbnNlY3V0aXZlIGFyY3Mgd2l0aCB0aGUgYXJjIGZvcm1lcmx5IHRvIHRoZSBsZWZ0IGFzIG1pZGRsZSBhcmNcclxuXHRcdC8vIGRvIHRoZSBzYW1lIGZvciB0aGUgZm9ybWVyIHJpZ2h0IG5laWdoYm9yIGFzIHRoZSBtaWRkbGUgYXJjXHJcblx0XHRpZihldmVudC5hcmMuckFyYyAmJiBldmVudC5hcmMubEFyYyAmJiAoZXZlbnQuYXJjLmxBcmMpLmxBcmMpe1xyXG5cdFx0XHR2YXIgbGNpcmNsZSA9IGNvbXB1dGVDaXJjbGVFdmVudChldmVudC5hcmMuckFyYywgZXZlbnQuYXJjLmxBcmMsIChldmVudC5hcmMubEFyYykubEFyYywgc2l0ZUxpc3QpO1xyXG5cdFx0fVxyXG5cdFx0aWYoZXZlbnQuYXJjLmxBcmMgJiYgZXZlbnQuYXJjLnJBcmMgJiYgKGV2ZW50LmFyYy5yQXJjKS5yQXJjKXtcclxuXHRcdFx0dmFyIHJjaXJjbGUgPSBjb21wdXRlQ2lyY2xlRXZlbnQoKGV2ZW50LmFyYy5yQXJjKS5yQXJjLCBldmVudC5hcmMuckFyYywgZXZlbnQuYXJjLmxBcmMsIHNpdGVMaXN0KTtcclxuXHRcdH1cclxuXHRcdGlmIChsY2lyY2xlKXtcclxuXHRcdFx0ZXZlbnQgPSBFdmVudChldmVudC5hcmMubEFyYywgbGNpcmNsZS5jQ2VudGVyLCBsY2lyY2xlLnJhZGl1cyk7XHJcblx0XHRcdGV2ZW50LmFyYy5sQXJjLmV2ZW50ID0gZXZlbnQ7XHJcblx0XHRcdC8vYWRkIGV2ZW50IHRvIEV2ZW50XHJcblx0XHRcdGlmIChldmVudC5nZXRZQXhpcygpIDw9IHN3ZWVwTGluZSkge1xyXG5cdFx0XHRcdC8vZXZlbnQuYXJjLmxBcmMuZXZlbnQgPSBldmVudDtcclxuXHRcdFx0XHRxdWV1ZS5wdXNoKGV2ZW50KTtcclxuXHRcdFx0fVx0XHJcblx0XHR9XHJcblx0XHRpZiAocmNpcmNsZSl7XHJcblx0XHRcdGV2ZW50ID0gRXZlbnQoZXZlbnQuYXJjLnJBcmMsIHJjaXJjbGUuY0NlbnRlciwgcmNpcmNsZS5yYWRpdXMpO1xyXG5cdFx0XHRldmVudC5hcmMuckFyYy5ldmVudCA9IGV2ZW50O1xyXG5cdFx0XHQvL2FkZCBldmVudCB0byBFdmVudFxyXG5cdFx0XHRpZiAoZXZlbnQuZ2V0WUF4aXMoKSA8PSBzd2VlcExpbmUpIHtcclxuXHRcdFx0XHQvL2V2ZW50LmFyYy5yQXJjLmV2ZW50ID0gZXZlbnQ7XHJcblx0XHRcdFx0cXVldWUucHVzaChldmVudCk7XHJcblx0XHRcdH1cdFx0XHRcclxuXHRcdH1cdFx0XHJcblx0XHRcclxuXHRcdC8vIGlmKGV2ZW50LmFyYy5sQXJjICYmIGV2ZW50LmFyYy5sQXJjLmxBcmMgJiYgZXZlbnQuYXJjLmxBcmMubEFyYy5sQXJjICl7XHJcblx0XHRcdC8vIHZhciBsbGNpcmNsZSA9IGNvbXB1dGVDaXJjbGVFdmVudChldmVudC5hcmMubEFyYywgZXZlbnQuYXJjLmxBcmMubEFyYywgZXZlbnQuYXJjLmxBcmMubEFyYy5sQXJjLCAgc2l0ZUxpc3QpO1xyXG5cdFx0Ly8gfVxyXG5cdFx0Ly8gaWYoZXZlbnQuYXJjLnJBcmMgJiYgZXZlbnQuYXJjLnJBcmMuckFyYyAmJiBldmVudC5hcmMuckFyYy5yQXJjLnJBcmMpe1xyXG5cdFx0XHQvLyB2YXIgcnJjaXJjbGUgPSBjb21wdXRlQ2lyY2xlRXZlbnQoZXZlbnQuYXJjLnJBcmMuckFyYy5yQXJjLCBldmVudC5hcmMuckFyYy5yQXJjLCBldmVudC5hcmMuckFyYywgc2l0ZUxpc3QpO1xyXG5cdFx0Ly8gfVxyXG5cdFx0Ly8gaWYgKGxsY2lyY2xlKXtcclxuXHRcdFx0Ly8gZXZlbnQgPSBFdmVudChldmVudC5hcmMubEFyYywgbGxjaXJjbGUuY0NlbnRlciwgbGxjaXJjbGUucmFkaXVzKTtcclxuXHRcdFx0Ly8gZXZlbnQuYXJjLmxBcmMubEFyYy5ldmVudCA9IGV2ZW50O1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gaWYgKGV2ZW50LmdldFlBeGlzKCkgPCBzd2VlcExpbmUpIHtcclxuXHRcdFx0XHQvLyBxdWV1ZS5wdXNoKGV2ZW50KTtcclxuXHRcdFx0Ly8gfVx0XHJcblx0XHQvLyB9XHJcblx0XHQvLyBpZiAocnJjaXJjbGUpe1xyXG5cdFx0XHQvLyBldmVudCA9IEV2ZW50KGV2ZW50LmFyYy5yQXJjLCBycmNpcmNsZS5jQ2VudGVyLCBycmNpcmNsZS5yYWRpdXMpO1xyXG5cdFx0XHQvLyBldmVudC5hcmMuckFyYy5yQXJjLmV2ZW50ID0gZXZlbnQ7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBpZiAoZXZlbnQuZ2V0WUF4aXMoKSA8IHN3ZWVwTGluZSkge1xyXG5cdFx0XHRcdC8vIHF1ZXVlLnB1c2goZXZlbnQpO1xyXG5cdFx0XHQvLyB9XHRcdFx0XHJcblx0XHQvLyB9XHRcclxuXHRcdFxyXG5cdFx0c29ydFF1ZXVlKCk7XHJcblx0XHQvLyBldmVudC5hcmMgPSBudWxsO1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdC8vIHNvcnQgdGhlIHF1ZXVlIGJhc2VkIG9uIHRoZSBoaWdoZXIgeSB2YWx1ZSAocmV2ZXJzZSlcclxuXHRmdW5jdGlvbiBzb3J0UXVldWUoKSB7XHJcblx0XHRxdWV1ZS5zb3J0KGZ1bmN0aW9uKHZhbHVlMSx2YWx1ZTIpe1xyXG5cdFx0XHRpZiAodmFsdWUxID09IHZhbHVlMikge1xyXG5cdFx0XHRcdHJldHVybiAxO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB2YWx1ZTIuZ2V0WUF4aXMoKSAtIHZhbHVlMS5nZXRZQXhpcygpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdC8vYWxzbyB3aGlsZSBzd2VlcExpbmUgaGFzIGxvd2VyIHkgdmFsdWUgdGhhbiBhbnl0aGluZyBpbiBxdWV1ZVxyXG5cdHdoaWxlKHF1ZXVlLmxlbmd0aCAhPSAwKXtcclxuXHRcdHZhciBlID0gcXVldWUucG9wKCk7XHJcblx0XHRpZiAoZS5pc1BvaW50KCkpIHtcclxuXHRcdFx0aGFuZGxlU2l0ZUV2ZW50KGUpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZihlICE9IG51bGwpe1xyXG5cdFx0XHQvLyBpZiAoZXZlbnQuZ2V0WUF4aXMoKSA8IHN3ZWVwTGluZSkge1xyXG5cdFx0XHRcdGhhbmRsZUNpcmNsZUV2ZW50KGUpO1xyXG5cdFx0XHQvLyB9XHJcblx0XHR9XHJcblx0fVxyXG5cdC8vYWRkIGV4dHJhIGJyZWFrcG9pbnQgY29tcFxyXG5cdGVkZ2VMaXN0LmZvckVhY2goZnVuY3Rpb24oZWRnZSl7ZWRnZS51cGRhdGVWZXJ0KHN3ZWVwTGluZSl9KTtcclxuXHRcclxuXHRjdXJyID0gcm9vdDtcclxuXHR3aGlsZShjdXJyKXtcclxuXHRcdGN1cnIudXBkYXRlVmVydChzd2VlcExpbmUpO1xyXG5cdFx0Y3VyciA9IGN1cnIuckFyYztcclxuXHR9XHJcblx0XHJcblx0Ly9jb21wdXRlIGsgdmFsdWVzIGZvciB0aGUgYW5pbWF0aW9uXHJcblx0Ly9pZiBub3QgbEJyZWFrIG9yIHJCcmVhayBmaXhcclxuXHRjdXJyID0gcm9vdDtcclxuXHR3aGlsZShjdXJyKXtcclxuXHRcdGJleiA9IGFyY1RvQmV6KGN1cnIsIHN3ZWVwTGluZSk7XHJcblx0XHRjdXJyLmsgPSBiZXoua1xyXG5cdFx0Y3Vyci5sQnJlYWsgPSBiZXoubEJyZWFrO1xyXG5cdFx0Y3Vyci5yQnJlYWsgPSBiZXouckJyZWFrO1xyXG5cdFx0Y3VyciA9IGN1cnIuckFyYztcclxuXHR9XHJcblx0XHJcblx0XHJcblx0XHJcblx0XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRiZWFjaExpbmU6IHJvb3QsXHJcblx0XHRlZGdlTGlzdDogZWRnZUxpc3RcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRpc3RhbmNlKHAxLCBwMikge1xyXG5cdHZhciBkID0gKHAxLngtcDIueCkgKiAocDEueC1wMi54KSArIChwMS55LXAyLnkpICogKHAxLnktcDIueSk7XHJcblx0ZCA9IE1hdGguc3FydChkKTtcclxuXHRcclxuXHRyZXR1cm4gTWF0aC5hYnMoZCk7XHJcbn1cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuIiwiXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocDEscDIscDMscDQpIHtcclxuICAgIC8vIERldGVybWluZSBsaW5lIGVxdWF0aW9uc1xyXG4gICAgLy8gfEExIEIxfCB8eHwgICB8QzF8XHJcbiAgICAvLyB8QTIgQjJ8IHx5fCA9IHxDMnxcclxuICAgIHZhciBBMSwgQjEsIEMxLCBBMiwgQjIsIEMyO1xyXG4gICAgQTEgPSBwMS55IC0gcDIueTtcclxuICAgIEIxID0gcDIueCAtIHAxLng7XHJcbiAgICBDMSA9IEExKnAxLnggKyBCMSpwMS55O1xyXG4gICAgQTIgPSBwMy55IC0gcDQueTtcclxuICAgIEIyID0gcDQueCAtIHAzLng7XHJcbiAgICBDMiA9IEEyKnAzLnggKyBCMipwMy55O1xyXG4gICAgLy8gU29sdmUgZm9yIGludGVyc2VjdGlvblxyXG4gICAgLy8gUGFyYWxsZWwgbGluZXM6XHJcbiAgICAvLyBpZiAoQTEqQjIgPT0gQjEqQTIpIHtcclxuICAgICAgICAvLyByZXR1cm4gbnVsbDtcclxuICAgIC8vIH1cclxuXHJcbiAgICAvLyBJbnZlcnNlIG9mIG1hdHJpeDpcclxuICAgIC8vIHwgQjIgLUIxfFxyXG4gICAgLy8gfC1BMiAgQTF8L0RcclxuICAgIHZhciBEID0gQTEqQjIgLSBCMSpBMjtcclxuICAgIHZhciB4ID0gKEIyKkMxIC0gQjEqQzIpL0Q7XHJcbiAgICB2YXIgeSA9IChBMSpDMiAtIEEyKkMxKS9EO1xyXG4gICAgcmV0dXJuIHt4OngseTp5fTtcclxufSIsIlx0XHJcblx0bW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVQb2ludDtcclxuXHRcclxuXHRmdW5jdGlvbiBQb2ludCh4LHkpIHtcclxuXHRcdHRoaXMueCA9IHg7XHJcblx0XHR0aGlzLnkgPSB5O1xyXG5cdCB9XHJcblx0IFxyXG5cdCBQb2ludC5wcm90b3R5cGUuZ2V0WUF4aXMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB0aGlzLnk7XHJcblx0fVxyXG5cdFxyXG5cdFBvaW50LnByb3RvdHlwZS5pc1BvaW50ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdCBmdW5jdGlvbiBjcmVhdGVQb2ludCh4LHkpIHtcclxuXHRcdHJldHVybiBuZXcgUG9pbnQoeCx5KTtcclxuXHQgfSIsIlwidXNlIHN0cmljdFwiXG5cbnZhciByb2J1c3RTdW0gPSByZXF1aXJlKFwicm9idXN0LXN1bVwiKVxudmFyIHJvYnVzdFNjYWxlID0gcmVxdWlyZShcInJvYnVzdC1zY2FsZVwiKVxudmFyIHR3b1N1bSA9IHJlcXVpcmUoXCJ0d28tc3VtXCIpXG52YXIgdHdvUHJvZHVjdCA9IHJlcXVpcmUoXCJ0d28tcHJvZHVjdFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxlZnRSaWdodFRlc3RcblxuZnVuY3Rpb24gbGVmdFJpZ2h0VGVzdChhLCBiLCBjKSB7XG4gIHZhciBYID0gcm9idXN0U2NhbGUodHdvU3VtKGJbMV0sIC1jWzFdKSwgYVswXSlcbiAgdmFyIFkgPSByb2J1c3RTY2FsZSh0d29TdW0oY1swXSwgLWJbMF0pLCBhWzFdKVxuICB2YXIgWiA9IHJvYnVzdFN1bSh0d29Qcm9kdWN0KGJbMF0sIGNbMV0pLCB0d29Qcm9kdWN0KC1iWzFdLCBjWzBdKSlcbiAgdmFyIGQgPSByb2J1c3RTdW0ocm9idXN0U3VtKFgsIFkpLCBaKVxuICB2YXIgcyA9IGRbZC5sZW5ndGgtMV1cbiAgaWYocyA8IDApIHtcbiAgICByZXR1cm4gLTFcbiAgfVxuICBpZihzID4gMCkge1xuICAgIHJldHVybiAxXG4gIH1cbiAgcmV0dXJuIDBcbn0iLCJcInVzZSBzdHJpY3RcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZhc3RUd29TdW1cblxuZnVuY3Rpb24gZmFzdFR3b1N1bShhLCBiLCByZXN1bHQpIHtcblx0dmFyIHggPSBhICsgYlxuXHR2YXIgYnYgPSB4IC0gYVxuXHR2YXIgYXYgPSB4IC0gYnZcblx0dmFyIGJyID0gYiAtIGJ2XG5cdHZhciBhciA9IGEgLSBhdlxuXHRpZihyZXN1bHQpIHtcblx0XHRyZXN1bHRbMF0gPSBhciArIGJyXG5cdFx0cmVzdWx0WzFdID0geFxuXHRcdHJldHVybiByZXN1bHRcblx0fVxuXHRyZXR1cm4gW2FyK2JyLCB4XVxufSIsIi8vTWljaGFlbCBEb2VzY2hlclxyXG4vL09jdG9iZXIgMywgMjAxM1xyXG4vL1RoaXMgcHJvZ3JhbSB0ZXN0cyBpZiBhIHBvaW50IGlzIHdpdGhpbiBhIGNpcmNsZSBpbiBhIDJEIHBsYW5lIGRlZmluZWQgYnkgdGhyZWUgcG9pbnRzLlxyXG4vL0lucHV0ID0gYW4gYXJyYXkgb2YgdGhyZWUgcG9pbnRzIC0gYSBwb2ludCBpcyBhbiBhcnJheSBvZiB4LHkgY29vcmRpbmF0ZXMsIGFuZCBhIHBvaW50IHRvIHRlc3RcclxuLy9PdXRwdXQgPSAxIGlmIHRoZSBwb2ludCBpcyBpbiB0aGUgY2lyY2xlIG9yIDAgaWYgdGhlIHBvaW50IGlzIG9uIHRoZSBjaXJjbGUgKHdpdGhpbiAxMF4tNikgYW5kIC0xIGlmIHRoZSBwb2ludCBpcyBvdXRzaWRlIHRoZSBjaXJjbGVcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGhyZWVQb2ludHMsIHBvaW50KSB7XHJcblx0aWYgKCFpc0lucHV0T2sodGhyZWVQb2ludHMpKSB7cmV0dXJuIG51bGw7fVxyXG5cdFxyXG5cdHZhciBjZW50ZXIgPSBjaXJjdW1jZW50ZXIodGhyZWVQb2ludHMpO1xyXG5cdHZhciByID0gZGlzdGFuY2UodGhyZWVQb2ludHNbMF0sIGNlbnRlcik7XHJcblx0dmFyIGQgPSBkaXN0YW5jZShjZW50ZXIsIHBvaW50KTtcclxuXHRcclxuXHRpZiAoKGQtcikgPiAwLjAwMDAwMSkge1xyXG5cdFx0cmV0dXJuIC0xO1xyXG5cdH1cclxuXHRlbHNlIGlmICgoci1kKSA+IDAuMDAwMDAxKSB7XHJcblx0XHRyZXR1cm4gMTtcclxuXHR9XHJcblx0ZWxzZSB7XHJcblx0XHRyZXR1cm4gMDtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNpcmN1bWNlbnRlcih0aHJlZVBvaW50cykge1xyXG5cdC8vIGFsZ29yaXRobSBmcm9tIGZhcmluIGFuZCBoYW5zZm9yZCdzIFByYWN0aWNhbCBMaW5lYXIgQWxnZWdyYTogYSBHZW9tZXRyeSBUb29sYm94IHBhZ2UgMTQ2LlxyXG5cdHZhciBwMSA9IHRocmVlUG9pbnRzWzBdO1xyXG5cdHZhciBwMiA9IHRocmVlUG9pbnRzWzFdO1xyXG5cdHZhciBwMyA9IHRocmVlUG9pbnRzWzJdO1xyXG5cdFxyXG5cdHZhciBkMSA9IGRvdFByb2R1Y3QodlN1YnRyYWN0KHAyLHAxKSwgdlN1YnRyYWN0KHAzLHAxKSk7XHJcblx0dmFyIGQyID0gZG90UHJvZHVjdCh2U3VidHJhY3QocDEscDIpLCB2U3VidHJhY3QocDMscDIpKTtcclxuXHR2YXIgZDMgPSBkb3RQcm9kdWN0KHZTdWJ0cmFjdChwMSxwMyksIHZTdWJ0cmFjdChwMixwMykpO1xyXG5cdHZhciBEID0gMiooZDEqZDIgKyBkMipkMyArIGQzKmQxKTtcclxuXHRcclxuXHQvL0JhcnljZW50cmljIENvb3JkaW5hdGVzXHJcblx0dmFyIGNjMSA9IGQxKihkMitkMykgLyBEO1xyXG5cdHZhciBjYzIgPSBkMiooZDErZDMpIC8gRDtcclxuXHR2YXIgY2MzID0gZDMqKGQxK2QyKSAvIEQ7XHJcblx0XHJcblx0dmFyIGNlbnRlciA9IG5ldyBBcnJheSgyKTtcclxuXHRjZW50ZXJbMF0gPSBjYzEqcDFbMF0gKyBjYzIqcDJbMF0gKyBjYzMqcDNbMF07XHJcblx0Y2VudGVyWzFdID0gY2MxKnAxWzFdICsgY2MyKnAyWzFdICsgY2MzKnAzWzFdO1xyXG5cdFxyXG5cdHJldHVybiBjZW50ZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRvdFByb2R1Y3Qodiwgdykge1xyXG5cdHZhciByID0gdlswXSp3WzBdICsgdlsxXSp3WzFdO1xyXG5cdHJldHVybiByO1xyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gdlN1YnRyYWN0KHYxLCB2Mikge1xyXG5cdHZhciB2ID0gbmV3IEFycmF5KDIpO1xyXG5cdHZbMF0gPSB2MVswXSAtIHYyWzBdO1xyXG5cdHZbMV0gPSB2MVsxXSAtIHYyWzFdO1xyXG5cdHJldHVybiB2O1xyXG59XHJcblxyXG5mdW5jdGlvbiBkaXN0YW5jZShwMSwgcDIpIHtcclxuXHR2YXIgZCA9IChwMVswXS1wMlswXSkgKiAocDFbMF0tcDJbMF0pICsgKHAxWzFdLXAyWzFdKSAqIChwMVsxXS1wMlsxXSk7XHJcblx0ZCA9IE1hdGguc3FydChkKTtcclxuXHRyZXR1cm4gZDtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNJbnB1dE9rKGEpIHtcclxuXHR2YXIgcDEgPSBhWzBdO1xyXG5cdHZhciBwMiA9IGFbMV07XHJcblx0dmFyIHAzID0gYVsyXTtcclxuXHRcclxuXHRcclxuXHQvLyB0d28gb2YgdGhlIHBvaW50cyBhcmUgdGhlIHNhbWVcclxuXHRpZiAocDFbMF0gPT0gcDJbMF0gJiYgcDFbMV0gPT0gcDJbMV0pIHJldHVybiBmYWxzZTtcclxuXHRpZiAocDJbMF0gPT0gcDNbMF0gJiYgcDJbMV0gPT0gcDNbMV0pIHJldHVybiBmYWxzZTtcclxuXHRpZiAocDNbMF0gPT0gcDFbMF0gJiYgcDNbMV0gPT0gcDFbMV0pIHJldHVybiBmYWxzZTtcclxuXHRcclxuXHQvLyBwb2ludHMgYXJlIGNvbGxpbmVhclxyXG5cdHZhciBsciA9IHJlcXVpcmUoXCJsZWZ0LXJpZ2h0XCIpXHJcblx0aWYgKGxyKHAxLCBwMiwgcDMpID09IDApIHJldHVybiBmYWxzZTtcclxuXHRyZXR1cm4gdHJ1ZTtcclxuXHRcclxuXHJcbn0iLCJcInVzZSBzdHJpY3RcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IHR3b1Byb2R1Y3RcblxudmFyIEhBTEZfRE9VQkxFID0gKDE8PDI2KSArIDFcblxuZnVuY3Rpb24gdHdvUHJvZHVjdChhLCBiLCByZXN1bHQpIHtcblx0dmFyIHggPSBhICogYlxuXG5cdHZhciBjID0gSEFMRl9ET1VCTEUgKiBhXG5cdHZhciBhYmlnID0gYyAtIGFcblx0dmFyIGFoaSA9IGMgLSBhYmlnXG5cdHZhciBhbG8gPSBhIC0gYWhpXG5cdFxuXHR2YXIgZCA9IEhBTEZfRE9VQkxFICogYlxuXHR2YXIgYmJpZyA9IGQgLSBiXG5cdHZhciBiaGkgPSBkIC0gYmJpZ1xuXHR2YXIgYmxvID0gYiAtIGJoaVxuXHRcblx0dmFyIGVycjEgPSB4IC0gKGFoaSAqIGJoaSlcblx0dmFyIGVycjIgPSBlcnIxIC0gKGFsbyAqIGJoaSlcblx0dmFyIGVycjMgPSBlcnIyIC0gKGFoaSAqIGJsbylcblx0XG5cdHZhciB5ID0gYWxvICogYmxvIC0gZXJyM1xuXHRcblx0aWYocmVzdWx0KSB7XG5cdFx0cmVzdWx0WzBdID0geVxuXHRcdHJlc3VsdFsxXSA9IHhcblx0XHRyZXR1cm4gcmVzdWx0XG5cdH1cblx0XG5cdHJldHVybiBbIHksIHggXVxufSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoMTQpIiwiXCJ1c2Ugc3RyaWN0XCJcblxudmFyIHR3b1Byb2R1Y3QgPSByZXF1aXJlKFwidHdvLXByb2R1Y3RcIilcbnZhciB0d29TdW0gPSByZXF1aXJlKFwidHdvLXN1bVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNjYWxlTGluZWFyRXhwYW5zaW9uXG5cbmZ1bmN0aW9uIHNjYWxlTGluZWFyRXhwYW5zaW9uKGUsIGIsIHJlc3VsdCkge1xuXHR2YXIgbiA9IGUubGVuZ3RoXG5cdHZhciBnXG5cdGlmKHJlc3VsdCkge1xuXHRcdGcgPSByZXN1bHRcblx0fSBlbHNlIHtcblx0XHRnID0gbmV3IEFycmF5KDIgKiBuKVxuXHR9XG5cdHZhciBxID0gWzAuMSwgMC4xXVxuXHR2YXIgdCA9IFswLjEsIDAuMV1cblx0dmFyIGNvdW50ID0gMFxuXHR0d29Qcm9kdWN0KGVbMF0sIGIsIHEpXG5cdGlmKHFbMF0pIHtcblx0XHRnW2NvdW50KytdID0gcVswXVxuXHR9XG5cdGZvcih2YXIgaT0xOyBpPG47ICsraSkge1xuXHRcdHR3b1Byb2R1Y3QoZVtpXSwgYiwgdClcblx0XHR0d29TdW0ocVsxXSwgdFswXSwgcSlcblx0XHRpZihxWzBdKSB7XG5cdFx0XHRnW2NvdW50KytdID0gcVswXVxuXHRcdH1cblx0XHR2YXIgYSA9IHRbMV1cblx0XHR2YXIgYiA9IHFbMV1cblx0XHR2YXIgeCA9IGEgKyBiXG5cdFx0dmFyIGJ2ID0geCAtIGFcblx0XHR2YXIgeSA9IGIgLSBidlxuXHRcdHFbMV0gPSB4XG5cdFx0aWYoeSkge1xuXHRcdFx0Z1tjb3VudCsrXSA9IHlcblx0XHR9XG5cdH1cblx0aWYocVsxXSkge1xuXHRcdGdbY291bnQrK10gPSBxWzFdXG5cdH1cblx0aWYoY291bnQgPT09IDApIHtcblx0XHRnW2NvdW50KytdID0gMC4wXG5cdH1cblx0aWYocmVzdWx0KSB7XG4gICAgaWYoY291bnQgPCBnLmxlbmd0aCkge1xuICAgICAgdmFyIHB0ciA9IGcubGVuZ3RoLTFcbiAgICAgIGNvdW50LS1cbiAgICAgIHdoaWxlKGNvdW50ID49IDApIHtcbiAgICAgICAgZ1twdHItLV0gPSBnW2NvdW50LS1dXG4gICAgICB9XG4gICAgICB3aGlsZShwdHIgPj0gMCkge1xuICAgICAgICBnW3B0ci0tXSA9IDAuMFxuICAgICAgfVxuICAgIH1cblx0XHRyZXR1cm4gZ1xuXHR9XG5cdGcubGVuZ3RoID0gY291bnRcblx0cmV0dXJuIGdcbn0iLCJcInVzZSBzdHJpY3RcIlxuXG5mdW5jdGlvbiBtZXJnZTJfY21wKGEsIGIsIHJlc3VsdCwgY29tcGFyZSkge1xuICB2YXIgYV9wdHIgPSAwXG4gICAgLCBiX3B0ciA9IDBcbiAgICAsIHJfcHRyID0gMFxuICB3aGlsZShhX3B0ciA8IGEubGVuZ3RoICYmIGJfcHRyIDwgYi5sZW5ndGgpIHtcbiAgICBpZihjb21wYXJlKGFbYV9wdHJdLCBiW2JfcHRyXSkgPD0gMCkge1xuICAgICAgcmVzdWx0W3JfcHRyKytdID0gYVthX3B0cisrXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRbcl9wdHIrK10gPSBiW2JfcHRyKytdXG4gICAgfVxuICB9XG4gIHdoaWxlKGFfcHRyIDwgYS5sZW5ndGgpIHtcbiAgICByZXN1bHRbcl9wdHIrK10gPSBhW2FfcHRyKytdXG4gIH1cbiAgd2hpbGUoYl9wdHIgPCBiLmxlbmd0aCkge1xuICAgIHJlc3VsdFtyX3B0cisrXSA9IGJbYl9wdHIrK11cbiAgfVxufVxuXG5mdW5jdGlvbiBtZXJnZTJfZGVmKGEsIGIsIHJlc3VsdCkge1xuICB2YXIgYV9wdHIgPSAwXG4gICAgLCBiX3B0ciA9IDBcbiAgICAsIHJfcHRyID0gMFxuICB3aGlsZShhX3B0ciA8IGEubGVuZ3RoICYmIGJfcHRyIDwgYi5sZW5ndGgpIHtcbiAgICBpZihhW2FfcHRyXSA8PSBiW2JfcHRyXSkge1xuICAgICAgcmVzdWx0W3JfcHRyKytdID0gYVthX3B0cisrXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRbcl9wdHIrK10gPSBiW2JfcHRyKytdXG4gICAgfVxuICB9XG4gIHdoaWxlKGFfcHRyIDwgYS5sZW5ndGgpIHtcbiAgICByZXN1bHRbcl9wdHIrK10gPSBhW2FfcHRyKytdXG4gIH1cbiAgd2hpbGUoYl9wdHIgPCBiLmxlbmd0aCkge1xuICAgIHJlc3VsdFtyX3B0cisrXSA9IGJbYl9wdHIrK11cbiAgfVxufVxuXG5mdW5jdGlvbiBtZXJnZTIoYSwgYiwgY29tcGFyZSwgcmVzdWx0KSB7XG4gIGlmKCFyZXN1bHQpIHtcbiAgICByZXN1bHQgPSBuZXcgQXJyYXkoYS5sZW5ndGggKyBiLmxlbmd0aClcbiAgfVxuICBpZihjb21wYXJlKSB7XG4gICAgbWVyZ2UyX2NtcChhLCBiLCByZXN1bHQsIGNvbXBhcmUpXG4gIH0gZWxzZSB7XG4gICAgbWVyZ2UyX2RlZihhLCBiLCByZXN1bHQpXG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1lcmdlMiIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoMTQpIiwiXCJ1c2Ugc3RyaWN0XCJcblxudmFyIHR3b1N1bSA9IHJlcXVpcmUoXCJ0d28tc3VtXCIpXG52YXIgYmluYXJ5TWVyZ2UgPSByZXF1aXJlKFwiYmluYXJ5LW1lcmdlXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gbGluZWFyRXhwYW5zaW9uU3VtXG5cbmZ1bmN0aW9uIGNvbXBhcmVNYWduaXR1ZGVzKGEsIGIpIHtcblx0cmV0dXJuIE1hdGguYWJzKGEpIC0gTWF0aC5hYnMoYilcbn1cblxuZnVuY3Rpb24gbGluZWFyRXhwYW5zaW9uU3VtKGUsIGYsIHJlc3VsdCkge1xuXHR2YXIgZyA9IGJpbmFyeU1lcmdlKGUsIGYsIGNvbXBhcmVNYWduaXR1ZGVzLCByZXN1bHQpXG5cdHZhciBuID0gZS5sZW5ndGggKyBmLmxlbmd0aFxuXHR2YXIgY291bnQgPSAwXG5cdHZhciBhID0gZ1sxXVxuXHR2YXIgYiA9IGdbMF1cblx0dmFyIHggPSBhICsgYlxuXHR2YXIgYnYgPSB4IC0gYVxuXHR2YXIgeSA9IGIgLSBidlxuXHR2YXIgcSA9IFt5LCB4XVxuXHRmb3IodmFyIGk9MjsgaTxuOyArK2kpIHtcblx0XHRhID0gZ1tpXVxuXHRcdGIgPSBxWzBdXG5cdFx0eCA9IGEgKyBiXG5cdFx0YnYgPSB4IC0gYVxuXHRcdHkgPSBiIC0gYnZcblx0XHRpZih5KSB7XG5cdFx0XHRnW2NvdW50KytdID0geVxuXHRcdH1cblx0XHR0d29TdW0ocVsxXSwgeCwgcSlcblx0fVxuXHRpZihxWzBdKSB7XG5cdFx0Z1tjb3VudCsrXSA9IHFbMF1cblx0fVxuXHRpZihxWzFdKSB7XG5cdFx0Z1tjb3VudCsrXSA9IHFbMV1cblx0fVxuXHRpZighY291bnQpIHtcblx0XHRnW2NvdW50KytdID0gMC4wXG5cdH1cblx0aWYocmVzdWx0KSB7XG4gICAgaWYoY291bnQgPCBnLmxlbmd0aCkge1xuICAgICAgdmFyIHB0ciA9IGcubGVuZ3RoLTFcbiAgICAgIGNvdW50LS1cbiAgICAgIHdoaWxlKGNvdW50ID49IDApIHtcbiAgICAgICAgZ1twdHItLV0gPSBnW2NvdW50LS1dXG4gICAgICB9XG4gICAgICB3aGlsZShwdHIgPj0gMCkge1xuICAgICAgICBnW3B0ci0tXSA9IDAuMFxuICAgICAgfVxuICAgIH1cblx0fSBlbHNlIHtcblx0XHRnLmxlbmd0aCA9IGNvdW50XG5cdH1cblx0cmV0dXJuIGdcbn0iLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKDE2KSJdfQ==
;
