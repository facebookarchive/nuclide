'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import markers from '../constants/markers';

const SCOPE_BREAK_MARKERS = new Set([
  markers.scopeBreak,
  markers.scopeSpaceBreak,
]);

function isScopeBreakMarker(marker: any): boolean {
  return SCOPE_BREAK_MARKERS.has(marker);
}

module.exports = isScopeBreakMarker;
