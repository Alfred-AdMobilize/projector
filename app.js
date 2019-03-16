/////////////
//VARIABLES//
/////////////

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var servos = require('./servos.js');
var lights = require('./lights.js');
//var wakeword = require('./wakeword.js');

var kitchenSocket = require('socket.io-client')('http://light-switch.local:8000');

//////////////////
//EXPRESS SERVER//
//////////////////

//Define Public Dir
app.use(express.static(__dirname + '/public'));
//Server Set Up
var port = 8000
http.listen(port,function(){
  console.log('Server Initiated' );
});

/////////// 
//SOCKETS//
///////////

var clients = [];
io.on('connection', function(socket){

  /////////////////
  //ON CONNECTION//
  /////////////////

  clients.push(socket.id);
  console.log('A user has connected');
  if(clients.length == null)
    console.log("Current Users: 0");
  else
    console.log("Current Users: " + clients.length);
  io.emit('clients connected', clients.length);//update client's user count

  /////////////////
  //ON DISCONNECT//
  /////////////////

  socket.on('disconnect', function(){
    for(var i = 0; i < clients.length; i++){
      if(clients[i] == socket.id){
        clients.splice(i,1);
      }
    }
    console.log('A user has disconnected');
    if(clients.length == null)
      console.log("Current Users: 0");
    else
      console.log("Current Users: " + clients.length);
    io.emit('clients connected', clients.length);//update client's user count
  });

  ////////////
  //CONTROLS//
  ////////////

  //Set CLI variable
  var exec = require('child_process').exec;
  //Event Listener
  socket.on('remoteCommand', function(cmd){

    console.log(cmd);//log button pressed

    //////////////////////
    //PROJECTOR CONTROLS//
    //////////////////////    

    if (cmd === 'PROJECTOR_ON'){
      servos.projectorOn();
    }

    if (cmd === 'PROJECTOR_OFF'){
      servos.projectorOff();
    }

    if (cmd === 'PROJECTOR_CALIBRATE'){
      servos.projectorCalibrate();
    }

    if (cmd === 'PROJECTOR_UP'){
      servos.projectorUp();
    }

    if (cmd === 'PROJECTOR_DOWN'){
      servos.projectorDown();
    }

    if (cmd === 'PROJECTOR_IN'){
      servos.projectorIn();
    }

    if (cmd === 'PROJECTOR_OUT'){
      servos.projectorOut();
    }

    ////////////////////////////
    //PROJECTOR LIGHT CONTROLS//
    ////////////////////////////

    if (cmd === 'LIGHTS_ON'){
      lights.lightsOn();
    }

    if (cmd === 'LIGHTS_OFF'){
      lights.lightsOff();
    }

    //////////////////////////
    //KITCHEN LIGHT CONTROLS//
    //////////////////////////

    if (cmd === 'KITCHEN_LIGHTS_ON'){
      io.emit('remoteCommand','KITCHEN_LIGHTS_ON');
      console.log('Kitchen Lights On')
    }

    if (cmd === 'KITCHEN_LIGHTS_OFF'){
      io.emit('remoteCommand','KITCHEN_LIGHTS_OFF');
      console.log('Kitchen Lights Off')
    }

    ////////////////////
    //SPEAKER CONTROLS//
    ////////////////////

    if (cmd === 'SPEAKER_ON'){
      io.emit('SPEAKER_ON','SPEAKER_ON');
      console.log('Speaker On')
    }

  });

  /////////////////////////
  //LIGHT SLIDER CONTROLS//
  /////////////////////////

  socket.on('sliderCommand', function(cmd){

    console.log(cmd.id);//log slider change

    if (cmd.id === 'SLIDER_WHITE'){

      console.log(cmd.value);

      lights.lightsSliderWhite(cmd.value);

    }

    if (cmd.id === 'SLIDER_RED'){

      console.log(cmd.value);

      lights.lightsSliderRed(cmd.value);

    }

    if (cmd.id === 'SLIDER_GREEN'){

      console.log(cmd.value);

      lights.lightsSliderGreen(cmd.value);

    }

    if (cmd.id === 'SLIDER_BLUE'){

      console.log(cmd.value);

      lights.lightsSliderBlue(cmd.value);

    }

  });

});
