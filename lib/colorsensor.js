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
    bytes: 4,
    delay: 400,

    // read request data handler
    data: function(read, data) {
      var state = priv.get(this).state,
        red = data[0],
        green = data[1],
        blue = data[2],
        clear = data[3],
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
      // CRA
      [0x0, 0x01]
    ],
    preread: [
      [0x0]
    ]
  }
};



function ColorSensor(opts) {

  if (!(this instanceof IR)) {
    return new IR(opts);
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

  // Enumerate and write each set of setup instructions
  setup.forEach(function(byteArray) {
    this.io.i2cWrite(address, byteArray);
  }, this);

  // Read Request Loop
  setInterval(function() {
    // Set pointer to X most signficant byte/register
    this.io.i2cWrite(address, preread);

    // Read from register
    this.io.i2cReadOnce(address, bytes, data.bind(this));

  }.bind(this), delay);

  // Continuously throttled "read" event
  setInterval(function() {
    // @DEPRECATE
    this.emit("read");
    // The "read" event has been deprecated in
    // favor of a "data" event.
    this.emit("data");
  }.bind(this), this.freq);

  if (descriptor) {
    Object.defineProperties(this, descriptor);
  }
}

util.inherits(ColorSensor, events.EventEmitter);

module.exports = ColorSensor;
