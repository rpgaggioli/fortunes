	
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
