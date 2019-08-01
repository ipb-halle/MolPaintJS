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
#  Rebuilds the distribution directory of the plugin 
#  * concatenates all JavaScript files (in alphabetical order)
#  * optionally compresses ('minifies') the output script (default)
#  * copies documentation and licensing information etc.
#

SRC=`dirname $0`
pushd $SRC

echo "Building software package ..."

if [ x$1 = "xnocompress" ] ; then 
    find $SRC/js -type f -name "*.js" | sort | xargs -l1 cat > docs/js/molpaint.js
else
    command -v terser >/dev/null 2>&1 || { echo >&2 "Standard installation requires 'terser'. Either install 'terser' or use option 'nocompress'. Aborting."; exit 1; }
    find $SRC/js -type f -name "*.js" | sort | xargs -l1 cat | \
      terser --compress -m -o docs/js/molpaint.js 
fi

# synchronize LICENSE, NOTICE  and README.md
for i in LICENSE NOTICE README.md ; do
    cp $SRC/$i docs/$i 
done

