#!/bin/bash
#
#  MolPaintJS
#  Copyright 2017-2019 Leibniz-Institut f. Pflanzenbiochemie
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#
#===========================================================================
#
#  Creates a binary distribution of the plugin 
#  * concatenates all JavaScript files (in alphabetical order)
#  * copies all images, css files and templates
#  * copies documentation and licensing information etc.
#  * creates a compressed tar archive 
#
SRC=`dirname $0`
DEST=target
pushd $SRC

if [ x$1 = "xclean" ] ; then 
    echo "cleaning `pwd`/$DEST"
    rm -r $DEST
    exit 0
fi

echo "building software package ..."
mkdir -p $DEST/js

find $SRC/js -type f -name "*.js" | sort | xargs -l1 cat > $DEST/js/molpaint.js

mkdir -p $DEST/img
cp -r $SRC/img/*.png $DEST/img/

mkdir -p $DEST/css
cp $SRC/css/styles.css $DEST/css/styles.css

mkdir -p $DEST/templates
cp $SRC/templates/*.mol $DEST/templates/

for i in index.html LICENSE NOTICE README.md ; do
    cp $SRC/$i $DEST/$i 
done

tar -C $DEST -czf $DEST/molpaintjs.tar.gz templates/ css/ img/ js/ index.html LICENSE NOTICE README.md
