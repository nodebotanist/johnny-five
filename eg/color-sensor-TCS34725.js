var five = require("../lib/johnny-five.js");

five.Board().on("ready", function() {

  var color = new five.ColorSensor({
    device: "TCS34725",
    freq: 250
  });

  // "data"
  //
  // Fires continuously, every 66ms.
  //
  color.on("data", function(data) {
    console.log('Data: ', data);
  });
});
