"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.closeTunnel = closeTunnel;
exports.deleteTunnel = deleteTunnel;
exports.openTunnel = openTunnel;
exports.requestTunnel = requestTunnel;
exports.setTunnelState = setTunnelState;
exports.setCurrentWorkingDirectory = setCurrentWorkingDirectory;
exports.subscribeToTunnel = subscribeToTunnel;
exports.unsubscribeFromTunnel = unsubscribeFromTunnel;
exports.UNSUBSCRIBE_FROM_TUNNEL = exports.SUBSCRIBE_TO_TUNNEL = exports.SET_CURRENT_WORKING_DIRECTORY = exports.SET_TUNNEL_STATE = exports.REQUEST_TUNNEL = exports.OPEN_TUNNEL = exports.DELETE_TUNNEL = exports.CLOSE_TUNNEL = void 0;

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
const CLOSE_TUNNEL = 'CLOSE_TUNNEL';
exports.CLOSE_TUNNEL = CLOSE_TUNNEL;
const DELETE_TUNNEL = 'DELETE_TUNNEL';
exports.DELETE_TUNNEL = DELETE_TUNNEL;
const OPEN_TUNNEL = 'OPEN_TUNNEL';
exports.OPEN_TUNNEL = OPEN_TUNNEL;
const REQUEST_TUNNEL = 'REQUEST_TUNNEL';
exports.REQUEST_TUNNEL = REQUEST_TUNNEL;
const SET_TUNNEL_STATE = 'SET_TUNNEL_STATE';
exports.SET_TUNNEL_STATE = SET_TUNNEL_STATE;
const SET_CURRENT_WORKING_DIRECTORY = 'SET_CURRENT_WORKING_DIRECTORY';
exports.SET_CURRENT_WORKING_DIRECTORY = SET_CURRENT_WORKING_DIRECTORY;
const SUBSCRIBE_TO_TUNNEL = 'SUBSCRIBE_TO_TUNNEL';
exports.SUBSCRIBE_TO_TUNNEL = SUBSCRIBE_TO_TUNNEL;
const UNSUBSCRIBE_FROM_TUNNEL = 'UNSUBSCRIBE_FROM_TUNNEL';
exports.UNSUBSCRIBE_FROM_TUNNEL = UNSUBSCRIBE_FROM_TUNNEL;

function closeTunnel(tunnel, error) {
  return {
    type: CLOSE_TUNNEL,
    payload: {
      tunnel,
      error
    }
  };
}

function deleteTunnel(tunnel) {
  return {
    type: DELETE_TUNNEL,
    payload: {
      tunnel
    }
  };
}

function openTunnel(tunnel, open, close) {
  return {
    type: OPEN_TUNNEL,
    payload: {
      tunnel,
      open,
      close
    }
  };
}

function requestTunnel(description, tunnel, onOpen, onClose) {
  return {
    type: REQUEST_TUNNEL,
    payload: {
      description,
      tunnel,
      onOpen,
      onClose
    }
  };
}

function setTunnelState(tunnel, state) {
  return {
    type: SET_TUNNEL_STATE,
    payload: {
      tunnel,
      state
    }
  };
}

function setCurrentWorkingDirectory(directory) {
  return {
    type: SET_CURRENT_WORKING_DIRECTORY,
    payload: {
      directory
    }
  };
}

function subscribeToTunnel(subscription, tunnel, onOpen) {
  return {
    type: SUBSCRIBE_TO_TUNNEL,
    payload: {
      onOpen,
      subscription,
      tunnel
    }
  };
}

function unsubscribeFromTunnel(subscription, tunnel) {
  return {
    type: UNSUBSCRIBE_FROM_TUNNEL,
    payload: {
      subscription,
      tunnel
    }
  };
}