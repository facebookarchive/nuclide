'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStopFlowOnExit = getStopFlowOnExit;

var _config;

function _load_config() {
  return _config = require('./config');
}

function getStopFlowOnExit() {
  return Boolean((0, (_config || _load_config()).getConfig)('stopFlowOnExit'));
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