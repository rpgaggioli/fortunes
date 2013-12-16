
module.exports = createEvent;

	function Event(arc, cCenter, radius){
		this.radius = radius;
		this.cCenter = cCenter;
		this.arc = arc; //disappearing arc
	}
	
	Event.prototype.getYAxis = function() {
		return this.radius + this.cCenter.y;
	}
	
	Event.prototype.isPoint = function(){
		return false;
	}
	
	function createEvent(arc, cCenter, radius){
		return new Event(arc, cCenter, radius);
	}