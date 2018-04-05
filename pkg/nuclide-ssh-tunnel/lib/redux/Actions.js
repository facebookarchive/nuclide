'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.closeTunnel = closeTunnel;
exports.openTunnel = openTunnel;
exports.requestTunnel = requestTunnel;
exports.setTunnelState = setTunnelState;
exports.setCurrentWorkingDirectory = setCurrentWorkingDirectory;
const CLOSE_TUNNEL = exports.CLOSE_TUNNEL = 'CLOSE_TUNNEL'; /**
                                                             * Copyright (c) 2015-present, Facebook, Inc.
                                                             * All rights reserved.
                                                             *
                                                             * This source code is licensed under the license found in the LICENSE file in
                                                             * the root directory of this source tree.
                                                             *
                                                             * 
                                                             * @format
                                                             */

const OPEN_TUNNEL = exports.OPEN_TUNNEL = 'OPEN_TUNNEL';
const REQUEST_TUNNEL = exports.REQUEST_TUNNEL = 'REQUEST_TUNNEL';
const SET_TUNNEL_STATE = exports.SET_TUNNEL_STATE = 'SET_TUNNEL_STATE';
const SET_CURRENT_WORKING_DIRECTORY = exports.SET_CURRENT_WORKING_DIRECTORY = 'SET_CURRENT_WORKING_DIRECTORY';

function closeTunnel(tunnel, error) {
  return {
    type: CLOSE_TUNNEL,
    payload: { tunnel, error }
  };
}

function openTunnel(tunnel, open, close) {
  return {
    type: OPEN_TUNNEL,
    payload: { tunnel, open, close }
  };
}

function requestTunnel(tunnel, onOpen, onClose) {
  return {
    type: REQUEST_TUNNEL,
    payload: { tunnel, onOpen, onClose }
  };
}

function setTunnelState(tunnel, state) {
  return {
    type: SET_TUNNEL_STATE,
    payload: { tunnel, state }
  };
}

function setCurrentWorkingDirectory(directory) {
  return {
    type: SET_CURRENT_WORKING_DIRECTORY,
    payload: { directory }
  };
}