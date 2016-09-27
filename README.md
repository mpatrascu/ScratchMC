Connecting Scratch to Minecraft using Scriptcraft and Node.js

__1. Needed applications__

__1.1 On the server side__

__1.1.1 Spigot MC server__

You have to download BuildTools.jar from https://hub.spigotmc.org/jenkins/job/BuildTools/ and the to follow the instructions from https://www.spigotmc.org/wiki/buildtools/. Basically you will run this command (not double click on the downloaded file)
	
	java -jar BuildTools.jar

and after a while you will find in the same folder __craftbukkit-1.xx.jar__ and __spigot-1.xx.jar__. When writing this, the most recent version was 1.10, so I used the file __spigot-1.10.jar__.

The next steps are described at https://www.spigotmc.org/wiki/spigot-installation/. Follow them and make sure the server works.

__1.1.2 Scriptcraft__

Download scriptcraft.jar from http://scriptcraftjs.org/download/latest/ and copy it in the Minecraft server \plugins subfolder.
Restart the server and you will see something similiar to this in the output console:

	[14:04:25 INFO]: [scriptcraft] Enabling scriptcraft v3.1.12-2015-12-30

Scriptcraft will create its own folder structure under the Minecraft server main folder.

__1.1.3 Node.js__

Download the pre-built installer for your OS from https://nodejs.org/en/download/, launch it and follow the on-screen instructions.

__1.2 On the client side__
__1.2.1 Scratch 2.0 offline__

Download it from https://scratch.mit.edu/scratch2download/  (start by installing Adobe Air if it isn't already installed on your computer)

__1.2.2 Minecraft client__

Install the PC/Mac version from https://minecraft.net/en/download/. You must have a paid account in order to use it.

__2 Making it all work together__

Following the installation instructions for MC server you should have created a script or a batch file (depending on the OS) containing a line similar to this (I didn't use the other parameters):

	java -Xms512M -Xmx1G -jar spigot.jar

Instead of using this script to launch the server, you must download __mc.js__ file and copy it in the same folder, taking care to modify it according to your previous parameters for spawning the new java process. You invoke this file by typing

	>node mc.js

It will launch Minecraft server as a child process and will listen to ports 8088 and 8089. On port 8088 it receives commands and poll requests from Scratch and on port 8089 it receives information from MC server - current block values and result of some operations. You can leave the ports unchanged, or you can choose other values, but you will need to also update the following two files.

In the Scriptcraft plugins folder you have to copy the file __scratch.js__ which interprets commands passed by the Node.js script.

It keeps track of IPs for each client so you can have multiple connections from different computers. You can leave 127.0.0.1 for _scratchReturnAddress_ as the processes run on the same machine, and the port must be the same as the second one from __mc.js__ (8089).

On the client you will have to use __MCextension.json__ file for Scratch. The port must be the same as the first port defined in __mc.js__ (8088), but you need to update the IP address to match the server's address if you are using a separate computer. You should also update the default player, replacing playerName with the one you will use most frequently.


Pressing Shift and clicking File in Scratch will provide access to Import experimental HTTP extension (the last option in the list) for opening the __MCextension.json__ file.

By doing this, in the More blocks category you will have access to new blocks and variables. Before issuing any other command you should use _Connect User_ and the name of a player with an open MC session on the server as a parameter. When connected, it will post a message in Minecraft chat and will automatically create a drone at player's position, which will execute all the commands.

The new blocks defined in MCextension.json file try to replicate some of the functions that Walter Higgins defined in the drone plugin. For short descriptions of those functions and needed parameters please check https://github.com/walterhiggins/ScriptCraft/blob/master/docs/API-Reference.md#drone-plugin.

The _box_, _prism_, _cylinder_ and _rainbow_ are used to create solid structures, while _box0_, _prism0_ and  _cylinder0_  are for hollow structures - just walls without ceiling and floor. You can specify the material - block type and block data - and the dimensions.
_Stairs_, _bed_, _torch_ and _wallsign_ are used to place specific elements which must take into account player's orientation.
The _move drone_ function tells the drone where to move. The last drone position will be remembered so if you want to start again from the player's position, you have to use _move drone reset_ or _Connect user_ again.
_Summon_ is used to spawn the mobs from the predefined list. You can update this list for new mobs.

At the end of the file there are some variables updated by the Minecraft server:  _blockType_ and _blockData_ contain information about the block where the drone is, while _result_ contains the result of last executed command.
If you want to check the values for _blockType_ and _blockData_, you should insert a delay of at least 0.2 secs (using standard Scratch block) after the last move drone instruction before using them.

__3 Known issues__

Sometimes commands are not executed in order, especially when the server is busy. It's better to avoid launching command sequences from more than one computer at the same time, although it could work.
_move drone save_chkpt_ and _move drone goto_chkpt_ don't work yet.

__4 Future developments__

Hunting for bugs, adding new functions, showing the equivalent Javascript commands on screen.
