var Drone = require('/drone/drone').Drone
var foreach = require('utils').foreach

var JavaString = java.lang.String;
var http = require('http');
var utils = require('utils');

var scratchReturnAddress = 'http://127.0.0.1:8089/';
    
scratchClients=[];

function scratch(command,ip){
	var players = utils.players();	
    var cmd=command.split("/");
    var index=-1;	
	var drona='';

	for(i=0;i<scratchClients.length;i++){
		if (scratchClients[i].ip==ip){
			console.log("target player: "+scratchClients[i].playerName);
			index=i;
			drona=scratchClients[i].drone;
			targetPlayer=scratchClients[i].targetPlayer;
			}
		}
	
	if(cmd[0]=='connect'){
    		console.log('trying to connect to player ' + cmd[1]);
    		playerName=cmd[1];
    		for (pl in players){  //use server.getPlayer(playerName)
    			if (players[pl].name.toLowerCase()==playerName.toLowerCase()){
    				targetPlayer=players[pl];
    				drona=new Drone (targetPlayer.location);
    				if (index==-1){ //new player
    					scratchClients.push({playerName:playerName, targetPlayer:targetPlayer,drone:drona, ip:ip});
    					index=scratchClients.length-1;
    					echo(targetPlayer, "Connected to Scratch client on IP "+ip);
    					}
    				else { //update existing player
    					scratchClients[index].playerName=playerName;
    					scratchClients[index].targetPlayer=targetPlayer;
    					scratchClients[index].drone=drona;
    					}
    				}
    			}   
    		if (index==-1) { //use of other command before connecting to any player
				console.log('Player not found');
				scratchReturn(-1, -1, 'player_not_found', ip); 
				return
				}	
			else { //return to Scratch current block
				bl=drona.getBlock();
				scratchReturn(bl.typeId, bl.data, 'connected', ip); //updates values for current block to be read by Scratch 	
				}
    		}    			
		
	if (index==-1) { //use of other command before connecting to any player
		console.log('No target player defined');
		scratchReturn(-1, -1, 'no_target_player', ip); 
		return
		}
	console.log("command received -" + cmd[0]+";");
	    switch(cmd[0]){    	
		case 'boxCommand':   
		case 'box':	
     			if(cmd[1]==64){
				drona.door(cmd[1]);
				}
			else
    				drona.box(''+cmd[1]+':'+parseInt(cmd[2]),parseInt(cmd[3]),parseInt(cmd[4]),parseInt(cmd[5]));    			
    		break;
		case 'box0':
		case 'box0Command':   			
    			drona.box0(''+cmd[1]+':'+parseInt(cmd[2]),parseInt(cmd[3]),parseInt(cmd[4]),parseInt(cmd[5]));  			
    		break;
			
		case 'cylinder':
    			drona.cylinder(''+cmd[1]+':'+parseInt(cmd[2]),parseInt(cmd[3]),parseInt(cmd[4]));  			
    		break;	
		case 'cylinder0':
    			drona.cylinder0(''+cmd[1]+':'+parseInt(cmd[2]),parseInt(cmd[3]),parseInt(cmd[4]));  			
    		break;				
			
		case 'prism':
    			drona.prism(''+cmd[1]+':'+parseInt(cmd[2]),parseInt(cmd[3]),parseInt(cmd[4]));  			
    		break;	
		case 'prism':
    			drona.prism(''+cmd[1]+':'+parseInt(cmd[2]),parseInt(cmd[3]),parseInt(cmd[4]));  			
    		break;			
    		    	
		case 'rainbow':
    			drona.rainbow(parseInt(cmd[1]));  			
    		break;	
			
		case 'bed':
    			drona.bed();  			
    		break;
		
		case 'torch':
    			drona.hangtorch();  			
    		break;

		case 'stairs':
    			drona.stairs(parseInt(cmd[1]),parseInt(cmd[3]),parseInt(cmd[4]));  			
    		break;			

		case 'wallsign':
			textArray=[];
			for (i=1; i<5; i++)
				textArray.push(cmd[i]);
    		drona.wallsign(textArray);  			
    		break;	
			
    		case 'summon':   //summons mobs using Scriptcraft predefined drone's summon method
    		console.log("summon "+cmd[1]);
			drona.spawn(cmd[1]) ;   		
    		break ;
			
    		
    		case 'moveDrone':
			console.log("before moveDrone: " + parseInt(10*drona.x)/10 + ":" + parseInt(10*drona.y)/10 + ":" + parseInt(10*drona.z)/10);
			switch(cmd[1]){	
				case 'reset':
    				drona=new Drone (targetPlayer.location);
    				scratchClients[index].drone=drona;   			
    				break;
				case 'up':
					drona.up(parseInt(cmd[2]));    				
					break;
				case 'down':
					drona.down(parseInt(cmd[2])); 
					break;
				case 'left':
					drona.left(parseInt(cmd[2])); 
					break;
				case 'right':
					drona.right(parseInt(cmd[2])); 
					break;
				case 'fwd':
					drona.fwd(parseInt(cmd[2])); 
					break;
				case 'back':
					drona.back(parseInt(cmd[2])); 
					break;
				case 'turn':
					drona.turn(parseInt(cmd[2])); 
					break;
				case 'save_chkpt':
					drona.chkpt(cmd[2]); 
					break;
				case 'goto_chkpt':
					drona.move(cmd[2]); 
					break;
    			}
			//console.log("after moveDrone: " + parseInt(100*drona.x)/100 + ":" + parseInt(100*drona.y)/100 + ":" + parseInt(100*drona.z)/100);    		
    		bl=drona.getBlock();
		scratchReturn(bl.typeId, bl.data, 'ok', ip); //updates values for current block to be read by Scratch
		break;
    }   
};



function scratchReturn(bltype, bldata, result, ip){ //updates values for current block to be read by Scratch
	var http = require('http');
	http.request( scratchReturnAddress + bltype + '/' + bldata + '/' + result + '/' +ip,function(responseCode, responseBody){console.log(  responseBody );});
}

exports.scratch=scratch
