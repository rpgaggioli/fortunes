
var Point = require("./point.js");
var Fortunes = require("./fortunes.js");

var dimension = 600;
var numPoints = 10;
var sweepLine = 0;

var canvas, data, pBeach;
var bAnimate;
var context;

var fortunes;
var siteList;


function onLoad() {
	// create canvas
    canvas = document.createElement('canvas');
    canvas.width = canvas.height = dimension;
    canvas.style.border = '1px solid #000';
    document.body.appendChild(canvas);
	context = canvas.getContext('2d');
	
	// create data labels
	pBeach = document.createElement('div');
	document.body.appendChild(pBeach);
	
	data = document.createElement('div');
	document.body.appendChild(data);
	
	// create controls
    bAnimate = document.createElement('button');
	bAnimate.appendChild(document.createTextNode('Animate Sweep Line'));
	bAnimate.style.padding = '10px';
	bAnimate.style.display = 'block';
	document.body.appendChild(bAnimate);
	
	// initialize algorithm
	createSites();
	animate();
    
	// canvas events
    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function(e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function(e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function(e) {
        findxy('out', e)
    }, false);
	
	// control events
	bAnimate.addEventListener("click", function(e) {
		animate();
	}, false);
}


function createSites() {
	siteList = new Array(numPoints);
	for (var i = 0; i < numPoints; i++) {
		do {
			var x = (Math.random() * (dimension - 1)) + 1;
			var y = (Math.random() * (dimension - 1)) + 1;
		} while (isRepeat(x,y));
		siteList[i] = Point(x,y);
	}
}


function isRepeat(x,y) {
	siteList.forEach(function(site) {
		if (x == site.x || y == site.y) {
			return true;
		}
	});
	return false;
}
	

function animate() {
	for (sweepLine = 0; sweepLine <= dimension + 400; sweepLine++) {
		(function(x){
			setTimeout(function() {resetCanvas(x)}, x*10);
        })(sweepLine);
	}
}
	
	
function drawFrame() {
	fortunes = Fortunes(siteList, sweepLine);
	
	drawSweep();
	drawSites();
	drawEdges();
	drawArcs();
}


function drawSweep() {
	context.restore();
	context.strokeStyle = 'black';
	context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0,sweepLine);
    context.lineTo(dimension,sweepLine);
    context.closePath();
    context.stroke();
	
	data.textContent = "SweepLine-Y: " + sweepLine;
}


function drawSites() {
	context.restore();
	context.fillStyle = "rgb(255, 0, 0)";
	for (var i = 0; i < siteList.length; i++) {
		context.beginPath();
		context.arc(siteList[i].x, siteList[i].y, 2, 0, Math.PI*2, true);
		context.fill();
	}
}


function drawEdges() {
	context.restore();
	context.strokeStyle = 'green';
	for (var i = 0; i < fortunes.edgeList.length; i++) {
		context.beginPath();
		context.moveTo(fortunes.edgeList[i].lVertex.x, fortunes.edgeList[i].lVertex.y);
		context.lineTo(fortunes.edgeList[i].rVertex.x, fortunes.edgeList[i].rVertex.y);
		context.stroke();
	}
}


function drawArcs() {
	context.restore();
	context.strokeStyle = 'blue';
	for (curr = fortunes.beachLine; curr; curr = curr.rArc) {
		context.beginPath();
		context.moveTo(curr.lBreak.x, curr.lBreak.y);
		context.quadraticCurveTo(curr.k.x, curr.k.y, curr.rBreak.x, curr.rBreak.y);
		context.stroke();
	}
}


// handles events used to change the sweepLine in the canvas
var flag = false;
function findxy(res, e) {
    if (res == 'down') {
		resetCanvas(e.clientY - canvas.offsetTop);
        flag = true;
    }
    if (res == 'up' || res == 'out') {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            resetCanvas(e.clientY - canvas.offsetTop);
        }
    }
}


// resets the canvas with the given sweepLine value s
function resetCanvas(s) {
	sweepLine = s;
    context.clearRect(0, 0, dimension, dimension);
	drawFrame();
}

// start
onLoad();



// LOG
function logDataPoint(label,p) {
	var tmp = document.createElement('p');
	tmp.textContent = label + ": " + "x: " + p.x + ", y: " + p.y;
	pBeach.appendChild(tmp);
}