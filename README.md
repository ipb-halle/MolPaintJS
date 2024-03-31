![Logo](docs/img/molpaintjs.png?raw=true)

# MolPaintJS
**Simple HTML5 molecule editor and viewer plugin**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Note
This software is far from feature complete, cultivates a free interpretation of standards and an idiosyncratic coding style. This is nothing to be proud of - please be lenient. We're willing to improve.

MolPaintJS was originally started within the [Leibniz Bioactives Cloud](https://www.leibniz-wirkstoffe.de/projects/lbac_project/) project.

Test drive MolPaintJS on [GitHub.io](https://ipb-halle.github.io/MolPaintJS).

## Installation / Use
* In principle, only the JavaScript file `molpaint.js` is needed. You can obtain it from a recent release of MolPaintJS. The script will create its own namespace `molPaintJS`. Preferably, the script should be loaded in the page header. 

```html
<script type="text/javascript" src="PLUGIN_DIR/js/molpaint.js"></script>
```

* For each editor or viewer you need to include the follwing code snippet. You may have multiple instances on your page.

```html
<!-- only if you want debugging 
<div id="molDebug></div> 
-->
<div id="mol"></div>
<script type="text/javascript">
  molPaintJS.newContext("mol", {sizeX: 400, sizeY: 400, debugId: "molDebug"})
    .init()
    .setDrawing(... MDL MOL string ...);
</script>
```
* For additional comfort, you may want to provide additional files (e.g. additional templates, help text, example files, etc.). In this case, please download the compressed tar archive (`molpaintjs.tar.gz`) from a recent release. It contains everything needed to set up a small test environment.

* To build your own copy, check out the sources of MolPaintJS and call `npm clean-install-test`. This will set up a complete environment in the directory `molpaintjs` directory. The `docs` directory is reserved for GitHub Pages (MolPaintJS Playground). GitHub pages builds on the latest release of MolPaintJS, which may be incompatible with the master branch. 


## Features
* Pure HTML5 / JavaScript
* Import and export of chemical structures in MDL MOL format (V2000 and V3000), either via JavaScript method calls or copy / paste from clipboard. Newer releases of ChemDraw support copying as MDL mol string and do not require saving of mol files.
* Configurable set of template molecules
* Possibility to define electronic state (singlet, doublet, triplet) and the isotopic composition of a compound

Currently the software concentrates on small molecules. Many other features (e.g. Query flags, Rgroup, Sgroup, polymers, reactions, etc. pp.) are missing. Some convenience features and usability improvements are planned.

## Configuration
### Changing the set of templates
To provide a different set of template molecules, you need to provide URLs to template mol files and icons. You can then configure the list of available templates in the header section of the page, e.g.:
```javascript
  molPaintJS.addTemplates([ 
        {key:'Ala', molURL:'templates/alanine.mol', iconURL:'templates/alanine.png'}},
        {key:'Asn', molURL:'templates/asparagine.mol', iconURL:'templates/asparagine.png'}, 
        ...
    ]);
  molPaintJS.setTemplates(['Ala', 'Asn', ...]);
```
### Change Listener
A change listener can be registered to an instance of MolPaintJS. The method will be invoked each time, the content of the plugin is rendered.

### Properties
All properties can be specified either on the global level (`molPaintJS.setProperty(prop, val);`) or on the instance level (`newContext(...)`). Instance level properties override global properties. However, some properties make little sense on the instance level (e.g. **FontAwesomePath**).

* **bondLength** standard bond length (default 1.5)
* **distMax** selection radius for atom or bond selection (default 0.1)
* **debugId** id of a DOM element (preferably `<div>`) to receive debug messages
* **fontFamily** font family for atom labels etc. (default "SansSerif")
* **fontSize** font size (default 16)
* **FontAwesomePath** path to FontAwesome (default "assets/fontawesome"), set to `null` if your project already provides FontAwesome
* **iconSize** the size of the icons (default 32)
* **molScaleDefault** scaling factor (default 33); unit is pixels per Angstrom
* **sizeX** the width of the display area (default 400)
* **sizeY** the height of the display area (default 400)
* **viewer** just render a viewer without possibility to interact


## Licensing
    Copyright 2017-2023 Leibniz-Institut f. Pflanzenbiochemie
     
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
