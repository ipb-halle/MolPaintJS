/*
 * MolPaintJS
 * Copyright 2017 Leibniz-Institut f. Pflanzenbiochemie 
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
 *
 * Tools is somehow the base class for all tools
 * providing two methods: abort(tool) and setup(tool)
 *
 * The two methods handle the activation and deactivation
 * of the tool icons (i.e. change the icon CSS class).
 */

function Tools() {
}

Tools.abort = function (tool) {
    var iconId = tool.context.contextId + "_" + tool.id;
    var icon = document.getElementById(iconId);
    icon.className = "inactiveTool";
}

Tools.setup = function (tool) {
    var iconId = tool.context.contextId + "_" + tool.id;
    var icon = document.getElementById(iconId);
    icon.className = "activeTool";

    try {
        tool.setup();
    } catch (err) {
        // ignore
    }
}
