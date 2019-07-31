# MolPaintJS
**Simple HTML5 molecule editor and viewer plugin**

## Note
This software is far from feature complete, cultivates a free interpretation of standards and an idiosyncratic coding style. This is nothing to be proud of - please be lenient. We're willing to improve.

MolPaintJS was originally started within the [Leibniz Bioactives Cloud](https://www.leibniz-wirkstoffe.de/projects/lbac_project/) project.

## Installation / Use
* Check out the sources (e.g. `git clone https://github.com/ipb-halle/MolPaintJS`)
* Make a binary distribution by calling `install.sh`
* Create an empty directory (hereafter referenced as PLUGIN_DIR) on you web server and extract the binary distribution to it (e.g. `tar -xzf molpaintjs.tar.gz`)
* All pages using the plugin must include the following code snippet (preferably in the page header section): 

```html
<link type="text/css" rel="stylesheet" href="PLUGIN_DIR/css/styles.css"/>
<script type="text/javascript" src="PLUGIN_DIR/js/molpaint.js"></script>
<script type="text/javascript">
    var molpaintjs = new MolPaintJS();
</script>
```

* For each editor or viewer you need to include the follwing code snippet. You may have multiple instances on your page.

```html
<!-- only if you want debugging 
<div id="molDebug></div> 
-->
<div id="mol"></div>
<script type="text/javascript">
  molpaintjs.newContext("mol", {iconSize: 32, ..., debugId: "molDebug"})
   .setMolecule(... MDL MOL v2000 string ...).init();
</script>
```
 
* Please see `index.html` for a complete example

## Features
* Pure HTML5 / JavaScript
* Import and export of chemical structures in MDL MOL v2000 format, either via JavaScript method calls or copy / paste. The copy / paste feature is especially useful in conjunction with newer releases of ChemDraw.
* Configurable set of template molecules
* Possibility to define electronic state (singlet, doublet, triplet) and the isotopic composition of a compound

Currently the software concentrates on small molecules. Many other features (e.g. Query flags, Rgroup, Sgroup, polymers, reactions, etc. pp.) are missing. Some convenience features and usability improvements (e.g. rotation of molecules) are planned.

## Licensing
    Copyright 2017-2019 Leibniz-Institut f. Pflanzenbiochemie 
     
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

This software uses code from other projects. Please see the NOTICE file for details.

## Literature
* Accelrys Documentation of the CTFile Format
* Brecher J., Pure Appl. Chem., 2006, Vol. 78, No. 10, 1897ff; doi:10.1351/pac200678101897 (graphical representation of stereochemical configuration)
