/////////////
//VARIABLES//
/////////////

var matrix_ip = '127.0.0.1';// Local Device IP
var matrix_wakeword_base_port = 60001; // Wakeword base port
var matrix_io = require('matrix-protos').matrix_io;// MATRIX Protocol Buffers
var zmq = require('zeromq');// Asynchronous Messaging Framework
const LM_PATH = '/home/pi/MATRIX-TV-Remote/0652.lm';// Language Model File
const DIC_PATH = '/home/pi/MATRIX-TV-Remote/0652.dic';// Dictation File
var servos = require('./servos.js');
var lights = require('./lights.js');

/////////////
//BASE PORT//
/////////////

// Create a Pusher socket
var configSocket = zmq.socket('push');
// Connect Pusher to Base port
configSocket.connect('tcp://' + matrix_ip + ':' + matrix_wakeword_base_port /* config */);
// Create driver configuration
var config = matrix_io.malos.v1.driver.DriverConfig.create(
{ // Create & Set wakeword configurations
  wakeword: matrix_io.malos.v1.io.WakeWordParams.create({
    lmPath: LM_PATH,// Language model file path
    dicPath: DIC_PATH,// Dictation file path
    channel: matrix_io.malos.v1.io.WakeWordParams.MicChannel.channel8,// Desired MATRIX microphone
    enableVerbose: false// Enable verbose option
  })
});
// Send configuration to MATRIX device
configSocket.send(matrix_io.malos.v1.driver.DriverConfig.encode(config).finish());
console.log('Listening for wakewords');

//////////////
//ERROR PORT//
//////////////

// Create a Subscriber socket
var errorSocket = zmq.socket('sub');
// Connect Subscriber to Error port
errorSocket.connect('tcp://' + matrix_ip + ':' + (matrix_wakeword_base_port + 2));
// Connect Subscriber to Error port
errorSocket.subscribe('');
// On Message
errorSocket.on('message', function(error_message){
  console.log('Error received: ' + error_message.toString('utf8'));// Log error
});

////////////////////
//DATA UPDATE PORT//
////////////////////

// Create a Subscriber socket
var updateSocket = zmq.socket('sub');
// Connect Subscriber to Base port
updateSocket.connect('tcp://' + matrix_ip + ':' + (matrix_wakeword_base_port + 3));
// Subscribe to messages
updateSocket.subscribe('');
// On Message
updateSocket.on('message', function(wakeword_buffer) {
  // Extract message
  var wakeWordData = matrix_io.malos.v1.io.WakeWordParams.decode(wakeword_buffer);
  // Log message
  console.log(wakeWordData);
  // Run actions based on the phrase heard
  switch(wakeWordData.wakeWord) {
    case "MATRIX PROJECTOR ON":
      console.log('I HEARD MATRIX PROJECTOR ON!');
      servos.projectorOn();
      break;

    case "MATRIX PROJECTOR OFF":
      console.log('I HEARD MATRIX PROJECTOR OFF!');
      servos.projectorOff();
      break;

    case "MATRIX PROJECTOR CALIBRATE":
        console.log('I HEARD MATRIX PROJECTOR CALIBRATE!');
        servos.projectorCalibrate();
        break;

    case "MATRIX LIGHTS ON":
        console.log('I HEARD MATRIX LIGHTS OFF!');
        lights.lightsOn();
        break;

    case "MATRIX LIGHTS OFF":
        console.log('I HEARD MATRIX LIGHTS OFF!');
        lights.lightsOff();
        break;

  }
});
