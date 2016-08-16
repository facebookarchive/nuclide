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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.default = parseLogcatMetadata;

// Example: [ 01-14 17:14:44.285   640:  656 E/KernelUidCpuTimeReader ]
var METADATA_REGEX = /^\[ (\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\s+(\d+):\s+(\d+)\s+(V|D|I|W|E|F|S)\/(.+) \]$/;

function parseLogcatMetadata(line) {
  var match = line.match(METADATA_REGEX);

  if (match == null) {
    return null;
  }

  var _match = _slicedToArray(match, 6);

  var time = _match[1];
  var pid = _match[2];
  var tid = _match[3];
  var priority = _match[4];
  var tag = _match[5];

  return {
    time: time,
    pid: parseInt(pid, 10),
    tid: parseInt(tid, 10),
    priority: priority,
    tag: tag
  };
}

module.exports = exports.default;