/////////////
//VARIABLES//
/////////////

var zmq = require('zeromq');// Asynchronous Messaging Framework
var matrix_io = require('matrix-protos').matrix_io;// Protocol Buffers for MATRIX function
var matrix_ip = '127.0.0.1';// Local IP
var matrix_servo_base_port = 20045;// Port for Servo driver


var rotationServoAngle = 43;//angle of the rotation servo
var rotationServoFlat = 43;//47//43
var rotationServoHigh = 67;//
var rotationServoLow = 20;//26
var rotationServoSet = 32;//31 //30

var powerServoAngle = 40;//74 //angle of the power servo
var powerServoPressing = 18;//gpioOn();//18;// 37;//high the number the closer to the projector
var powerServoNotPressing = 40;//gpioOff();//40;//74 //lower the number the farther to the projector
var powerServoOff = -1;

var methods = {};//declaration of method  controls at the end

//////////////
//ERROR PORT//
//////////////

// Create a Subscriber socket
var errorSocket = zmq.socket('sub');
// Connect Subscriber to Error port
errorSocket.connect('tcp://' + matrix_ip + ':' + (matrix_servo_base_port + 2));
// Connect Subscriber to Error port
errorSocket.subscribe('');
// On Message
errorSocket.on('message', function(error_message){
  console.log('Error received: ' + error_message.toString('utf8'));// Log error
});

/////////////
//BASE PORT//
/////////////

// Create a Pusher socket
var configSocket = zmq.socket('push');
// Connect Pusher to Base port
configSocket.connect('tcp://' + matrix_ip + ':' + matrix_servo_base_port);

///////////////////
//SERVO FUNCTIONS//
///////////////////

function moveRotaionServo(angle){
    //configure which pin and what angle
    var servo_cfg_cmd = matrix_io.malos.v1.io.ServoParams.create({
        pin: 1,
        angle: angle
    });
    //build move command
    var servoCommandConfig = matrix_io.malos.v1.driver.DriverConfig.create({
        servo: servo_cfg_cmd
    });
    //send move command
    configSocket.send(matrix_io.malos.v1.driver.DriverConfig.encode(servoCommandConfig).finish());
};

function movePowerServo(angle){
    //configure which pin and what angle
    var servo_cfg_cmd = matrix_io.malos.v1.io.ServoParams.create({
        pin: 0,
        angle: angle
    });
    //build move command
    var servoCommandConfig = matrix_io.malos.v1.driver.DriverConfig.create({
        servo: servo_cfg_cmd
    });
    //send move command
    configSocket.send(matrix_io.malos.v1.driver.DriverConfig.encode(servoCommandConfig).finish());
};

///////////////////
//CONTROL METHODS//
///////////////////

//Calibration
methods.projectorCalibrate = function() {

    moveRotaionServo(rotationServoHigh);

    setTimeout(function(){
        moveRotaionServo(rotationServoLow); //wait 3 second then projector low
        
        setTimeout(function(){
            moveRotaionServo(rotationServoSet); //wait 3 seconds then go to set position

            console.log("Calibration Complete");

	    rotationServoAngle = rotationServoSet;

        }, 2000)
        
    }, 2000);
    
};

//Projector On
methods.projectorOn = function() {

    movePowerServo(powerServoNotPressing); //dont press

    moveRotaionServo(rotationServoHigh);//used to be high  //projector in position to turn on

    setTimeout(function() {
        moveRotaionServo(rotationServoFlat);

        setTimeout(function() {
            movePowerServo(powerServoPressing); //wait 0.5 seconds then press

            setTimeout(function() {
                movePowerServo(powerServoNotPressing); //wait 2 seconds then dont press

                setTimeout(function() {
                    moveRotaionServo(rotationServoFlat);//used to be low //wait 0.5 seconds then projector low
            
                    setTimeout(function(){
                        moveRotaionServo(rotationServoHigh);
                        
                        methods.projectorCalibrate();

                        console.log("On Sequence Complete");

                    }, 16000);

                }, 500);

            }, 2000);

        }, 500);

    }, 500);

    rotationServoAngle = rotationServoSet;
    //powerServoAngle = powerServoNotPressing;

};

//Projector Off
methods.projectorOff = function() {

    movePowerServo(powerServoNotPressing);
        
    moveRotaionServo(rotationServoHigh);

    setTimeout(function() {
        moveRotaionServo(rotationServoFlat);

        setTimeout(function() {
            movePowerServo(powerServoPressing);

            setTimeout(function() {
                movePowerServo(powerServoNotPressing);

                setTimeout(function() {
                    moveRotaionServo(rotationServoFlat);

                    setTimeout(function() {
                        movePowerServo(powerServoOff);
                        
                        console.log("Off Sequence Complete");

                    }, 500);

                }, 500);

            }, 2000);

        }, 500);

    }, 500);

    rotationServoAngle = rotationServoFlat;
    //powerServoAngle = powerServoNotPressing;
    
};

