'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getProviders = getProviders;

var _types;

function _load_types() {
  return _types = require('./types');
}

const providers = {
  deviceList: new Set(),
  deviceInfo: new Set(),
  deviceTask: new Set(),
  deviceProcesses: new Set(),
  processTask: new Set(),
  deviceTypeTask: new Set(),
  deviceAction: new Set()
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

function getProviders() {
  return providers;
}