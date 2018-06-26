'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logVerbose = logVerbose;

var _vscodeDebugadapter;

function _load_vscodeDebugadapter() {
  return _vscodeDebugadapter = require('vscode-debugadapter');
}

function timestamp() {
  let ts = `${new Date().getTime()}`;

  // This code put seperators in the timestamp in groups of thousands
  // to make it easier to read, i.e.
  // 123456789 => 123_456_789
  let fmt = '';
  while (ts.length >= 3) {
    if (fmt !== '') {
      fmt = '_' + fmt;
    }
    fmt = ts.substring(ts.length - 3) + fmt;
    ts = ts.substring(0, ts.length - 3);
  }

  if (ts !== '') {
    if (fmt !== '') {
      fmt = '_' + fmt;
    }
    fmt = ts + fmt;
  }

  return fmt;
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   * @format
   */

function logVerbose(line) {
  (_vscodeDebugadapter || _load_vscodeDebugadapter()).logger.verbose(`${timestamp()} ${line}`);
}