//Projector Up
methods.projectorUp = function() {

    moveRotaionServo(rotationServoAngle + 1);
    rotationServoAngle = rotationServoAngle + 1;
    console.log(rotationServoAngle);
    
};

//Projector Down
methods.projectorDown = function() {

    moveRotaionServo(rotationServoAngle - 1);
    rotationServoAngle = rotationServoAngle - 1;
    console.log(rotationServoAngle);
    
};

//Projector In
methods.projectorIn = function() {

    movePowerServo(powerServoAngle - 1);
    powerServoAngle = powerServoAngle - 1;
    console.log(powerServoAngle);
    
};

//Projector Out
methods.projectorOut = function() {

    movePowerServo(powerServoAngle + 1);
    powerServoAngle = powerServoAngle + 1;
    console.log(powerServoAngle);
    
};

//////////////////
//EXPORT METHODS//
//////////////////

module.exports = methods;





// ////////
// //GPIO//
// ////////

// var matrix_gpio_base_port = 20049;// Port for GPIO driver

// var configSocketGPIO = zmq.socket('push');

// configSocketGPIO.connect('tcp://' + matrix_ip + ':' + matrix_gpio_base_port);

// var outputConfig = matrix_io.malos.v1.driver.DriverConfig.create({
//     // Update rate configuration
//     delayBetweenUpdates: 2.0,// 2 seconds between updates
//     timeoutAfterLastPing: 6.0,// Stop sending updates 6 seconds after pings.
//     //GPIO Configuration
//     gpio: matrix_io.malos.v1.io.GpioParams.create({
//       pin: 2,// Use pin 0
//       mode: matrix_io.malos.v1.io.GpioParams.EnumMode.OUTPUT,// Set as output mode
//       value: 0// Set initial pin value as off
//     })
//   });
  
//   //Function to toggle gpio value to 0 or 1
//   function gpioOn(){
//     outputConfig.gpio.value = 1;// Set pin value as 1 or 0
//     // Send MATRIX configuration to MATRIX device
//     configSocketGPIO.send(matrix_io.malos.v1.driver.DriverConfig.encode(outputConfig).finish());
//   }

//   function gpioOff(){
//     outputConfig.gpio.value = 0;// Set pin value as 1 or 0
//     // Send MATRIX configuration to MATRIX device
//     configSocketGPIO.send(matrix_io.malos.v1.driver.DriverConfig.encode(outputConfig).finish());
//   }

//   // Create a Pusher socket
// var pingSocket = zmq.socket('push');
// // Connect Pusher to Keep-alive port
// pingSocket.connect('tcp://' + matrix_ip + ':' + (matrix_gpio_base_port + 1));
// // Send initial ping
// pingSocket.send('');
// // Send ping & toggle pin value every 2 seconds
// setInterval(function(){
//   pingSocket.send('');// Send ping
//   toggle();// Change pin value
// }, 2000);

// // Create a Subscriber socket
// var errorSocketGPIO = zmq.socket('sub');
// // Connect Subscriber to Error port
// errorSocketGPIO.connect('tcp://' + matrix_ip + ':' + (matrix_gpio_base_port + 2));
// // Connect Subscriber to Error port
// errorSocketGPIO.subscribe('');
// // On Message
// errorSocketGPIO.on('message', function(error_message){
//   console.log('Error received: ' + error_message.toString('utf8'));// Log error
// });

// // Create a Subscriber socket
// var updateSocket = zmq.socket('sub');
// // Connect Subscriber to Data Update port
// updateSocket.connect('tcp://' + matrix_ip + ':' + (matrix_gpio_base_port + 3));
// // Subscribe to messages
// updateSocket.subscribe('');
// // On Message
// updateSocket.on('message', function(buffer){
//   // Extract message
//   var data = matrix_io.malos.v1.io.GpioParams.decode(buffer);
//   // String value to represent all GPIO pins as off
//   var zeroPadding = '0000000000000000';
//   // Remove padding to make room for GPIO values
//   var gpioValues = zeroPadding.slice(0, zeroPadding.length - data.values.toString(2).length);
//   // Convert GPIO values to 16-bit and add to string
//   gpioValues = gpioValues.concat(data.values.toString(2));
//   // Convert string to chronologically ordered array
//   gpioValues = gpioValues.split("").reverse();
//   // Log GPIO pin states from gpioValues[0-15]
//   console.log('GPIO PINS-->[0-15]\n'+'['+gpioValues.toString()+']');
// });
