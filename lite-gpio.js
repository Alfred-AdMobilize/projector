const matrix = require("@matrix-io/matrix-lite");

matrix.gpio.setFunction(2, "DIGITAL");

matrix.gpio.setMode(2, "output");


var methods = {};

methods.gpioOn = function() {

    matrix.gpio.setDigital(2, 1);    

}

methods.gpioOff = function() {

    matrix.gpio.setDigital(2, 0);    

}