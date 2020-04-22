     // The turtle prototype will be cloned to create new turtles
     //
     var TurtleProto = {
       isDrawing: false,
       color: "#000",
       thickness: 1,
       x:0,
       px:0,
       maxX:420,
       y:0,
       py:0,
       maxY:350,
       facing: "right",
       _rotation: 0,
       speed: 5,
       $elt: null,
       currentLineStart: null,
       walking: false,

       _constructor: function (){ Object.assign(this, TurtleProto); },

       clone: function(board){ // static function
         if(!board) board = window.document.querySelector('.board');
         if(!board){ return false; }
         var o = new TurtleProto._constructor();
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
         o.$elt.style.height = 32;
         o.$elt.style.width = 32;
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

       _maybeChangeDirection: function(facing){
         facing = facing.toLowerCase();
         if(this.facing != facing){
           this.prevFacing = facing;
           this.facing = facing;
           this._startNewLine();
         }
       },

       left: function left(){
         this._maybeChangeDirection("left");
         this.px = this.x;
         this.py = this.y;
         this.x -= this.speed;
         this._checkX();
         this.render();
         return this;
       },

       right: function right (){
         this._maybeChangeDirection("right");
         this.px = this.x;
         this.py = this.y;
         this.x += this.speed;
         this._checkX();
         this.render();
         return this;
       },

       up: function up(){
         this._maybeChangeDirection("up");
         this.py = this.y;
         this.px = this.x;
         this.y -= this.speed;
         this._checkY();
         this.render();
         return this;
       },
       down: function down(){
         this._maybeChangeDirection("down");
         this.py = this.y;
         this.px = this.x;
         this.y += this.speed;
         this._checkY();
         this.render();
         return this;
       },

       forward: function(){
         var f = this.facing;
         var mv = this[f];
         if(mv) mv.call(this);
       },

       backward: function(){
         var f = this.facing;
         var bf = f =="left" ? "right" :
               (f == "right" ? "left" :
                (f== "up" ? "down" :
                 (f == "down"?"up": null)));
         console.log('Facing:', f, bf);
         var mv = this[bf];
         if(mv) mv.call(this);
         this._maybeChangeDirection(f);
         this.render();
       },

       turnRight: function(){
         var f = this.facing;
         var rf = f =="left" ? "up" :
               (f == "right" ? "down" :
                (f== "up" ? "right" :
                 (f == "down"?"left": null)));
         console.log('Facing:', f, rf);
         this._maybeChangeDirection(rf);
         this.render();
       },

       turnLeft: function(){
         var f = this.facing;
         var lf = f =="left" ? "down" :
               (f == "right" ? "up" :
                (f== "up" ? "left" :
                 (f == "down"?"right": null)));
         console.log('Facing:', f, lf);
         this._maybeChangeDirection(lf);
         this.render();
       },

       _startNewLine: function(x, y){
         if(!this.isDrawing) return false;
         console.log('Starting new line', x, y);
         if( x == null ) x = this.x;
         if( y == null ) y = this.y;
         var l = this.currentLine = {
           sx:x,
           sy:y,
           ex:x,
           ey:y,
           height:0,
           width:0,
           thickness: this.thickness,
           $elt: document.createElement('div'),
         };
         l.$elt.className = 'line';
         l.$elt.style.top = y+'px';
         l.$elt.style.left = x+'px';
         l.$elt.style.backgroundColor = this.color;
         this.$board.append(l.$elt);
       },

       setColor: function(c){
         this.color = c;
         this.render();
       },

       _renderLine: function(x, y){
         if(!this.isDrawing) return null;
         if(!x) x = this.x;
         if(!y) y = this.y;

         var l = this.currentLine;
         //console.log(l, x, y, this.px, this.py);
         if (l.sx == x) {
           var y2 = l.sy, y1 = l.ey;
           l.sy = Math.min(y2, y);
           l.ey = Math.max(y1, y);
         }
         else if(l.sy == y){
           var x2 = l.sx, x1 = l.ex;
           l.sx = Math.min(x2, x);
           l.ex = Math.max(x1, x);
         }
         l.height = (l.ey - l.sy) + l.thickness;
         l.width = (l.ex - l.sx) + l.thickness;
         l.$elt.style.left = l.sx;
         l.$elt.style.top = l.sy;
         l.$elt.style.width = l.width+'px';
         l.$elt.style.height = l.height+'px';
       },

       toggleIsDrawing: function(state){
         if(state == null) state = !this.isDrawing
         this.isDrawing = state;
         console.log('Toggling isDrawing', this.isDrawing)
         if(this.isDrawing){
           this._startNewLine();
         }else{
           this.currentLine = null;
         }
       },

       render: function render(){
         this.$elt.$bg.style.backgroundColor = this.color;
         this.$elt.style.left = this.x+'px';
         this.$elt.style.top = this.y+'px';
         var f = this.facing;
         this._rotation = (f=="left" ? 180 :
                           (f == "up" ? 270 :
                            (f == "down" ? 90
                             : 0)));
         this.$elt.style.transform = 'rotate('+this._rotation+'deg)';
         this.$elt.className = 'turtle '+this.facing;
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
         console.log('keypress', key, fn);
         if(fn){ fn(o); }
       },
       keyHandlers: {
         Left:  function(o){ o.left(); },
         Right: function(o){ o.right(); },
         Up:    function(o){ o.up(); },
         Down:  function(o){ o.down(); },
         Space: function(o){ o.toggleIsDrawing(); },
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
