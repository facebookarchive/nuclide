'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rcCommand = rcCommand;

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

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

function rcCommand(args, input) {
  return (0, (_process || _load_process()).runCommand)('rc', args, { encoding: 'utf8', input });
}