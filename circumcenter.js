
	
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