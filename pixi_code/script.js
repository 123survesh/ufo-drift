var maplings = new Mapling({
  length: 100
});

let app = new PIXI.Application({ 
    width: 500, 
    height: 500,                       
    antialias: true, 
    transparent: false, 
    resolution: 1
  }
);

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

//load an image and run the `setup` function when it's done
setup()

//This `setup` function will run when the image has loaded
function setup() {

  //Create the cat sprite
  // var one = new PIXI.Sprite.from(maplings.maps[7].canvas);  
  // var two = new PIXI.Sprite.from(maplings.maps[1].canvas);  
  // var three = new PIXI.Sprite.from(maplings.maps[4].canvas);  
  // var four = new PIXI.Sprite.from(maplings.maps[2].canvas);  
  
  // one.position.set(0,0);
  // two.position.set(0,50);
  // three.position.set(50,100);
  // four.position.set(100,0);

  // var map = new PIXI.Container();
  
  // //Add the cat to the stage
  // map.addChild(one);
  // map.addChild(two);
  // map.addChild(three);
  // map.addChild(four);

  // map.position.set(25,25);

  // app.stage.addChild(map);  

  // console.log(map.width, map.height);



}
  var mapContainer = new PIXI.Container();
  var assemblerConfig = {
    directions : ["v-u-l","h-l-d","v-d-r","h-r-u"],
    height: 400,
    width: 400,
    mapling: maplings,
    container: mapContainer
  }
  var directionAssembler = new Assembler(assemblerConfig);

  app.stage.addChild(mapContainer);