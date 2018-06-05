'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.startServer = undefined;var _nodeIpc;






















function _load_nodeIpc() {return _nodeIpc = _interopRequireDefault(require('node-ipc'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                        * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                        * All rights reserved.
                                                                                                                                                                                        *
                                                                                                                                                                                        * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                        * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                        * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                        *
                                                                                                                                                                                        * 
                                                                                                                                                                                        * @format
                                                                                                                                                                                        */let started = false;const startServer = exports.startServer = ({ serverID }) => {if (started) {throw new Error('IPC server can only be started once');
  }
  return new Promise(resolve => {
    started = true;
    (_nodeIpc || _load_nodeIpc()).default.config.id = serverID;
    (_nodeIpc || _load_nodeIpc()).default.config.retry = 1500;
    (_nodeIpc || _load_nodeIpc()).default.config.silent = true;

    (_nodeIpc || _load_nodeIpc()).default.serve(() => {
      resolve((_nodeIpc || _load_nodeIpc()).default.server);
    });

    (_nodeIpc || _load_nodeIpc()).default.server.start();
  });
};