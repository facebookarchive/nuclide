'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FlowLocNoSource} from './flowOutputTypes';

export function insertAutocompleteToken(contents: string, position: atom$Point): string {
  const lines = contents.split('\n');
  let theLine = lines[position.row];
  theLine = theLine.substring(0, position.column) + 'AUTO332' + theLine.substring(position.column);
  lines[position.row] = theLine;
  return lines.join('\n');
}

export function getStopFlowOnExit(): boolean {
  // $UPFixMe: This should use nuclide-features-config
  // Does not currently do so because this is an npm module that may run on the server.
  if (global.atom) {
    return ((global.atom.config.get('nuclide.nuclide-flow.stopFlowOnExit'): any): boolean);
  }
  return true;
}

export function flowCoordsToAtomCoords(flowCoords: FlowLocNoSource): FlowLocNoSource {
  return {
    start: {
      line: flowCoords.start.line - 1,
      column: flowCoords.start.column - 1,
    },
    end: {
      line: flowCoords.end.line - 1,
      // Yes, this is inconsistent. Yes, it works as expected in practice.
      column: flowCoords.end.column,
    },
  };
}
