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

const SCOPE_MARKER = new Set([
  markers.openScope,
  markers.scopeIndent,
  markers.scopeBreak,
  markers.scopeSpaceBreak,
  markers.scopeComma,
  markers.scopeDedent,
  markers.closeScope,
]);

function isScopeMarker(marker: any): boolean {
  return SCOPE_MARKER.has(marker);
}

module.exports = isScopeMarker;
