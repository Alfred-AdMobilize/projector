var socket = io();//auto-discovery
$(document).ready(function() {
//////////////////////
///Event Listeners
/////////////////////
	//logs current users
	socket.on("clients connected",function(users){
		console.log(users);
		document.getElementById("users-connected-update").innerHTML = users;
	});
//////////////////////
///Navigation Setup
/////////////////////
	currentNav = "#nav-item1";//initial tab
	currentLayout = "#projector-layout";//initial content
	$(currentLayout).show();//unhide initial content

	$("#nav-item1").on("click", function(){changeLayout("#nav-item1","#projector-layout");});
	$("#nav-item2").on("click", function(){changeLayout("#nav-item2","#lights-layout");});
//////////////////////
///Remote Setup 
/////////////////////

	//Numpad Bindings
	for(var i = 0; i<10; i++){
		setNumPad(i);
	}
	//ON/OFF Buttons
	$( "#projector-on" ).on( "click", function(){remoteCommand("PROJECTOR_ON");});
	$( "#projector-off" ).on( "click", function(){remoteCommand("PROJECTOR_OFF");});

	//Calibrate Button
	$( "#projector-calibrate" ).on( "click", function(){remoteCommand("PROJECTOR_CALIBRATE");});

	//Speaker On Button
	$( "#speaker-on" ).on( "click", function(){remoteCommand("SPEAKER_ON");});

	//UP/DOWN Buttons
	$( "#projector-up" ).on( "click", function(){remoteCommand("PROJECTOR_UP");});
	$( "#projector-down" ).on( "click", function(){remoteCommand("PROJECTOR_DOWN");});

	//IN/OUT Buttons
	$( "#projector-in" ).on( "click", function(){remoteCommand("PROJECTOR_IN");});
	$( "#projector-out" ).on( "click", function(){remoteCommand("PROJECTOR_OUT");});

	//ON/OFF Lights Buttons
	$( "#lights-on" ).on( "click", function(){remoteCommand("LIGHTS_ON");});
	$( "#lights-off" ).on( "click", function(){remoteCommand("LIGHTS_OFF");});

	//White Slider
	$( "#slider-white" ).on( "input", function(){sliderCommand("SLIDER_WHITE", $("#slider-white").val());});

	//Red Slider
	$( "#slider-red" ).on( "input", function(){sliderCommand("SLIDER_RED", $("#slider-red").val());});

	//Green Slider
	$( "#slider-green" ).on( "input", function(){sliderCommand("SLIDER_GREEN", $("#slider-green").val());});

	//Blue Slider
	$( "#slider-blue" ).on( "input", function(){sliderCommand("SLIDER_BLUE", $("#slider-blue").val());});

	//ON/OFF Kitchen Lights Buttons
	$( "#kitchen-lights-on" ).on( "click", function(){remoteCommand("KITCHEN_LIGHTS_ON");});
	$( "#kitchen-lights-off" ).on( "click", function(){remoteCommand("KITCHEN_LIGHTS_OFF");});

//////////////////////
///Functions
/////////////////////
	//Changes Controls (updates nav and current buttons shown)
	function changeLayout(nav, layout){
		if(currentNav != nav){
			$(currentNav).css( "background-color", "transparent" );
			currentNav = nav;
			$(currentNav).css( "background-color", "rgba(255, 255, 255, 0.50)" );

			$(currentLayout).hide();
			currentLayout = layout;
			$(currentLayout).show();
		}
	}
	//Sets NumPad Keys
	function setNumPad(num){
		$( "#button-"+num ).on( "click", function(){remoteCommand("KEY_"+num);});
	}
	//sends ir signal command
	function remoteCommand(buttonPressed){
	    socket.emit('remoteCommand', buttonPressed);
	}

	function sliderCommand(sliderID, sliderValue){
        socket.emit('sliderCommand', {id: sliderID, value: sliderValue});
  	}
});


