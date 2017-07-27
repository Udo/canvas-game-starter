var Game = {
  
  init : function() {
    Game.createDemoObject();
  },
  
  createDemoObject : function() {
    
    // http://pixijs.download/dev/docs/index.html
    
    var r = new PIXI.Graphics();
    r.beginFill(0xffffff, 1.0);
    r.drawRect(-50, -50, 100, 100);
    r.position.x = 400;
    r.position.y = 200;
    Stage.container.addChild(r);
    console.log(r);

    Stage.animation.add(function(deltaTime) {
      r.rotation += -deltaTime;
    });

    var t = new PIXI.Text('Hello World',{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
    t.position.x = 400;
    t.position.y = 200;
    Stage.container.addChild(t);
    console.log(t);
    
    Stage.animation.add(function(deltaTime) {
      t.rotation += deltaTime;
    });
    
  },
  
}