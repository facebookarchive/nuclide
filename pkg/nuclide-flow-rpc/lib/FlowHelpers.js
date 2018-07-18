"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStopFlowOnExit = getStopFlowOnExit;

function _config() {
  const data = require("./config");

  _config = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function getStopFlowOnExit() {
  return Boolean((0, _config().getConfig)('stopFlowOnExit'));
}