'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setCustomAdbPath = setCustomAdbPath;
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

function setCustomAdbPath(host, path) {
  return {
    type: SET_CUSTOM_ADB_PATH,
    payload: { host, path }
  };
}

function setCustomSdbPath(host, path) {
  return {
    type: SET_CUSTOM_SDB_PATH,
    payload: { host, path }
  };
}