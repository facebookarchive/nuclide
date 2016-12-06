'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.insertAutocompleteToken = insertAutocompleteToken;
exports.getStopFlowOnExit = getStopFlowOnExit;
exports.flowCoordsToAtomCoords = flowCoordsToAtomCoords;
function insertAutocompleteToken(contents, position) {
  const lines = contents.split('\n');
  let theLine = lines[position.row];
  theLine = theLine.substring(0, position.column) + 'AUTO332' + theLine.substring(position.column);
  lines[position.row] = theLine;
  return lines.join('\n');
}function getStopFlowOnExit() {
  // $UPFixMe: This should use nuclide-features-config
  // Does not currently do so because this is an npm module that may run on the server.
  if (global.atom) {
    return global.atom.config.get('nuclide.nuclide-flow.stopFlowOnExit');
  }
  return true;
}

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