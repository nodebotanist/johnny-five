var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util");

var priv = new Map(),
  Devices;

Devices = {
  /**
   * TCS34725 Color Sensor w/IR Filter and LED
   *
   * http://www.adafruit.com/products/1334
   */
  "TCS34725": {
    type: "color",
    address: 0x29,
    bytes: 8,
    delay: 154,

    // read request data handler
    data: function(data) {
      console.log(data);
      if(!data){
        return;
      }
      var state = priv.get(this).state,
        red = data[2] << 8 | data[3],
        green = data[4] << 8 | data[5],
        blue = data[6] << 8 | data[7],
        clear = data[0] << 8 | data[1],
        timestamp = new Date(),
        err = null;

      priv.set(this, {
        state: {
          red: red,
          green: green,
          blue: blue,
          clear: clear
        }
      });
    },

    // These are added to the property descriptors defined
    // within the constructor
    descriptor: {
      value: {
        get: function() {
          return priv.get(this).state;
        }
      }
    },
    setup: [
      [0x01, 0xC0],
      [0x0F, 0x01],
      // CRA
      [0x0, 0x01],
      [0x0, 0x01 | 0x02],
    ],
    preread: [
      [0x0]
    ]
  }
};



function ColorSensor(opts) {

  if (!(this instanceof ColorSensor)) {
    return new ColorSensor(opts);
  }

  var address, bytes, data, device, delay, descriptor,
    preread, setup;

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  device = Devices[opts.device];

  address = opts.address || device.address;
  bytes = device.bytes;
  data = device.data;
  delay = device.delay;
  setup = device.setup;
  descriptor = device.descriptor;
  preread = device.preread;

  // Read event throttling
  this.freq = opts.freq || 500;

  // Make private data entry
  priv.set(this, {
    state: 0
  });

  // Set up I2C data connection
  this.io.i2cConfig();

  this.io.i2cReadOnce(address, 0x12 | 0x80, 1, function(bytes){
    if(bytes[0] != 0x44){
      throw new Error("Unable to find TCS34725!");
    }    
  });

  // Enumerate and write each set of setup instructions
  // setup.forEach(function(byteArray) {
  //   this.io.i2cWriteReg(address, 0x80 | byteArray[0], byteArray[1]);
  // }, this);

  //set Integration Time and Gain
  this.io.i2cWriteReg(address, 0x80 | 0x01, 0xC0 & 0xFF);
  this.io.i2cWriteReg(address, 0x80 | 0x0F, 0x01 & 0xFF);
  this.io.i2cWriteReg(address, 0x80 | 0x0, 0x01 & 0xFF);
  setTimeout(function(){
    this.io.i2cWriteReg(address, 0x80 | 0x0, (0x01 | 0x02) & 0xFF);
  }.bind(this), 3);

  setTimeout(function(){
    // Read Request Loop
    setInterval(function() {
      // Set pointer to X most signficant byte/register
      this.io.i2cWrite(address, preread);

      // Read from register
      this.io.i2cReadOnce(address, 0x80 | 0x14, bytes, data.bind(this));

    }.bind(this), delay);

    // Continuously throttled "read" event
    setInterval(function() {
      // @DEPRECATE
      this.emit("read");
      // The "read" event has been deprecated in
      // favor of a "data" event.
      this.emit("data", priv.get(this).state);
    }.bind(this), this.freq);
  }.bind(this), 50);
  // if (descriptor) {
  //   Object.defineProperties(this, descriptor);
  // }
}

util.inherits(ColorSensor, events.EventEmitter);

module.exports = ColorSensor;
