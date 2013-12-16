	
	module.exports = createPoint;
	
	function Point(x,y) {
		this.x = x;
		this.y = y;
	 }

	 function createPoint(x,y) {
		return new Point(x,y);
	 }