"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BigDigDebugServer = void 0;

var net = _interopRequireWildcard(require("net"));

function _BigDigDebugSession() {
  const data = require("./BigDigDebugSession");

  _BigDigDebugSession = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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
 *  strict-local
 * @format
 */
const logger = (0, _log4js().getLogger)('big-dig-debug-provider');
/**
 * Wrapper around a net$Server that is handling requests for debug sessions.
 */

class BigDigDebugServer {
  constructor(connectionWrapper, config) {
    this._sessions = []; // For now, we start a local server and use that as a proxy to the remote
    // debugger. This is slightly suboptimal because it means that any user on
    // the system can communicate with the debugger (which, bear in mind, has
    // the ability to evaluate arbitrary expressions), not just the one who is
    // running VS Code. We will try to tighten this up in the future.

    this._server = net.createServer(async socket => {
      logger.info('Connection made to debugger');
      const {
        hostname,
        bigdig
      } = config;
      const launchAttributes = {
        program: bigdig.command,
        args: bigdig.args,
        cwd: bigdig.cwd
      };

      try {
        const session = await (0, _BigDigDebugSession().createBigDigDebugSession)(connectionWrapper, hostname, launchAttributes, socket, socket);

        this._sessions.push(session);
      } catch (e) {
        logger.error('Error starting debugger:', e);
      }
    }).listen(0); // The server is started on port 0, so we must retrieve the actual port
    // after the ephemeral port has been assigned.

    config.debugServer = this._server.address().port;
    this._config = config;
  }

  getConfig() {
    // $FlowIgnore: A copy of type T should be a T, no?
    return Object.assign({}, this._config);
  }

  dispose() {
    // TODO(mbolin): Can session.dispose() be called when the session is over
    // rather than when the BigDigDebugServer is disposed?
    this._sessions.map(session => session.dispose());

    this._sessions.length = 0;

    this._server.close();
  }

}

exports.BigDigDebugServer = BigDigDebugServer;