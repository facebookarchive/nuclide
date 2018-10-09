"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functionToTest = functionToTest;

function _toBeMocked() {
  const data = require("./toBeMocked");

  _toBeMocked = function () {
    return data;
  };

  return data;
}

/**
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
function functionToTest() {
  return (0, _toBeMocked().importedFunction)(42);
}