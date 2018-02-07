'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeGrepLikeProcess = observeGrepLikeProcess;

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

// Grep and related tools (ag, ack, rg) have exit code 1 with no results.
function observeGrepLikeProcess(command, args, cwd) {
  return (0, (_process || _load_process()).observeProcess)(command, args, {
    cwd,
    // An exit code of 0 or 1 is normal for grep-like tools.
    isExitError: ({ exitCode, signal }) => {
      return (
        // flowlint-next-line sketchy-null-string:off
        !signal && (exitCode == null || exitCode > 1)
      );
    }
  });
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */