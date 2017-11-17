var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var virtual = new five.Board.Virtual(
    new five.Expander({
      controller: "SX1509",
      address: 0x3E
    })
  );

  virtual.on("ready", () => {
    console.log('virtual board ready');
    var red = new five.Led({
      pin: 1,
      board: virtual
    });

    var green = new five.Led({
      pin: 15,
      board: virtual
    });

    var blue = new five.Led({
      pin: 6,
      board: virtual
    });
    
    red.on();
    green.on();
    blue.on(); 

    this.repl.inject({
      red,
      green,
      blue,
      virtual: virtual
    });
  })
});
