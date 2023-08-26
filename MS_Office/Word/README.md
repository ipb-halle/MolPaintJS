# MolPaintJS Add-In for Microsoft Word

*NOTE: This is an early preview and work in progress*

This add-in allows you to draw chemical structures in Microsoft Word and add them as a PNG picture. Editing the picture is currently not possible. Our plans for future enhancements are:

* enable editing an existing 'chemical' picture based on information embedded in the picture
* use the more versatile SVG as graphics format
* have real icons
* enhance MolPaintJS itself (because many functions are missing, incomplete or broken)

[Screenshot](screenshot.png?raw=true)

## How to test drive
Currently (and in the forseeable future) the MolPaintJS add-in will be available only in development mode. You need a developer PC with Microsoft Office, Git and Node/JS. Then do the following steps:

* check out the repository  (<code>git clone https://github.com/ipb-halle/MolPaintJS.git<code>)
* build the MolPaintJS web plugin (usually <code>node build.js</code>)
* open the <code>MS_Office/Word/</code> directory in an administrative shell
* run <code>npm start</code>
