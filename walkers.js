
// Asyncronous L System walker - 1 step
function walkLSystem1Step (system, inp){
  if(!inp) inp = system.currentState;
  return new Promise(function(resolve, reject){
    var o="";
    var i = -1, c = null;
    var walker = function(){
      i++; c = inp[i];
      if (c == null) {
        system.currentState = o;
        return resolve(system);
      }
      var rule = system.rules[c];
      if(!rule){
        console.log('No rule found for ', c , system.rules);
        window.setTimeout(walker, system.wait||1);
      }

      if(rule.rewrite){
        var opts = rule.rewrite.split(/,/);
        var idx = Math.floor(Math.random() * opts.length);
        var r = opts[idx];
        o += r;
      }
      else o += c;

      if(rule.fn){
        var p = rule.p||[];
        if(typeof(p)=="function") p = p(system, rule);
        turtle[rule.fn].apply(turtle, rule.p||[]);
      }
      window.setTimeout(walker, system.wait||1);
    };
    walker();
  });
}

// Asyncronous L System Walker - Give the renderer time to do its thing
function LSystemWalker (turtle, lsystem, steps){
  return new Promise(function (resolve, reject){
    var pw = window.currentWalker = Object.create(lsystem);
    if(!turtle) turtle = window.turtle;
    if(!turtle) return;
    lsystem.turtle = turtle;
    turtle.walking = true;
    turtle.isDrawing = true;

    var n = steps || lsystem.steps;
    var looper = function(doit){
      if(!doit) return resolve(lsystem);
      walkLSystem1Step(lsystem).then(function(){
        window.setTimeout(function(){
          looper( turtle.walking && (n-- > 0) );
        },1);
      });
    };
    looper(true);
  });
};

fractalPlantWalkerProto = {
  turtle: null,
  currentState: 'X',
  variables : ["X", "F"],
  constants: ["+", "-"],
  start: 'X',
  steps:7,
  rules: {
    "X": {rewrite: "F+[[X]-X],F[-FX]+X"},
    "F": {rewrite: "FF", fn: "forward", p:[1]},
    "[": {fn: "save", p:[]},
    "]": {fn: "restore", p:[]},
    "+": {fn: "turnLeft", p: [20]},
    "-": {fn: "turnRight", p: [20]},
  }
};

hilbertLProto = {
  turtle: null,
  currentState: 'AF',
  variables:['A', 'B'],
  constants:['F', '+', '-'],
  wait: 25,
  steps: 5,
  rules: {
    'A': {rewrite: "-BF+AFA+FB-"},
    'B': {rewrite: "+AF-BFB-FA+"},
    "F": {fn: "forward", p:[10]},
    "+": {fn: "turnLeft", p: [90]},
    "-": {fn: "turnRight", p: [90]},
  }
};



function plantWalkTurtle(turtle, steps, x, y, facing){
  turtle.x = x || turtle.maxX/2;
  turtle.y = y || 400;
  turtle.facing = facing || 310;
  return LSystemWalker(turtle, Object.create(fractalPlantWalkerProto), steps);
};

function hilbertWalker(turtle, steps, x, y, facing){
  turtle.x = x || turtle.maxX/4;
  turtle.y = y || turtle.maxY/4;
  turtle.facing = facing || 0;
  return LSystemWalker(turtle, Object.create(hilbertLProto), steps);
}
