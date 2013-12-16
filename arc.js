
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