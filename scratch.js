var Drone = require('/drone/drone').Drone
var foreach = require('utils').foreach

var JavaString = java.lang.String;
var http = require('http');
var utils = require('utils');
var sounds = require('sounds');
var teleport = require('teleport');

var scratchReturnAddress = 'http://127.0.0.1:8089/'; 

http.request( scratchReturnAddress + 'init', function(responseCode, responseBody){
	console.log( responseBody );});
    
scratchClients=[];


function scratch(command, ip){
	var players = utils.players();	
    var cmd = command.split("/");
    var index = -1;	
	var drona ;

	for(i = 0; i < scratchClients.length; i++){
		if (scratchClients[i].ip == ip){
			console.log("target player: " + scratchClients[i].playerName);
			index = i;
			drona = scratchClients[i].drone;
			targetPlayer = scratchClients[i].targetPlayer;
			}
		}
	
	if(cmd[0] == 'connect'){ //resets drone?
    		console.log('trying to connect to player ' + cmd[1]);
    		playerName = cmd[1];
    		targetPlayer = server.getPlayer(playerName);
    		if(targetPlayer != null){
    			if (utils.getMousePos(targetPlayer)){
    				droneLocation = utils.getMousePos(targetPlayer); //takes the position of the block the player is looking at
    				droneLocation.setYaw(targetPlayer.location.getYaw()); //keeps the orientation of the player
    				drona = new Drone (droneLocation);
    				}
    			else{
    				drona = new Drone (targetPlayer.location);
    				}
    			if (index == -1){ //new player
    				scratchClients.push({playerName: playerName, targetPlayer: targetPlayer, drone: drona, ip: ip});
    				scratchUpdatePlayer(targetPlayer, ip);
    				index = scratchClients.length - 1;
    				targetPlayer.sendTitle("Scratch","connected to " + ip);
    				}
    			else { //update existing player
    				scratchClients[index].playerName = playerName;
    				scratchClients[index].targetPlayer = targetPlayer;
    				scratchClients[index].drone = drona;
    				}
    			}
    			   
    		if (index == -1) { //use of other command before connecting to any player
				console.log('Player not found');
				scratchReturn(null, 'player_not_found', ip); 
				return;
				}	
			else { //return to Scratch current block
				bl = drona.getBlock();
				scratchReturn(bl, 'connected', ip); //updates values for current block to be read by Scratch 	
				}
    		}    			
		
	if (index == -1) { //use of other command before connecting to any player
		console.log('No target player defined');
		scratchReturn(null, 'no_target_player', ip); 
		return;
		}
	console.log("command received -" + command+";");
	switch(cmd[0]){   
		case 'reset_all': //Scratch client disconnected
			scratchClients.splice(index, 1);
			break;
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
				case 'marker':
					switch(drona.dir){
						case 0: //east
							skullDir = 5; //?
							break;
						case 1: //south
							skullDir = 3;
							break;
						case 2: //west
							skullDir = 4; //?
							break;
						case 3: //north
							skullDir = 2;
							break;	
						}
					drona.box("144:" + skullDir);
					console.log(drona.dir);
					break;
				}
    		break;	
    		
    		
		case 'summon':   //summons mobs using Scriptcraft predefined drone's summon method
			drona.spawn(cmd[1]) ;   		
			break ;	
			
		case 'entitySound':   //plays the sounds of the specified entity on each connected player MC session
			utils.foreach( players, function( player ) { 
				if (cmd[3].toLowerCase() == 'all' || cmd[3].toLowerCase() == player.name.toLowerCase())
					sounds['entity' + cmd[1] + cmd[2]]( player ); 
			} ); 		
			break ;
			
  		case 'blockSound':   //plays the sounds of the specified block on each connected player MC session
			utils.foreach( players, function( player ) { 
				if (cmd[3].toLowerCase() == 'all' || cmd[3].toLowerCase() == player.name.toLowerCase())
					sounds['block' + cmd[1] + cmd[2]]( player ); 
			} ); 		
			break ;
			
		case 'music': //plays the specified record on each connected player MC session
			utils.foreach( players, function( player ) { 
				if (cmd[3].toLowerCase() == 'all' || cmd[3].toLowerCase() == player.name.toLowerCase())
					sounds['record' + cmd[1]]( player ); 
			} ); 		
			break ;
			    
		case 'time':
			switch(cmd[1]){
				case 'day':
					drona.world.setTime(1000);
					break;
				case 'night':
					drona.world.setTime(14000);
					break;
				default:	
					drona.world.setTime(cmd[1]);
					break;
				}
			break;
			
		case 'weather':
			switch(cmd[1]){
				case 'clear':
					drona.world.setStorm(false);
					drona.world.setThundering(false);
					break;
				case 'rain':
					drona.world.setStorm(true);
					drona.world.setThundering(false);
					break;
				case 'thunders':
					drona.world.setStorm(true);
					drona.world.setThundering(true);
					break;
			}
			break;
		
		case 'teleport': //teleports specified player to new coordinates
			utils.foreach( players, function( player ) { 
				if (player.name.toLowerCase() == cmd[1].toLowerCase()){
					newlocation = player.location;
					if(cmd[2] == 'to'){ //absolute coordinates
						newlocation.x = parseFloat(cmd[3]);
						newlocation.y = parseFloat(cmd[4]);
						newlocation.z = parseFloat(cmd[5]);
					}
					else{ //relative coordinates
						newlocation.x += parseFloat(cmd[3]);
						newlocation.y += parseFloat(cmd[4]);
						newlocation.z += parseFloat(cmd[5]);
					}
					teleport (player, newlocation);
				}
			} );
			break;
			
		case 'turn': //set yaw parameter for player (direction where it looks)
			 utils.foreach( players, function( player ) { 
				if (player.name.toLowerCase() == cmd[1].toLowerCase()){
					newlocation = player.location;
					console.log(player.name);
					console.log("initial yaw: " + newlocation.getYaw());
					
					switch(cmd[2]){
						case 'to_direction': //direction set to cmd[3] value
							newlocation.setYaw(parseInt(cmd[3]));
							break
						case 'by': //player will turn by cmd[3] degrees
							newlocation.setYaw(newlocation.getYaw() + parseInt(cmd[3]));
							break;
						case 'to_point': //player will look at specified point
							dx = newlocation.x - parseFloat(cmd[3]);
							dy = newlocation.y + 1 - parseFloat(cmd[4]);
							dz = newlocation.z - parseFloat(cmd[5]);
							dh = Math.sqrt(dx * dx + dz * dz);
							newlocation.setYaw(Math.atan2(-dx, dz) * 180 / Math.PI - 180);
							newlocation.setPitch(- Math.atan2(-dy, dh) * 180 / Math.PI - 180);
							break;
						case 'to_drone': //player will look at the drone position
							dx = newlocation.x - drona.getBlock().getX() - 0.5;
							dy = newlocation.y + 1 - drona.getBlock().getY();
							dz = newlocation.z - drona.getBlock().getZ() - 0.5;
							dh = Math.sqrt(dx * dx + dz * dz);
							newlocation.setYaw(Math.atan2(-dx, dz) * 180 / Math.PI - 180);
							newlocation.setPitch(- Math.atan2(-dy, dh) * 180 / Math.PI);
							break;					
						}
					console.log("final yaw: " + newlocation.getYaw());
					teleport (player, newlocation);
				}
			} );
			break;   
			
    	case 'moveDrone':
			switch(cmd[1]){	
				case 'reset':
					if (utils.getMousePos(targetPlayer)){
						droneLocation = utils.getMousePos(targetPlayer); //takes the position of the block the player is looking at
						droneLocation.setYaw(targetPlayer.location.getYaw()); //keeps the orientation of the player
						drona = new Drone (droneLocation);
						}
					else{
						drona = new Drone (targetPlayer.location);
						}
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
			currentBlock = drona.getBlock();
			scratchReturn(currentBlock, 'ok', ip); //updates values for current block to be read by Scratch
			break;

    }   
};



function scratchReturn(block, result, ip){ //updates values for current block to be read by Scratch

	if (block != null)
		http.request( scratchReturnAddress + 'drone/' + block.typeId + '/' + block.data + '/' + block.getX() + '/' + block.getY() + '/' + block.getZ() + '/' + result + '/' +ip, function(responseCode, responseBody){
			console.log( responseBody );});
	else
		http.request( scratchReturnAddress + 'drone/-1/-1/-1/-1/-1/' + result + '/' +ip, function(responseCode, responseBody){
			console.log( responseBody );});
}

function scratchUpdatePlayer(player, ip){ //updates values for current block to be read by Scratch

	http.request( scratchReturnAddress + 'player/' + Math.floor(player.location.x) + '/' + Math.floor(player.location.y) + '/' + Math.floor(player.location.z) + '/' +ip, function(responseCode, responseBody){
		console.log( responseBody );});

}

function playerMoveScratch(event){
	for(i = 0; i < scratchClients.length; i++){
		if (scratchClients[i].targetPlayer == event.player){
			scratchUpdatePlayer(event.player, scratchClients[i].ip);
			}
		}

}

exports.scratch = scratch;
events.playerMove(playerMoveScratch);