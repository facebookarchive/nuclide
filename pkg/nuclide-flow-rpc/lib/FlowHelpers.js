'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStopFlowOnExit = getStopFlowOnExit;
exports.flowCoordsToAtomCoords = flowCoordsToAtomCoords;

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function getStopFlowOnExit() {
  // $UPFixMe: This should use nuclide-features-config
  // Does not currently do so because this is an npm module that may run on the server.
  if (global.atom) {
    return global.atom.config.get('nuclide.nuclide-flow.stopFlowOnExit');
  }
  return true;
}

function flowCoordsToAtomCoords(flowCoords) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Range([flowCoords.start.line - 1, flowCoords.start.column - 1], [flowCoords.end.line - 1,
  // Yes, this is inconsistent. Yes, it works as expected in practice.
  flowCoords.end.column]);
}