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
 */

function ActionList() {

    /* 
     * this class stores all atomic actions of a user. A single 
     * user action (e.g. adding a residue) may be composed of 
     * several atomic actions.
     */
    this.actions = [];

    /**
     * add a single atomic action
     * @param a the single (atomic) action
     */
    this.addAction = function (a) {
        this.actions.push(a);
    }

    /**
     * append a whole action list
     * @param al the ActionList object to append
     */
    this.addActionList = function (al) {
        for(var i in al.actions) {
            this.actions.push(al.actions[i]);
        }
    }

    /**
     * @return the array of atomic actions
     */
    this.getActions = function () {
        return this.actions;
    }
}
