/*
 * MolPaintJS
 * Copyright 2017 - 2021 Leibniz-Institut f. Pflanzenbiochemie 
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
var molPaintJS = (function (molpaintjs) {
    "use strict";

    molpaintjs.RoleTool = function(ctx, prop) {

        let distMax = prop.distMax;
        let type = "default";

        let actionList;

        function click (context, x, y, evt) {
            let coord = context.getView().getCoordReverse(x, y);
            let atomId = context.getDrawing().selectAtom(coord, distMax);
            if (atomId != null) {
                let atom = context.getDrawing().getAtom(atomId);
                let chemObjectId = atom.getChemObjectId();
                context.getDrawing().getChemObjects()[chemObjectId].setRole(type);

                // xxxxx history missing
                context.draw();
            }
        }

        function mouseDown (context, x, y, evt) {
        }

        function mouseMove (context, x, y, evt) {
        }

        return {
            id : "roleTool",
            context : ctx,

            abort : function () {
                molPaintJS.Tools.abort(this);
                molPaintJS.Tools.setStyle(this, "advanced", "molPaintJS-inactiveTool");
            },

            getId : function () {
                return type;
            },

            onClick : function (x, y, evt) { 
                click(this.context, x, y, evt);
            },

            onMouseDown : function (x, y, evt) {
                let helper = this.context;
                mouseDown(this.context, x, y, evt);
            },

            onMouseMove : function (x, y, evt) {
                mouseMove(this.context, x, y, evt);
            },

            setType : function (t) {
                type = t;
            },

            setup : function () {
                molPaintJS.Tools.setStyle(this, "advanced", "molPaintJS-activeTool");
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));

