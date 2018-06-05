'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functionToTest = functionToTest;

var _toBeMocked;

function _load_toBeMocked() {
  return _toBeMocked = require('./toBeMocked');
}

function functionToTest() {
  return (0, (_toBeMocked || _load_toBeMocked()).importedFunction)(42);
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