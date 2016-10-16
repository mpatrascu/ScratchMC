var Drone = require('/drone/drone').Drone
var foreach = require('utils').foreach

var JavaString = java.lang.String;
var http = require('http');
var utils = require('utils');
var sounds = require('sounds');
var teleport = require('teleport');

var scratchReturnAddress = 'http://127.0.0.1:8089/'; 
    
scratchClients=[];


function scratch(command,ip){
	var players = utils.players();	
    var cmd = command.split("/");
    var index = -1;	
	var drona = '';

	for(i = 0; i < scratchClients.length; i++){
		if (scratchClients[i].ip == ip){
			console.log("target player: " + scratchClients[i].playerName);
			index = i;
			drona = scratchClients[i].drone;
			targetPlayer = scratchClients[i].targetPlayer;
			}
		}
	
	if(cmd[0] == 'connect'){
    		console.log('trying to connect to player ' + cmd[1]);
    		playerName = cmd[1];
    		targetPlayer = server.getPlayer(playerName);
    		if(targetPlayer != null){
    			drona = new Drone (targetPlayer.location);
    			if (index == -1){ //new player
    				scratchClients.push({playerName:playerName, targetPlayer:targetPlayer,drone:drona, ip:ip});
    				index = scratchClients.length-1;
    				echo(targetPlayer, "Connected to Scratch client on IP "+ip);
    				}
    			else { //update existing player
    				scratchClients[index].playerName = playerName;
    				scratchClients[index].targetPlayer = targetPlayer;
    				scratchClients[index].drone = drona;
    				}
    			}
    			   
    		if (index == -1) { //use of other command before connecting to any player
				console.log('Player not found');
				scratchReturn(-1, -1, 'player_not_found', ip); 
				return
				}	
			else { //return to Scratch current block
				bl = drona.getBlock();
				scratchReturn(bl.typeId, bl.data, 'connected', ip); //updates values for current block to be read by Scratch 	
				}
    		}    			
		
	if (index == -1) { //use of other command before connecting to any player
		console.log('No target player defined');
		scratchReturn(-1, -1, 'no_target_player', ip); 
		return
		}
	console.log("command received -" + command+";");
	switch(cmd[0]){   
	    case 'build'://for building commands: box, box0, cylinder, prism, etc
	    	drona[cmd[1]]('' + cmd[2] + ':' + parseInt(cmd[3]), parseInt(cmd[4]), parseInt(cmd[5]), parseInt(cmd[6])); 
	    	break;
  	
		case 'rainbow':
    		drona.rainbow(parseInt(cmd[1]));  			
    		break;	
		
		case 'place':
			switch(cmd[1]){
				case 'door':
				case 'bed':
				case 'ladder':
					drona[cmd[1]]();  			
					break;					

				case 'torch':
					drona.hangtorch();  			
					break;

				case 'stairs':
					drona.stairs(parseInt(cmd[2]), parseInt(cmd[4]), parseInt(cmd[5]));  			
					break;			

				case 'signpost':
				case 'wallsign':
					textArray = [];
					for (i = 2; i < 6; i++)
						textArray.push(decodeURIComponent(cmd[i]));
					drona[cmd[1]](textArray);  			
					break;	
				}
    		break;	
    		
		case 'summon':   //summons mobs using Scriptcraft predefined drone's summon method
			drona.spawn(cmd[1]) ;   		
			break ;	
			
		case 'entitySound':   //plays the sounds of the specified entity on each connected player MC session
			utils.foreach( players, function( player ) { 
				sounds['entity' + cmd[1] + cmd[2]]( player ); // spigot 1.10
			} ); 		
			break ;
			
  		case 'blockSound':   //plays the sounds of the specified block on each connected player MC session
			utils.foreach( players, function( player ) { 
				sounds['block' + cmd[1] + cmd[2]]( player ); // spigot 1.10
			} ); 		
			break ;
			
		case 'music': //plays the specified record on each connected player MC session
			utils.foreach( players, function( player ) { 
				sounds['record' + cmd[1]]( player ); // spigot 1.10
			} ); 		
			break ;
			    
		case 'teleport': //teleports specified player to new coordinates
			utils.foreach( players, function( player ) { 
				if (player.name.toLowerCase() == cmd[1].toLowerCase()){
					newlocation = player.location;
					if(cmd[2] == 'to'){ //absolute coordinates
						newlocation.x = parseInt(cmd[3]);
						newlocation.y = parseInt(cmd[4]);
						newlocation.z = parseInt(cmd[5]);
					}
					else{ //relative coordinates
						newlocation.x += parseInt(cmd[3]);
						newlocation.y += parseInt(cmd[4]);
						newlocation.z += parseInt(cmd[5]);
					}
					teleport (player, newlocation);
				}
			} );
			break;
			    
    	case 'moveDrone':
			switch(cmd[1]){	
				case 'reset':
    				drona = new Drone (targetPlayer.location);
    				scratchClients[index].drone = drona;   			
    				break;
				case 'up':
				case 'down':
				case 'left':
				case 'right':
				case 'fwd':
				case 'back':
				case 'turn':
					drona[cmd[1]](parseInt(cmd[2])); 
					break;
				case 'save_chkpt':
					drona.chkpt(cmd[2]);
				case 'goto_chkpt':
					drona.move(cmd[2]); 
					break;
    			}		
    		bl = drona.getBlock();
		scratchReturn(bl.typeId, bl.data, 'ok', ip); //updates values for current block to be read by Scratch
		break;
    }   
};



function scratchReturn(bltype, bldata, result, ip){ //updates values for current block to be read by Scratch
	var http = require('http');
	http.request( scratchReturnAddress + bltype + '/' + bldata + '/' + result + '/' +ip, function(responseCode, responseBody){console.log(  responseBody );});
}

exports.scratch = scratch
