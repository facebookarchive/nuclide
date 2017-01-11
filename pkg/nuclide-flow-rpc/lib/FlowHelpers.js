/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {FlowLocNoSource} from './flowOutputTypes';

import {Range} from 'simple-text-buffer';

export function getStopFlowOnExit(): boolean {
  // $UPFixMe: This should use nuclide-features-config
  // Does not currently do so because this is an npm module that may run on the server.
  if (global.atom) {
    return ((global.atom.config.get('nuclide.nuclide-flow.stopFlowOnExit'): any): boolean);
  }
  return true;
}

export function flowCoordsToAtomCoords(flowCoords: FlowLocNoSource): atom$Range {
  return new Range(
    [
      flowCoords.start.line - 1,
      flowCoords.start.column - 1,
    ],
    [
      flowCoords.end.line - 1,
      // Yes, this is inconsistent. Yes, it works as expected in practice.
      flowCoords.end.column,
    ],
  );
}
