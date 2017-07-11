'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openTunnel = openTunnel;
exports.addOpenTunnel = addOpenTunnel;
exports.closeTunnel = closeTunnel;
const OPEN_TUNNEL = exports.OPEN_TUNNEL = 'OPEN_TUNNEL'; /**
                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                          * All rights reserved.
                                                          *
                                                          * This source code is licensed under the license found in the LICENSE file in
                                                          * the root directory of this source tree.
                                                          *
                                                          * 
                                                          * @format
                                                          */

const ADD_OPEN_TUNNEL = exports.ADD_OPEN_TUNNEL = 'ADD_OPEN_TUNNEL';
const CLOSE_TUNNEL = exports.CLOSE_TUNNEL = 'CLOSE_TUNNEL';

function openTunnel(tunnel) {
  return {
    type: OPEN_TUNNEL,
    payload: { tunnel }
  };
}

function addOpenTunnel(tunnel, close) {
  return {
    type: ADD_OPEN_TUNNEL,
    payload: { tunnel, close }
  };
}

function closeTunnel(tunnel) {
  return {
    type: CLOSE_TUNNEL,
    payload: { tunnel }
  };
}