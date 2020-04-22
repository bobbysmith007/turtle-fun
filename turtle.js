// The turtle prototype will be cloned to create new turtles
//
var DEBUG = true;
var TurtleProto = {
  relativeControls: true,
  _isDrawing: false,
  _color: "#000",
  thickness: 1,
  x:0,
  px:0,
  maxX:420,
  y:0,
  py:0,
  maxY:350,
  _facing: 0,
  speed: 1,
  $elt: null,
  currentLineStart: null,
  walking: false,

  get isDrawing(){
    return this._isDrawing;
  },

  set isDrawing(state){
    if(DEBUG) console.log('Toggling isDrawing', state);
    this._isDrawing = state;
    if(state){
      this._startNewLine();
    }else{
      this.currentLine = null;
    }
  },

  get facing (){
    return this._facing;
  },

  set facing(facing){
    if(this._facing != facing){
      this.prevFacing = this._facing;
      this._facing = facing;
      this._startNewLine();
      this.render();
    }
  },

  get color (){
    return this._color;
  },

  set color(color){
    if(this._color != color){
      this._color = color;
      this.render();
    }
  },

  _constructor: function (){  },

  clone: function(board){ // static function
    if(!board) board = window.document.querySelector('.board');
    if(!board){ return false; }
    var o = Object.create(TurtleProto);
    o.$elt = document.createElement('div');
    var img = document.createElement('img');
    o.$elt.append(img);
    o.$elt.$img = img;
    var d = document.createElement('div');
    d.className = 'bg';
    o.$elt.prepend(d);
    o.$elt.$bg = d;
    o.$elt.className = 'turtle right';
    img.src = "turtleico_tran.png";
    o.$elt.setAttribute('style', 'position:absolute; left:0px;top:0px;height:32px;width:32px;rotate:0deg;');
    o.$elt.style.position = "absolute";
    o.$elt.style.left = this.x;
    o.$elt.style.top = this.y;
    o.height = o.$elt.style.height = 32;
    o.width = o.$elt.style.width = 32;
    o.$board = board;
    o.$board.prepend(o.$elt);
    o.maxX = o.$board.clientWidth;
    o.maxY = o.$board.clientHeight;
    return o;
  },

  _checkX: function(){
    if(this.x < 0){
      this.x = this.maxX;
      this._startNewLine();
    }
    else if(this.x > this.maxX){
      this.x = 0;
      this._startNewLine();
    }
  },

  _checkY: function(){
    if(this.y < 0){
      this.y = this.maxY;
      this._startNewLine();
    }
    else if(this.y > this.maxY){
      this.y = 0;
      this._startNewLine();
    }
  },



  left: function left( turns ){
    if(!turns) turns = 1;
    this.facing = 180;
    this.px = this.x;
    this.py = this.y;
    while (turns-- > 0) this.x -= this.speed;
    this._checkX();
    this.render();
    return this;
  },

  right: function right (turns){
    if(!turns) turns = 1;
    this.facing = 0;
    this.px = this.x;
    this.py = this.y;
    while (turns-- > 0) this.x += this.speed;
    this._checkX();
    this.render();
    return this;
  },

  up: function up(turns){
    if(!turns) turns = 1;
    this.facing = 270;
    this.py = this.y;
    this.px = this.x;
    while (turns-- > 0) this.y -= this.speed;
    this._checkY();
    this.render();
    return this;
  },
  down: function down(turns){
    if(!turns) turns = 1;
    this.facing = 90;
    this.py = this.y;
    this.px = this.x;
    while(turns-- > 0) this.y += this.speed;
    this._checkY();
    this.render();
    return this;
  },

  forward: function(turns){
    if(!turns) turns = 1;
    var f = this.facing;
    var dist = turns*this.speed;
    var dx = (Math.cos((2*Math.PI/360)*f)||0) * (dist);
    var dy = (Math.sin((2*Math.PI/360)*f)||0) * (dist);
    if(DEBUG) console.log('forward', dx, dy, dist, this.x, this.y, this.facing);
    this.py = this.y;
    this.px = this.x;
    this.x = this.x + dx;
    this.y = this.y + dy;
    this._checkX();
    this._checkY();
    this.render();
    return this;
  },

  backward: function(turns){
    if(!turns) turns = 1;
    var f = this.facing;
    var bf = ((f+180) % 360);

    this.facing = bf;
    forward(turns);
    this.facing = f;
    this.render();
    return this;
  },

  turnRight: function(deg){
    if( !deg ) deg = 90;
    var f = this.facing;
    var rf = ((f + deg) % 360);
    this.facing = rf;
    this.render();
    return this;
  },

  turnLeft: function(deg){
    if( !deg ) deg = 90;
    var f = this.facing;
    var lf = ((f - deg) % 360);
    while(lf < 0) lf+=360;
    this.facing = lf;
    this.render();
    return this;
  },

  _startNewLine: function(x, y){
    if(!this.isDrawing) return false;
    if( x == null ) x = this.x;
    if( y == null ) y = this.y;
    if(DEBUG) console.log('Starting new line', x, y);
    var l = this.currentLine = {
      sx:x,
      sy:y,
      ex:x,
      ey:y,
      height:1,
      width:0,
      rot: this.facing,
      thickness: this.thickness,
      $elt: document.createElement('div'),

    };
    l.$elt.style.transform = 'rotate('+this.facing+'deg)';
    l.$elt.className = 'line';
    l.$elt.style.top = y+'px';
    l.$elt.style.left = x+'px';
    l.$elt.style.backgroundColor = this.color;
    this.$board.append(l.$elt);
  },


  _renderLine: function(x, y){
    if(!this.isDrawing) return null;
    if(!x) x = this.x;
    if(!y) y = this.y;
    var l = this.currentLine;
    console.log(l, x, y, this.px, this.py);

    l.ey = y;
    l.ex = x;


    var dist = l.distance = Math.sqrt(Math.pow((l.ey - l.sy),2) + Math.pow( (l.ex - l.sx),2));
    var dx = (Math.cos((2*Math.PI/360) * l.rot)||0) * (dist);
    var dy = (Math.sin((2*Math.PI/360) * l.rot)||0) * (dist);
    l.height = l.thickness;
    l.width = l.distance;
    l.$elt.style.left = l.sx;
    l.$elt.style.top = l.sy;
    l.$elt.style.width = l.width+'px';
    l.$elt.style.height = l.height+'px';
  },

  render: function render(){
    this.$elt.$bg.style.backgroundColor = this.color;
    var f = this.facing;

    this.$elt.style.transform = 'rotate('+this.facing+'deg)';
    this.$elt.className = 'turtle '+this.facing;


    var hw =this.width/2, hh=this.height/2;
    var xnudge = (Math.cos((2*Math.PI/360)*this.facing)||0) * hw;
    var ynudge = (Math.sin((2*Math.PI/360)*this.facing)||0) * hh;
    this.$elt.style.left = (this.x + xnudge - hw) + 'px';
    this.$elt.style.top =  (this.y + ynudge - hh) + 'px';
    this._renderLine();
  },

  stopWalk: function stopWalk(){
    this.walking = false;
  },

  spiralWalk: function spiralWalk(){
    this.left();
  },


};

