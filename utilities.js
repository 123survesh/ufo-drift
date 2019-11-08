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