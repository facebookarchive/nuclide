"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createProxyExecutable = createProxyExecutable;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _TerminalWrapper() {
  const data = require("./TerminalWrapper");

  _TerminalWrapper = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

/**
 * Returns a local executable path and arguments, which together will spawn a
 * process that is wrapped by a `ProcessWrapper`. Field `spawned` of the result
 * emits a new `ProcessWrapper` each time the executable is spawned.
 *
 * Rationale: we use this because some vscode APIs expect to be given executable
 * commands and arguments rather allowing us to attach a process directly (e.g.
 * remote processes).
 *
 * NOTE: This is a hopefully-temporary hack until vscode does not require local
 * executables to be specified. Please avoid using this approach if at all
 * possible.
 */
async function createProxyExecutable() {
  const proxy = new (_TerminalWrapper().TerminalWrapper)('big-dig terminal');
  await proxy.ready;
  return {
    spawned: _RxMin.Observable.of({
      proxy,
      args: []
    }),
    terminal: proxy.terminal
  };
}