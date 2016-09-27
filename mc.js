// Require Node.js standard library function to spawn a child process
var spawn = require('child_process').spawn;

// Create a child process for the Minecraft server using the same java process
// invocation we used manually before
var minecraftServerProcess = spawn('java', [
    '-Xmx1024M',
    '-Xms1024M',
    '-jar',
    'minecraft_server_Spigot.jar',
    'nogui'] );

// Listen for events coming from the minecraft server process - in this case,
// just log out messages coming from the server
function log(data) {
    process.stdout.write(data.toString());
}
minecraftServerProcess.stdout.on('data', log);
minecraftServerProcess.stderr.on('data', log);


var http = require("http");

scratchResponse=[];  //stores the IP and current block values in MC for each Scratch client: 

http.createServer(function(request, response) { //communicates with Scratch extension on port 8088
var ip = request.connection.remoteAddress.slice(7);

if (request.url!="/poll"){ //commands from Scratch - URL format is /command/first_param/second_param/../last_param/
	
	var command=request.url.toString().slice(1);
	minecraftServerProcess.stdin.write('js scratch("' + command + '","' + ip + '")' + '\n');
	response.end();
	
	if (request.url=="/reset_all"){ //end of Scratch session		
		position=-1;
		for(i=0;i<scratchResponse.length; i++){
			if (scratchResponse[i].ip==ip){
				position=i;				
				}
			}
		if (position>-1) scratchResponse.splice(position,1);
		console.log('Scratch client on IP: ' + ip + ' disconnected. Remaining ' + scratchResponse.length + ' connections.');
		}	
  }
else{ //polling by Scratch
	bltype = -1;
	bldata = -1;
	result = -1;
	
	for(i=0;i<scratchResponse.length; i++){
		if (scratchResponse[i].ip==ip){
			bltype=scratchResponse[i].bltype;
			bldata=scratchResponse[i].bldata;
			result=scratchResponse[i].result;
		}
	}

	response.write("blockType " + bltype + "\nblockData "+bldata + "\nresult " + result);
	response.end();

	}
}).listen(8088);

http.createServer(function(request, response) {  //receives updates from Minecraft server on port 8089 - URL format is /blockType/blockData/IP/
params=request.url.toString().slice(1).split("/");
console.log("update information received: " + request.url.toString().slice(1));
ip=params[3];

found=0;
for (i=0; i < scratchResponse.length;i++){
    if(scratchResponse[i].ip==ip){
        scratchResponse[i].bltype=params[0];
        scratchResponse[i].bldata=params[1];
        scratchResponse[i].result=params[2];
        found=1;
    }
}
if (!found)
    scratchResponse.push({bltype:params[0], bldata: params[1], result: params[2], ip:params[3]});

response.write('ip'+(found?' found':' added to list'));
response.end();

}).listen(8089);