var KeyHandler = {
  press: function (o, event){
    // make keys standard across apis (ArrowUp -> Up)
    var key = event.code.replace('Arrow','');
    var fn = KeyHandler.keyHandlers[key];
    if(DEBUG) console.log('keypress', key, fn);
    if(fn){
      fn(o);
      event.preventDefault();
      event.stopPropagation();
    }
  },
  keyHandlers: {
    Left:  function(o){ o.relativeControls ? o.turnLeft(1) : o.left() ; },
    Right: function(o){ o.relativeControls ? o.turnRight(1) : o.right(); },
    Up:    function(o){ o.relativeControls ? o.forward() : o.up(); },
    Down:  function(o){ o.relativeControls ? o.backward() : o.down();},
    Space: function(o){ o.isDrawing = !o.isDrawing; },
    H: function(o) { o.hilbrantWalk(); },
    s: function(o) { o.stopWalk(); },
    Escape: function(o){
      var it;
      while(  (it = document.querySelector('.line')) ){
        it.parentNode.removeChild(it);
      };
    },
  },
};

// onEvent('screen1', "keydown", function(event){ turtle.keyPressHandler(event); });
window.onload = function(){
  var turtle = window.turtle = TurtleProto.clone();
  window.document.body.addEventListener("keydown", function(event){
    KeyHandler.press(turtle, event);
  });
};
