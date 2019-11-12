function createCrossHair() {
    var cross = new Canvaz({ height: 150, width: 150 });
    cross.ctx.beginPath();
    cross.ctx.moveTo(75, 0);
    cross.ctx.lineTo(75, 150);
    cross.ctx.moveTo(0, 75);
    cross.ctx.lineTo(150, 75);
    cross.ctx.strokeStyle = "red";
    cross.ctx.stroke();


    return canvasToSprite(cross.canvas);


}

function addLine(start, end) {
    let line = new PIXI.Graphics();
    line.lineStyle(4, 0xFFFFFF, 1);
    line.moveTo(start.x, start.y);
    line.lineTo(start.x+1, start.y+1);
    // line.x = 32;
    // line.y = 32;
    mapContainer.addChild(line);
    // return line;
}