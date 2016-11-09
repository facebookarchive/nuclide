'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = parseLogcatMetadata;


// Example: [ 01-14 17:14:44.285   640:  656 E/KernelUidCpuTimeReader ]
// eslint-disable-next-line max-len
const METADATA_REGEX = /^\[ (\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\s+(\d+):(?:(0x[a-f0-9]+)|\s+(\d+))\s+(V|D|I|W|E|F|S)\/(.+) ]$/;function parseLogcatMetadata(line) {
  const match = line.match(METADATA_REGEX);

  if (match == null) {
    return null;
  }

  var _match = _slicedToArray(match, 7);

  const time = _match[1],
        pid = _match[2],
        hexTid = _match[3],
        decTid = _match[4],
        priority = _match[5],
        tag = _match[6];


  return {
    time: time,
    pid: parseInt(pid, 10),
    tid: hexTid == null ? parseInt(decTid, 10) : parseInt(hexTid, 16),
    priority: priority,
    tag: tag
  };
}
module.exports = exports['default'];