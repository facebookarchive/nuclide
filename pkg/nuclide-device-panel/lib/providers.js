'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getProviders = getProviders;
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

const providers = {
  deviceList: new Set(),
  deviceInfo: new Set(),
  deviceTask: new Set(),
  deviceProcesses: new Set(),
  processTask: new Set(),
  deviceTypeTask: new Set(),
  deviceAction: new Set(),
  appInfo: new Set(),
  deviceTypeComponent: new Set()
};

function getProviders() {
  return providers;
}