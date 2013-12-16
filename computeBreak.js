
module.exports = function (p1, p2, ys) {
 	var intersection = require("./intersection.js");
	var Point = require("./point.js");

	var x1 = p1.x;
	var y1 = p1.y;
	var x2 = p2.x;
	var y2 = p2.y;
	
	
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

