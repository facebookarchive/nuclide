'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertCoverage = convertCoverage;
exports.convertTypedRegionsToCoverageResult = convertTypedRegionsToCoverageResult;

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

// A region of untyped code.
// Currently may not span multiple lines. Consider enabling multi-line regions.
//
// start/end are column indices.
// Line/start/end are 1 based.
// end is inclusive.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const UNCHECKED_MESSAGE = 'Un-type checked code. Consider adding type annotations.';
const PARTIAL_MESSAGE = 'Partially type checked code. Consider adding type annotations.';

function convertCoverage(filePath, regions) {
  if (regions == null) {
    return null;
  }
  const hackCoverageResult = convertTypedRegionsToCoverageResult(regions);
  const uncoveredRegions = hackCoverageResult.uncoveredRegions.map(region => convertHackRegionToCoverageRegion(filePath, region));
  return {
    percentage: hackCoverageResult.percentage,
    uncoveredRegions
  };
}

function convertHackRegionToCoverageRegion(filePath, region) {
  const line = region.line - 1;
  return {
    range: new (_simpleTextBuffer || _load_simpleTextBuffer()).Range([line, region.start - 1], [line, region.end]),
    message: region.type === 'partial' ? PARTIAL_MESSAGE : UNCHECKED_MESSAGE
  };
}

function convertTypedRegionsToCoverageResult(regions) {
  const startColumn = 1;
  let line = 1;
  let column = startColumn;
  const unfilteredResults = [];
  regions.forEach(region => {
    const type = region.color;

    function addMessage(width) {
      if (width > 0) {
        const last = unfilteredResults[unfilteredResults.length - 1];
        const endColumn = column + width - 1;
        // Often we'll get contiguous blocks of errors on the same line.
        if (last != null && last.type === type && last.line === line && last.end === column - 1) {
          // So we just merge them into 1 block.
          last.end = endColumn;
        } else {
          unfilteredResults.push({
            type,
            line,
            start: column,
            end: endColumn
          });
        }
      }
    }

    const strings = region.text.split('\n');

    if (!(strings.length > 0)) {
      throw new Error('Invariant violation: "strings.length > 0"');
    }

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

  const totalInterestingRegionCount = unfilteredResults.reduce((count, region) => region.type !== 'default' ? count + 1 : count, 0);
  const checkedRegionCount = unfilteredResults.reduce((count, region) => region.type === 'checked' ? count + 1 : count, 0);
  const partialRegionCount = unfilteredResults.reduce((count, region) => region.type === 'partial' ? count + 1 : count, 0);

  return {
    percentage: totalInterestingRegionCount === 0 ? 100 : (checkedRegionCount + partialRegionCount / 2) / totalInterestingRegionCount * 100,
    uncoveredRegions: filterResults(unfilteredResults)
  };
}

function filterResults(unfilteredResults) {
  // Flow doesn't understand filter so we cast.
  return unfilteredResults.filter(region => region.type === 'unchecked' || region.type === 'partial');
}