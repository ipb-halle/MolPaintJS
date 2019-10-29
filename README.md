![Logo](docs/img/molpaintjs.png?raw=true)

# MolPaintJS
**Simple HTML5 molecule editor and viewer plugin**

## Note
This software is far from feature complete, cultivates a free interpretation of standards and an idiosyncratic coding style. This is nothing to be proud of - please be lenient. We're willing to improve.

MolPaintJS was originally started within the [Leibniz Bioactives Cloud](https://www.leibniz-wirkstoffe.de/projects/lbac_project/) project.

Test drive MolPaintJS on [GitHub.io](https://ipb-halle.github.io/MolPaintJS).

## Installation / Use
* Copy the content of the `docs/` directory to an empty directory (hereafter referenced as PLUGIN_DIR) on your web server
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
  molpaintjs.newContext("mol", {installPath: "PLUGIN_DIR", ..., debugId: "molDebug"})
   .setMolecule(... MDL MOL v2000 string ...).init();
</script>
```
 
* Please see `docs/index.html` for a complete example
* For development, check out the sources, make your modifications and call the `install.sh` script to rebuild the `docs` directory


## Features
* Pure HTML5 / JavaScript
* Import and export of chemical structures in MDL MOL v2000 format, either via JavaScript method calls or copy / paste. The copy / paste feature is especially useful in conjunction with newer releases of ChemDraw.
* Configurable set of template molecules
* Possibility to define electronic state (singlet, doublet, triplet) and the isotopic composition of a compound

Currently the software concentrates on small molecules. Many other features (e.g. Query flags, Rgroup, Sgroup, polymers, reactions, etc. pp.) are missing. Some convenience features and usability improvements (e.g. rotation of molecules) are planned.

## Configuration
### Changing the set of templates
To provide a different set of template molecules, you need to place the MOL files in the `docs/templates/` folder and a corresponding icons in the `docs/img/` folder. You can then configure the list of available templates in the header section of the page, e.g.:
```javascript
  var molpaintjs = new MolPaintJS();
  molpaintjs.setTemplates({"glucose", "fructose", "galactose", "ribose"});
```
### Options
All options can be specified either on the global level (`new MolPaintJS({...options...})`) or on the instance level (`newContext(...)`). Instance level options override global options. However, some options make little sense on the instance level (e.g. **installPath**).

* **bondLength** standard bond length (default 1.5)
* **distMax** selection radius for atom or bond selection (default 0.1)
* **debugId** id of a DOM element (preferably `<div>`) to receive debug messages
* **fontFamily** font family for atom labels etc. (default "SansSerif")
* **fontSize** font size (default 16)
* **iconSize** the size of the icons (default 32)
* **installPath** the absolute or relative path where the plugin resides (above referenced as PLUGIN_DIR, default "") *NOTE: if* **installPath** *is not empty, it must end with a slash '/'.*
* **molScaleDefault** scaling factor (default 33); unit is pixels per Angstrom
* **sizeX** the width of the display area (default 400)
* **sizeY** the height of the display area (default 400)
* **viewer** just render a viewer without possibility to interact


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
