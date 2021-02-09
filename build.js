/*
 * MolPaintJS
 * Copyright 2021 Leibniz-Institut f. Pflanzenbiochemie 
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *  
 */

"use strict"; 

var fs = require('fs');
var pathInfo = require('path');
var util = require('util');
var peg = require("pegjs");
var { minify } = require("terser");

var entryPoint = "zMolPaintJS.js";

/*
 * recursively read code files, compile them (PEGJS rules only),
 * and concatenate them. Returns a single code string.
 */
function readCode(path) {
    var code = '';
    var entryCode = '';

    fs.readdirSync(path, {'withFileTypes': true})
            .forEach(dirent => {
        if (dirent.isDirectory()) {
            code += readCode(path + pathInfo.sep + dirent.name);
        } else {
            if (dirent.name == entryPoint) {
                entryCode = fs.readFileSync(path + pathInfo.sep + dirent.name, {'encoding':'UTF-8'});
            } else {
                if (dirent.name.match(/\.pegjs$/)) {
                    code += peg.generate(
                        fs.readFileSync(path + pathInfo.sep + dirent.name, {'encoding':'UTF-8'}), 
                        {'output':'source', 'format':'globals', 'exportVar':'MDLParser'});
                } else if (dirent.name.match(/\.js$/)) {
                    code += fs.readFileSync(path + pathInfo.sep + dirent.name, {'encoding':'UTF-8'});
                }
            }
        }
    });
    return code + entryCode;
}


async function minifyCode(code) {
    var code = await minify(code, {compress:true, mangle:true} );
    return code;
}


async function build(src, dest, compress) {
    var code = readCode(src);
    if (compress == true) {
        code = (await minifyCode(code)).code;
    }
//  console.log(util.inspect(code, {showHidden: false, depth: null}));
    fs.writeFile(dest, code, err => {
        if (err) throw err;
    });
}

build('./js', 'docs/js/molpaint.js', true);

