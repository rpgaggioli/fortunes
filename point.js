	
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