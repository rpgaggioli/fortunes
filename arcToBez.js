
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

