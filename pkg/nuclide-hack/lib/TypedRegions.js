'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  HackTypedRegion,
} from '../../nuclide-hack-base/lib/HackService';

import invariant from 'assert';

// A region of untyped code.
// Currently may not span multiple lines. Consider enabling multi-line regions.
//
// start/end are column indices.
// Line/start/end are 1 based.
// end is inclusive.
export type TypeCoverageRegion = {
  type: 'unchecked' | 'partial';
  line: number;
  start: number;
  end: number;
};

type UnfilteredTypeCoverageRegion = {
  type: 'unchecked' | 'partial' | 'default' | 'checked';
  line: number;
  start: number;
  end: number;
};

export type HackCoverageResult = {
  percentage: number;
  uncoveredRegions: Array<TypeCoverageRegion>;
};

export function convertTypedRegionsToCoverageResult(
  regions: ?Array<HackTypedRegion>,
): ?HackCoverageResult {
  if (regions == null) {
    return null;
  }

  const startColumn = 1;
  let line = 1;
  let column = startColumn;
  const unfilteredResults: Array<UnfilteredTypeCoverageRegion> = [];
  regions.forEach(region => {
    const type = region.color;

    function addMessage(width) {
      if (width > 0) {
        const last = unfilteredResults[unfilteredResults.length - 1];
        const endColumn = column + width - 1;
        // Often we'll get contiguous blocks of errors on the same line.
        if (last != null && last.type === type
            && last.line === line && last.end === column - 1) {
          // So we just merge them into 1 block.
          last.end = endColumn;
        } else {
          unfilteredResults.push({
            type,
            line,
            start: column,
            end: endColumn,
          });
        }
      }
    }

    const strings = region.text.split('\n');
    invariant(strings.length > 0);

    // Add message for each line ending in a new line.
    const lines = strings.slice(0, -1);
    lines.forEach(text => {
      addMessage(text.length);
      line += 1;
      column = startColumn;
    });

    // Add message for the last string which does not end in a new line.
    const last = strings[strings.length - 1];
    addMessage(last.length);
    column += last.length;
  });

  const totalInterestingRegionCount = unfilteredResults.reduce(
    (count, region) => (region.type !== 'default' ? count + 1 : count),
    0,
  );
  const checkedRegionCount = unfilteredResults.reduce(
    (count, region) =>
      (region.type === 'checked' ? count + 1 : count),
    0,
  );
  const partialRegionCount = unfilteredResults.reduce(
    (count, region) =>
      (region.type === 'partial' ? count + 1 : count),
    0,
  );

  return {
    percentage: totalInterestingRegionCount === 0 ?
      100 :
      (checkedRegionCount + partialRegionCount / 2) / totalInterestingRegionCount * 100,
    uncoveredRegions: filterResults(unfilteredResults),
  };
}

function filterResults(
  unfilteredResults: Array<UnfilteredTypeCoverageRegion>,
): Array<TypeCoverageRegion> {
  // Flow doesn't understand filter so we cast.
  return (unfilteredResults.filter(region =>
    region.type === 'unchecked' || region.type === 'partial'
  ): any);
}
