var Vector2 = (function(){
	
	function vec2(x, y)
	{	
		this.x = x || 0;
		this.y = y || 0;
	}

	function _set(x, y)
	{
		this.x = x;
		this.y = y;
	}

	function _setX(x)
	{
		this.x = x;
	}

	function _setY(y)
	{
		this.y = y;
	}

	vec2.prototype.set = function(x, y) {
		_set.call(this, x, y);
	};

	vec2.prototype.setX = function(x) {
		_setX.call(this, x);
	};

	vec2.prototype.setY = function(y) {
		_setY.call(this, y);
	};

	return vec2;
})();

function addAttributes(element, attributes)
{
	var keys = Object.keys(attributes);
	var length = keys.length;
	for(var i=0;i<length;i++)
	{
		element.setAttribute(keys[i],attributes[keys[i]]);
	}
}

function degToRad(deg)
{
	return (deg*(Math.PI/180));
}

function addClasses(element, classes)
{
		if(typeof(classes) == 'string')
		{
			classes = classes.split(" ");
		}
		var length = classes.length;
		for(var i=0;i<length;i++)
		{
			element.classList.add(classes[i]);
		}
	
}

function updateObject(source, destination, keyList)
{
	var keys = Object.keys(source);
	var length = keys.length;
	for(var i=0;i<length;i++)
	{
		if(keyList.indexOf(keys[i]) > -1)
		{
			destination[keys[i]] = source[keys[i]]; // parameter sent as reference hence updates in the memory location
		}
	}
}

function mirrorImage(ctx, image, horizontal = false, vertical = false){
	var x = 0, y = 0;
    ctx.save();  // save the current canvas state
    ctx.setTransform(
        horizontal ? -1 : 1, 0, // set the direction of x axis
        0, vertical ? -1 : 1,   // set the direction of y axis
        x + horizontal ? image.width : 0, // set the x origin
        y + vertical ? image.height : 0   // set the y origin
    );
    ctx.drawImage(image,0,0);
    ctx.restore(); // restore the state as it was when this function was called
}
