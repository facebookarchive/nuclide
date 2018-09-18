"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectToIPCServer = void 0;

function _nodeIpc() {
  const data = _interopRequireDefault(require("node-ipc"));

  _nodeIpc = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
let connected = false;

const connectToIPCServer = ({
  serverID,
  workerID
}) => {
  if (connected) {
    throw new Error("can't connect to IPC server more than once from one worker");
  }

  connected = true;
  _nodeIpc().default.config.id = serverID;
  _nodeIpc().default.config.retry = 1500;
  return new Promise(resolve => {
    const onMessageCallbacks = [];

    _nodeIpc().default.connectTo(serverID, () => {
      _nodeIpc().default.of[serverID].on('connect', () => {
        const initMessage = (0, _utils().makeMessage)({
          messageType: _utils().MESSAGE_TYPES.INITIALIZE
        });

        _nodeIpc().default.of[serverID].emit(workerID, initMessage);
      });

      _nodeIpc().default.of[serverID].on(workerID, data => {
        onMessageCallbacks.forEach(cb => cb(data));
      });

      resolve({
        send: message => _nodeIpc().default.of[serverID].emit(workerID, message),
        onMessage: fn => {
          onMessageCallbacks.push(fn);
        }
      });
    });
  });
};

exports.connectToIPCServer = connectToIPCServer;