// Require Node.js standard library function to spawn a child process
var spawn = require('child_process').spawn;

// Create a child process for the Minecraft server using the same java process
// invocation we used manually before
var minecraftServerProcess = spawn('java', [
    '-Xmx4096M',
    '-Xms1024M',
    '-jar',
    'spigot-1.10.jar',
    'nogui'] );

// Listen for events coming from the minecraft server process - in this case,
// just log out messages coming from the server
function log(data) {
    process.stdout.write(data.toString());
}
minecraftServerProcess.stdout.on('data', log);
minecraftServerProcess.stderr.on('data', log);

//redirect keyboard input to Minecraft server
var stdin = process.openStdin();
stdin.on('data', function(command) {
    if (command !== null) {
        minecraftServerProcess.stdin.write(command + '\n');
    }
    else console.log("no command");
});

var http = require("http");

scratchResponse=[];  //stores the IP and current block values in MC for each Scratch client: 

http.createServer(function(request, response) { //communicates with Scratch extension on port 8088
var ip = request.connection.remoteAddress.slice(7);

if (request.url != "/poll"){ //commands from Scratch - URL format is /command/first_param/second_param/../last_param/
	
	var command=request.url.toString().slice(1);
	minecraftServerProcess.stdin.write('js scratch("' + command + '","' + ip + '")' + '\n');
	response.end();
	
	
	if (request.url == "/reset_all"){ //end of Scratch session		
		position = -1;
		for(i=0;i<scratchResponse.length; i++){
			if (scratchResponse[i].ip == ip){
				position = i;				
				}
			}
		if (position > -1) scratchResponse.splice(position, 1);
		console.log('Scratch client on IP: ' + ip + ' disconnected. Remaining ' + scratchResponse.length + ' connections.');
		}	
  }
else{ //polling by Scratch
	bltype = -1;
	bldata = -1;
	result = -1;
	drone = {x : -1,
			 y : -1,
			 z : -1};
	player = {x : -1,
			 y : -1,
			 z : -1};
	
	for(i=0;i<scratchResponse.length; i++){
		if (scratchResponse[i].ip == ip){
			bltype = scratchResponse[i].bltype;
			bldata = scratchResponse[i].bldata;
			drone = scratchResponse[i].drone;
			player = scratchResponse[i].player;
			result = scratchResponse[i].result;
		}
	}

	
	response.write("blockType " + bltype + "\nblockData " +  bldata);
	response.write("\nposition/x/drone " + drone.x + "\nposition/y/drone " + drone.y + "\nposition/z/drone " + drone.z);
	response.write("\nposition/x/player " +  player.x + "\nposition/y/player " + player.y + "\nposition/z/player " + player.z);
	response.write("\nresult " + result);
	response.end()

	}
}).listen(8088);

http.createServer(function(request, response) {  //receives updates from Minecraft server on port 8089 
	var	found=0;
	var params = request.url.toString().slice(1).split("/");
	console.log("update information received: " + request.url.toString().slice(1));
	
	switch(params[0]){
		case 'init': //received at start and when using /js refresh()
			while (scratchResponse.length > 0 )
				scratchResponse.pop();
			response.write('cleared list of clients');
			response.end();
			return;
			break;
		case 'drone': 
			ip = params[7];
			break;
		case 'player': 
			ip = params[4];
			break;
		}
	
	for (i = 0; i < scratchResponse.length; i++){
		if(scratchResponse[i].ip == ip){
			found = 1;
			switch(params[0]){
				case 'drone': 
					scratchResponse[i].bltype = params[1];
					scratchResponse[i].bldata = params[2];
					scratchResponse[i].drone.x = params[3];
					scratchResponse[i].drone.y = params[4];
					scratchResponse[i].drone.z = params[5];
					scratchResponse[i].result = params[6];
					break;
				case 'player':
					scratchResponse[i].player.x = params[1];
					scratchResponse[i].player.y = params[2];
					scratchResponse[i].player.z = params[3];
					break;		
			}
		}
	}
	if (!found){
		switch(params[0]){
				case 'drone': 
					scratchResponse.push({bltype: params[1],
										bldata: params[2],
										drone: {x: params[3], y: params[4], z: params[5]},
										player: {x: null, y: null, z: null},
										result: params[6],
										ip: params[7]});
					break;
				case 'player':
					scratchResponse.push({bltype:-1,
										bldata: -1,
										drone: {x: null, y: null, z: null},
										player: {x: params[1], y: params[2], z: params[3]},
										result: params[6],
										ip: params[7]});
					break;
		}
	}
	response.write('IP ' + ip + (found ? ' found' : ' added to list'));
	response.end();

}).listen(8089);
