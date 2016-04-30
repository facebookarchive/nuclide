'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import buildRuns from '../utils/buildRuns';
import buildScopes from '../utils/buildScopes';
import invariant from 'assert';
import isScopeBreakMarker from '../utils/isScopeBreakMarker';
import isScopeMarker from '../utils/isScopeMarker';
import markers from '../constants/markers';
import translateScopeMarker from '../utils/translateScopeMarker';

/**
 * Sometimes a scope break may be adjacent to a hard break. If that's the case
 * go ahead and break the scope.
 *
 * This assumes noBreaks have already been removed and will not be encountered.
 */
function resolveForcedScopeBreaks(lines: Array<any>): Array<any> {
  const scopes = buildScopes(lines);
  const runs = buildRuns(lines);
  const toBreak = new Set();

  for (const run of runs) {
    const [start, end] = run;
    let broken = false;
    for (let i = start; i < end; i++) {
      if (
        lines[i] === markers.hardBreak ||
        lines[i] === markers.multiHardBreak
      ) {
        broken = true;
        break;
      }
    }

    if (!broken) {
      continue;
    }

    for (let i = start; i < end; i++) {
      if (isScopeBreakMarker(lines[i])) {
        invariant(scopes[i] != null, 'Scope markers must have a scope.');
        toBreak.add(scopes[i]);
      }
    }
  }

  return lines.map((line, i) => {
    if (
      isScopeMarker(line) &&
      scopes[i] != null &&
      toBreak.has(scopes[i])
    ) {
      return translateScopeMarker(line, true);
    }
    return line;
  });
}

module.exports = resolveForcedScopeBreaks;
