var Board = require("../Board");
var Fn = require("../fn");
var Pins = Board.Pins;

var Controllers = {
    APA102: {
        COLOR_ORDER: "RBG",
        initialize: {
            value: function(opts) {

            }
        },
        update: {

        },
        write: {

        }
    }
};

Controllers.DEFAULT = Controllers.APA102;

/**
 * Led.RGBStrip
 * @constructor
 * 
 * five.Led.RGBStrip({
 *   clock: pin,
 *   data: pin,
 *   numLeds: number
 * })
 * 
 * @param {Object} opts [description]
 * @alias Led.RGBStrip
 */

function RGBStrip(opts) {
    if (!(this instanceof RGBStrip)) {
        return new RGBStrip(opts);
    }

    if (opts.controller && typeof opts.controller === "string") {
        controller = Controllers[opts.controller.toUpperCase()];
    } else {
        controller = opts.controller;
    }

    if (controller == null) {
        controller = Controllers.DEFAULT;
    }

    var state = {
        length: opts.length,
        intensity: 100,
        clockSpeed: opts.clockSpeed || 8000000
    }

    priv.set(this, state);

    Board.Controller.call(this, controller, opts);

    this.initialize(opts);
    this.off();
}