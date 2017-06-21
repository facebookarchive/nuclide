'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setCustomAdbPath = setCustomAdbPath;
exports.setAdbPort = setAdbPort;
exports.setCustomSdbPath = setCustomSdbPath;
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

const SET_CUSTOM_ADB_PATH = exports.SET_CUSTOM_ADB_PATH = 'SET_CUSTOM_ADB_PATH';
const SET_CUSTOM_SDB_PATH = exports.SET_CUSTOM_SDB_PATH = 'SET_CUSTOM_SDB_PATH';
const SET_ADB_PORT = exports.SET_ADB_PORT = 'SET_ADB_PORT';

function setCustomAdbPath(host, path) {
  return {
    type: SET_CUSTOM_ADB_PATH,
    payload: { host, path }
  };
}

function setAdbPort(host, port) {
  return {
    type: SET_ADB_PORT,
    payload: { host, port }
  };
}

function setCustomSdbPath(host, path) {
  return {
    type: SET_CUSTOM_SDB_PATH,
    payload: { host, path }
  };
}