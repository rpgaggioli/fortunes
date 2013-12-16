
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
				
				newArc.setlArc(curr);
				var copy = Arc(curr.site);
				newArc.setrArc(copy);
				copy.setlArc(newArc);
				curr.setrArc(newArc); 
				
				var a = curr.event;
				if (a){
					for (var i = 0; i < queue.length; i++) {
						if ( !a.isPoint() && queue[i].cCenter == a.cCenter ) {
							queue.splice(i,1);
						}
					}
				}
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
	
	  // 5. Check cicle events of site at right and sight at left 
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
				queue.push(event);
			}	
		}
		if (rcircle){
			event = Event(event.arc.rArc, rcircle.cCenter, rcircle.radius);
			event.arc.rArc.event = event;
			//add event to Event
			if (event.getYAxis() <= sweepLine) {
				queue.push(event);
			}			
		}		
		
		
		sortQueue();
		
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






