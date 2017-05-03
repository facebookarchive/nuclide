'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEmptyAppState = createEmptyAppState;
function createEmptyAppState() {
  return {
    hosts: ['local'],
    host: 'local',
    devices: [],
    deviceType: null,
    deviceTypes: [],
    device: null,
    deviceActions: [],
    infoTables: new Map()
  };
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