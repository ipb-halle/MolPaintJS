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
 *
 * This build script requires the following non-standard packages:
 *  - yargs
 *  - pegjs
 *  - terser
 */

"use strict"; 

const yargs = require('yargs');
var fs = require('fs');
var pathInfo = require('path');
var tar = require('tar');
var util = require('util');
var peg = require("pegjs");
var { minify } = require("terser");

const GITHUB_RELEASE_URL = 'https://github.com/ipb-halle/MolPaintJS/releases/latest/download';
const BUILD_DIR = 'molpaintjs';
const DIST_FILE = 'molpaintjs.tar.gz';
var entryPoint = "MolPaintJS.js";


function readResource(path, dirent, header, encoding) {
    var code = '"' + dirent.name + '":"' + header;
    if (encoding == 'base64') {
        code += fs.readFileSync(pathInfo.join(path, dirent.name), {'encoding': encoding});
    } else {
        code += encodeURI(fs.readFileSync(pathInfo.join(path, dirent.name), {'encoding': encoding}));
    }
    code += '",\n';
    return code;
}

function readPEG(path, dirent) {
    return peg.generate(
                fs.readFileSync(pathInfo.join(path, dirent.name), {'encoding':'UTF-8'}),
                {'output':'source', 'format':'globals', 'exportVar':'MDLParser'});
}

/*
 * recursively read code files, compile them (PEGJS rules only),
 * and concatenate them. Returns a single code string.
 */
function readCode(path) {
    var code = '';
    var entryCode = '';
    var resources = '';

    fs.readdirSync(path, {'withFileTypes': true})
            .forEach(dirent => {
        if (dirent.isDirectory()) {
            var result = readCode(pathInfo.join(path, dirent.name));
            resources += result[0];
            code += result[1];
            entryCode += result[2];
        } else {
            if (dirent.name == entryPoint) {
                entryCode = fs.readFileSync(pathInfo.join(path, dirent.name), {'encoding':'UTF-8'});
            } else {
                if (dirent.name.match(/\.pegjs$/)) {
                    code += ';\n';  // dirty fix for missing semicolon
                    code += readPEG(path, dirent);
                } 
                if (dirent.name.match(/\.js$/)) {
                    code += fs.readFileSync(pathInfo.join(path, dirent.name), {'encoding':'UTF-8'});
                }
                if (dirent.name.match(/\.png$/)) {
                    resources += readResource(path, dirent, 'data:;base64,', 'base64');
                }
                if (dirent.name.match(/\.css$/)) {
                    resources += readResource(path, dirent, 'data:text/css;base64,', 'base64');
                }
                if (dirent.name.match(/\.mol$/)) {
                    resources += readResource(path, dirent, '', 'base64');
                }
                if (dirent.name.match(/\.html$/)) {
                    resources += readResource(path, dirent, 'data:text/html;charset=utf-8,', 'UTF-8');
                }
            }
        }
    });
    return [resources, code, entryCode];
}

async function minifyCode(code) {
    var code = await minify(code, {compress:true, mangle:true} );
    return code;
}

async function compile(src, dest, compress) {
    var result = readCode(src);
    var code = 'var molPaintJS_resources = {\n'
            + result[0] + '\n};\n'
            + result[1]
            + result[2];

    if (compress == true) {
        code = (await minifyCode(code)).code;
    }
//  console.log(util.inspect(code, {showHidden: false, depth: null}));
    fs.writeFile(dest, code, err => {
        if (err) throw err;
    });
}

function copyTemplate(src, dest, replacements) {
    fs.mkdirSync(dest, {'recursive':true, });
    fs.readdirSync(src, {'withFileTypes': true})
            .forEach(dirent => {
        if (dirent.isDirectory()) {
            var newDest = pathInfo.join(dest, dirent.name);
            fs.mkdirSync(newDest, {'recursive':true, });
            copyTemplate(pathInfo.join(src, dirent.name), newDest, replacements);
        } else {
            if (replacements[dirent.name] != null) {
                var content = fs.readFileSync(pathInfo.join(src, dirent.name), {'encoding':'UTF-8'});
                replacements[dirent.name].forEach(entry => {
                    content = content.replace(entry.key, entry.replacement);
                });
                fs.writeFileSync(pathInfo.join(dest, dirent.name), content, err => {
                    if (err) throw err;
                });
            } else {
                fs.copyFileSync(pathInfo.join(src, dirent.name),
                    pathInfo.join(dest, dirent.name));
            }
        }
    });
}

function copyToplevelFiles(dest) {
    for(var name of ['NOTICE', 'LICENSE', 'README.md']) {
        fs.copyFileSync(
                pathInfo.join(__dirname, name),
                pathInfo.join(dest, name));
    }
}

function build(release, compress) {

    var replacements = { 'index.html': [ { 'key':'%MOLPAINTJS%', 'replacement':'js' }, ], };

    copyTemplate(pathInfo.join(__dirname , 'template'),
        pathInfo.join(__dirname, BUILD_DIR),
        replacements);

    copyToplevelFiles(pathInfo.join(__dirname , BUILD_DIR));

    if (release) {
        replacements['index.html'] = [ {'key':'%MOLPAINTJS%', 'replacement':GITHUB_RELEASE_URL }, ];
        copyTemplate(pathInfo.join(__dirname , 'template'),
            pathInfo.join(__dirname, 'docs'),
            replacements);

        copyToplevelFiles(pathInfo.join(__dirname , 'docs'));
    }
        
    fs.mkdirSync(pathInfo.join(__dirname, BUILD_DIR, 'js'), {'recursive':true, });
    // always compress on release
    compile(pathInfo.join(__dirname , 'src'),
        pathInfo.join(__dirname, BUILD_DIR, 'js', 'molpaint.js'),
        release | compress);

    tar.c({
        file: pathInfo.join(__dirname, DIST_FILE), 
        gzip:true, },
        [ BUILD_DIR, ]);
}

const argv = yargs
    .option('nocompress', {
        alias: 'n',
        description: 'Do not minify / compress the output',
        type: 'boolean', })
    .option('release', {
        alias: 'r',
        description: 'Build for release on GitHub / GitHub Pages',
        type: 'boolean', })
    .help().alias('help', 'h')
    .argv;


build(argv.release, ! argv.nocompress);


