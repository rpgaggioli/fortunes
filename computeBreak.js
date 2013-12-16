
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
