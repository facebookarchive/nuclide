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

/**
 * This squashes all no break markers and any nearby breaks.
 */
function resolveNoBreaks(lines: Array<any>): Array<any> {
  const scopes = buildScopes(lines);
  const runs = buildRuns(lines);

  const kill = new Set();
  const killScopes = new Set();

  for (const run of runs) {
    const [start, end] = run;
    let hasNoBreak = false;

    // Check for the noBreak.
    for (let i = start; i < end; i++) {
      if (lines[i] === markers.noBreak) {
        hasNoBreak = true;
        break;
      }
    }

    if (!hasNoBreak) {
      continue;
    }

    // Then test what we need to kill.
    for (let i = start; i < end; i++) {
      if (isScopeBreakMarker(lines[i])) {
        invariant(scopes[i] != null, 'Scope markers must have a scope.');
        killScopes.add(scopes[i]);
      } else if (
        lines[i] === markers.noBreak ||
        lines[i] === markers.hardBreak ||
        lines[i] === markers.multiHardBreak
      ) {
        kill.add(i);
      }
    }
  }

  // Kill the appropriate scope markers.
  for (let i = 0; i < lines.length; i++) {
    if (isScopeMarker(lines[i]) && killScopes.has(scopes[i])) {
      kill.add(i);
    }
  }

  // Now do the killing.
  return lines.map((line, i) => {
    if (kill.has(i)) {
      if (line === markers.hardBreak) {
        return markers.empty;
      } else if (line === markers.multiHardBreak) {
        return markers.empty;
      } else if (line === markers.noBreak) {
        return markers.empty;
      } else if (line === markers.openScope) {
        return markers.empty;
      } else if (line === markers.scopeIndent) {
        return markers.empty;
      } else if (line === markers.scopeBreak) {
        return markers.empty;
      } else if (line === markers.scopeSpaceBreak) {
        return markers.space;
      } else if (line === markers.scopeComma) {
        return markers.empty;
      } else if (line === markers.scopeDedent) {
        return markers.empty;
      } else if (line === markers.closeScope) {
        return markers.empty;
      }
    }
    return line;
  });
}

module.exports = resolveNoBreaks;
