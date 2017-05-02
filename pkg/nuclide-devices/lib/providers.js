'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDeviceListProviders = getDeviceListProviders;
exports.getDeviceInfoProviders = getDeviceInfoProviders;
exports.getDeviceActionsProviders = getDeviceActionsProviders;

var _types;

function _load_types() {
  return _types = require('./types');
}

const deviceListProviders = new Set(); /**
                                        * Copyright (c) 2015-present, Facebook, Inc.
                                        * All rights reserved.
                                        *
                                        * This source code is licensed under the license found in the LICENSE file in
                                        * the root directory of this source tree.
                                        *
                                        * 
                                        * @format
                                        */

const deviceInfoProviders = new Set();
const deviceActionsProviders = new Set();

function getDeviceListProviders() {
  return deviceListProviders;
}

function getDeviceInfoProviders() {
  return deviceInfoProviders;
}

function getDeviceActionsProviders() {
  return deviceActionsProviders;
}