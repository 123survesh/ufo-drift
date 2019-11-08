var target = document.getElementById('target');
var canvazConfig = {
	target: target,
	height: 500,
	width: 500,
	classes: ["canvas"]
}
var canvas = new Canvaz(canvazConfig);

canvas.ctx.beginPath();
canvas.ctx.arc(125, 250, 250, degToRad(270), degToRad(360));
canvas.ctx.moveTo(125,0);
canvas.ctx.lineTo(125,250);
canvas.ctx.lineTo(375,250);
canvas.ctx.lineTo(125, 0);

canvas.ctx.rect(125, 250, 250, 250);
canvas.ctx.stroke();
canvas.ctx.fill();





function sampleMove()
{
	moveDown(canvas.ctx.getImageData(0, 0, 500, 500), 0, 0)

	function moveDown(imageData, x, y)
	{
		canvas.ctx.clearRect(0,0,canvas.height, canvas.width);
		y++;
		canvas.ctx.putImageData(imageData, x, y);
		if(y < 125)
		{
			console.log(y);
			setTimeout(function(){moveDown(imageData, x, y)}, 10);
		}
		else
		{
			console.log("Arc");
			moveOnArc(imageData, {x: 125, y: 250}, 125, 270, 125, 125)
		}
	}

	function moveOnArc(imageData, center, radius, deg, x, y)
	{
		// canvas.ctx.clearRect(0,0,canvas.height, canvas.width);
		canvas.ctx.putImageData(imageData, x, y);
		deg++;
		if(deg < 360)
		{
			// console.log(deg);
			x = radius * Math.cos(degToRad(deg));
			y = radius * Math.sin(degToRad(deg)) + 250;
			setTimeout(
				function(){
					moveOnArc(imageData, center, radius, deg, x, y);
				}, 10);
		}
		else
		{
			console.log("stopped");
		}		
	}

}