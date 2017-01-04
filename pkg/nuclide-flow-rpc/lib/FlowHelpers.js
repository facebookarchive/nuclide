'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStopFlowOnExit = getStopFlowOnExit;
exports.flowCoordsToAtomCoords = flowCoordsToAtomCoords;
function getStopFlowOnExit() {
  // $UPFixMe: This should use nuclide-features-config
  // Does not currently do so because this is an npm module that may run on the server.
  if (global.atom) {
    return global.atom.config.get('nuclide.nuclide-flow.stopFlowOnExit');
  }
  return true;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

function flowCoordsToAtomCoords(flowCoords) {
  return {
    start: {
      line: flowCoords.start.line - 1,
      column: flowCoords.start.column - 1
    },
    end: {
      line: flowCoords.end.line - 1,
      // Yes, this is inconsistent. Yes, it works as expected in practice.
      column: flowCoords.end.column
    }
  };
}