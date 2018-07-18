"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServerRpcMethods = void 0;

function log4js() {
  const data = _interopRequireWildcard(require("log4js"));

  log4js = function () {
    return data;
  };

  return data;
}

function proto() {
  const data = _interopRequireWildcard(require("./Protocol.js"));

  proto = function () {
    return data;
  };

  return data;
}

function _package() {
  const data = require("./package.json");

  _package = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const logger = log4js().getLogger('server');

class ServerRpcMethods {
  register(registrar) {
    registrar.registerFun('shutdown', this._doShutdown.bind(this));
    registrar.registerFun('get-status', this._doGetStatus.bind(this));
  }

  dispose() {}

  _doShutdown(params) {
    // TODO(siegebell): Implement a controlled shutdown: give all transports
    // a chance to clean up resources.
    logger.info('Shutting down...');
    return new Promise((resolve, reject) => {
      // TODO(siegebell): log4js.shutdown does not reliably flush!?
      log4js().shutdown(() => {
        resolve({}); // TODO(siegebell): an orderly shutdown would wait for the sockets
        // to be closed/flushed before exiting...
        // Give some time for the message to be sent

        setTimeout(() => process.exit(0), 10);
      });
    });
  }

  async _doGetStatus(params) {
    return {
      version: _package().version,
      platform: process.platform,
      pid: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }

}

exports.ServerRpcMethods = ServerRpcMethods;