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
import markers from '../constants/markers';

/**
 * This squashes all duplicates that should not be kept.
 */
function resolveDuplicates(lines: Array<any>): Array<any> {
  const runs = buildRuns(lines);
  const kill = new Set();

  for (const run of runs) {
    const [start, end] = run;

    let hardBreak = 0;
    let multiHardBreak = 0;

    // Count how many of each break we have.
    for (let i = start; i < end; i++) {
      if (lines[i] === markers.hardBreak) {
        hardBreak++;
      } else if (lines[i] === markers.multiHardBreak) {
        multiHardBreak++;
      }
    }

    let hardBreaksRemaining = hardBreak;

    // Then kill the appropriate duplicates in the run.
    for (let i = start; i < end; i++) {
      if (lines[i] === markers.hardBreak) {
        if (
          hardBreaksRemaining > 1 ||
          multiHardBreak > 0
        ) {
          hardBreaksRemaining--;
          kill.add(i);
        }
      } else if (lines[i] === markers.multiHardBreak) {
        // Never remove a multiHardBreak.
      }
    }
  }

  // We always kill to empty here.
  return lines.map((line, i) => (kill.has(i) ? markers.empty : line));
}

module.exports = resolveDuplicates;
