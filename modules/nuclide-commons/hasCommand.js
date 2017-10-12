'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasCommand = hasCommand;

var _commandExists;

function _load_commandExists() {
  return _commandExists = _interopRequireDefault(require('command-exists'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hasCommand(command) {
  return (0, (_commandExists || _load_commandExists()).default)(command).then(() => true, () => false);
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