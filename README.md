Connecting Scratch to Minecraft using Scriptcraft and Node.js

1. Needed applications

1.1 On the server side:
1.1.1 Spigot MC server

You have to download BuildTools.jar from https://hub.spigotmc.org/jenkins/job/BuildTools/ and the to follow the instructions from https://www.spigotmc.org/wiki/buildtools/. Basically you have to run this command (not to double click on the downloaded file)

java -jar BuildTools.jar

and after a while you will find in the same folder craftbukkit-1.xx.jar and spigot-1.xx.jar. When writing this, latest version is 1.10, so I used the file spigot-1.10.jar.

The next steps are described at https://www.spigotmc.org/wiki/spigot-installation/. Follow them and make sure the server works.

1.1.2 Scriptcraft
Download scriptcraft.jar from http://scriptcraftjs.org/download/latest/ and copy it in the Minecraft server \plugins subfolder.
Restart the server and you will see something similiar to this in the output console:

[14:04:25 INFO]: [scriptcraft] Enabling scriptcraft v3.1.12-2015-12-30

Scriptcraft will create its own folder structure under the Minecraft server main folder.

1.1.3 Node.js
Download the pre-built installer for your OS from https://nodejs.org/en/download/, launch it and follow the on-screen instructions.

1.2 On the client side
1.2.1 Scratch 2.0 offline
Download it from https://scratch.mit.edu/scratch2download/  (start by installing Adobe Air if it isn't already installed on your computer)

1.2.2 Minecraft client
Install the PC/Mac version from https://minecraft.net/en/download/. You must have a paid account in order to use it.

2 Making it all work together

Following the installation instructions for MC server you should have created a script or a batch file (depending on the OS) containing a line similar to this (I didn't use the other parameters):

java -Xms512M -Xmx1G -jar spigot.jar

Instead of using this script to launch the server, you must download mc.js file and copy it in the same folder, taking care to modify it according to your previous parameters for spawning the new java process.


You invoke this file by typing

>node mc.js

It will launch Minecraft server as a child process and will listen to ports 8088 and 8089. On port 8088 it receives commands and poll requests from Scratch and on port 8089 it receives information from MC server - current block values and result of some operations. You can leave the ports unchanged, or you can choose other values, but you will need to also update the following two files.

In the Scriptcraft plugins folder you have to copy the file scratch.js which interprets commands passed by the Node.js script.

It keeps track of IPs for each client so you can have multiple connections from different computers. You can leave 127.0.0.1 for scratchReturnAddress as the processes run on the same machine, and the port must be the same as the second one from mc.js (8089).

On the client you will have to use MCextension.json file for Scratch. The port must be the same as the first port defined in mc.js (8088), but you need to update the IP address to match the server's address if you are using a separate computer. You should also update the default player, replacing playerName with the one you will use most frequently.


Pressing Shift and clicking File in Scratch will provide access to Import experimental HTTP extension (the last option in the list) for opening the MCextension.json file.

By doing this, in the More blocks category you will have access to new blocks and variables. Before issuing any other command you should use Connect User and the name of a player with an open MC session on the server as a parameter. When connected, it will put a message in Minecraft chat and will automatically create a drone at player's position, which will execute all the commands.

The new blocks defined in MCextension.json file try to replicate some of the functions that Walter Higgins defined in the drone plugin. For short descriptions of those functions and needed parameters please check https://github.com/walterhiggins/ScriptCraft/blob/master/docs/API-Reference.md#drone-plugin.

The box, prism, cylinder and rainbow are used to create solid structures, while box0, prism0 and  cylinder0  are for hollow structures - just walls without ceiling and floor.You can specify the material - block type and block data - and the dimensions.
Stairs, bed, torch and wallsign are used to place specific elements which must take into account player's orientation.
The move drone function tells the drone where to move. The last drone position will be remembered so if you want to start again from the player's position, you have to use move drone reset or Connect user again.
Summon is used to spawn the mobs from the predefined list. You can update this list for new mobs.

At the end of the file there are some variables updated by the Minecraft server:  blockType and blockData contain information about the block where the drone is, while result contains the result of last executed command.
If you want to check the values for blockType and blockData, you should insert a delay  of at least 0.2 secs (using standard Scratch block) after the last move drone instruction before using them.

3 Known issues
Sometimes commands are not executed in order, especially when the server is busy. It's better to avoid launching command sequences from more than one computer at the same time, although it could work.
move drone save_chkpt and move drone goto_chkpt don't work yet.

4 Future developments

Hunting for bugs, adding new functions, showing the equivalent Javascript commands on screen.