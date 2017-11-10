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
    var led = new five.Led({
      pin: 15,
      board: virtual
    });

    led.on();

    this.repl.inject({
      led: led
    });
  })
});
