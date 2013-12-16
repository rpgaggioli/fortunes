
	var intersection = require("./intersection.js");
	var Point = require("./point.js");
	
	p1 = Point(1,0);
	p2 = Point(2,0);
	p3 = Point(0,1);
	p4 = Point(0,2);
	
	var x = intersection(p1,p2,p3,p4)
	console.log(x.x);
	

// module.exports = function(points, sweepLine){

	// var Point = require("./point.js");
	// var Event = require("./event.js");
	// var Edge = require("./edge.js");
	// var Arc = require("./arc.js");
	// var arcToBez = require("./arcToBez.js");
	// var Fortunes = require("./fortunes.js");
	// var computeBreak = require("./computeBreak.js")
	
	// make points array into siteList
	// fortunes = Fortunes(siteList, sweepLine);
	
	// compute k values for the animation
	// curr = fortunes.beachLine;
	// while(curr){
		// curr.k = arcToBez(curr, sweepLine);
		// curr = curr.rArc;
	// }
	
	
	// compute latest breakpoints and fill empty vertices in fortunes.edgeList--done in fortunes
	
	// from the exports of fortunes compute drawable things
	
	
	
	// return{
	
	// }
// }