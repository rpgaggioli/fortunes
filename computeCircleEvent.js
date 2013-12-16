
module.exports = function(arc1, arc2, arc3, siteList){
	var inCircle = require("pointincircle");
	var circumcenter = require("./circumcenter.js")
	var leftRight = require("left-right");
	
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
