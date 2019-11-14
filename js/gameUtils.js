function createCrossHair() {
    var cross = new Canvaz({ height: 150, width: 150 });
    cross.ctx.beginPath();
    cross.ctx.moveTo(75, 0);
    cross.ctx.lineTo(75, 150);
    cross.ctx.moveTo(0, 75);
    cross.ctx.lineTo(150, 75);
    cross.ctx.strokeStyle = "red";
    cross.ctx.stroke();


    var sprite = canvasToSprite(cross.canvas);
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    return sprite;
}

function getLine(start, end) {
    let line = new PIXI.Graphics();
    line.lineStyle(10, 0XFF8D07, 1);
    line.moveTo(0, 0);
    line.lineTo(end.x - start.x, end.y - start.y);
    line.position.set(start.x, start.y);
    return line
}