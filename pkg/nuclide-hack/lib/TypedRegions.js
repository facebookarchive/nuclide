Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.convertTypedRegionsToCoverageRegions = convertTypedRegionsToCoverageRegions;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

// A region of untyped code.
// Currently may not span multiple lines. Consider enabling multi-line regions.
//
// start/end are column indices.
// Line/start/end are 1 based.
// end is inclusive.

function convertTypedRegionsToCoverageRegions(regions) {
  if (regions == null) {
    return [];
  }

  var startColumn = 1;
  var line = 1;
  var column = startColumn;
  var results = [];
  regions.forEach(function (region) {
    var type = region.color;
    var isMessage = type === 'unchecked' || type === 'partial';

    function addMessage(width) {
      if (isMessage && width > 0) {
        var _last = results[results.length - 1];
        var endColumn = column + width - 1;
        // Often we'll get contiguous blocks of errors on the same line.
        if (_last != null && _last.type === type && _last.line === line && _last.end === column - 1) {
          // So we just merge them into 1 block.
          _last.end = endColumn;
        } else {
          (0, _assert2['default'])(type === 'unchecked' || type === 'partial');
          results.push({
            type: type,
            line: line,
            start: column,
            end: endColumn
          });
        }
      }
    }

    var strings = region.text.split('\n');
    (0, _assert2['default'])(strings.length > 0);

    // Add message for each line ending in a new line.
    var lines = strings.slice(0, -1);
    lines.forEach(function (text) {
      addMessage(text.length);
      line += 1;
      column = startColumn;
    });

    // Add message for the last string which does not end in a new line.
    var last = strings[strings.length - 1];
    addMessage(last.length);
    column += last.length;
  });

  return results;
}