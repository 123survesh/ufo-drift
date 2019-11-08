var Canvaz = (function () {
    function Canvaz(config) {
        this.target = config.target;
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.height = config.height;
        this.width = config.width;
        this.classes = config.classes || [];
        _init.call(this);
    }

    function _init() {
        this.canvas.height = this.height;
        this.canvas.width = this.width;
        addClasses(this.canvas, this.classes);
        if(this.target)
        {
            _populateTarget.call(this);
        }
    }

    function _populateTarget() {
        this.target.appendChild(this.canvas);
    }

    function _unPopulateTarget() {
        this.target.removeChild(this.canvas);
    }

    function _show() {
        this.canvas.style.display = "inline-block";
    }

    function _hide() {
        this.canvas.style.display = "none";
    }

    function _getCopy()
    {
        var copy = document.createElement('canvas');
        copy.height = this.height;
        copy.width = this.width;
        var ctx = copy.getContext('2d');
        ctx.drawImage(this.canvas, 0, 0);
        return {canvas: copy, ctx: ctx};
    }

    Canvaz.prototype.getCopy = function()
    {
        return _getCopy.call(this);
    }

    return Canvaz;
})();