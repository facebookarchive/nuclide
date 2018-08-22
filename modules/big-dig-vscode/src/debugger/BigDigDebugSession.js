"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createBigDigDebugSession = createBigDigDebugSession;
exports.BigDigDebugSession = void 0;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

function jsonrpc() {
  const data = _interopRequireWildcard(require("vscode-jsonrpc"));

  jsonrpc = function () {
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

function _nuclideDebuggerCommon() {
  const data = require("../../../nuclide-debugger-common");

  _nuclideDebuggerCommon = function () {
    return data;
  };

  return data;
}

function _RemoteProcess() {
  const data = require("../RemoteProcess");

  _RemoteProcess = function () {
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
const logger = (0, _log4js().getLogger)('big-dig-debug-session');
/**
 * This manages a debug session via Big Dig. It is responsible for:
 * 1. Starting the debugger process on the remote machine.
 * 2. Using Big Dig to proxy the stdin/stdout from the debugger server running
 *    remotely to a local socket connection.
 * 3. Rewriting big-dig:// VS Code URIs as remote machine paths (and vice
 *    versa), as appropriate.
 */

async function createBigDigDebugSession(connectionWrapper, hostname, launchAttributes, inStream, outStream) {
  const {
    program,
    args,
    cwd
  } = launchAttributes;
  const proc = await (0, _RemoteProcess().spawnRemote)(connectionWrapper, program, args, {
    cwd
  });
  initStreamProcessing(proc, inStream, outStream, hostname);
  return new BigDigDebugSession(proc);
}

function initStreamProcessing(proc, inStream, outStream, hostname) {
  // For messages to the remote debugger, rewrite local big-dig:// URIs as paths
  // on the remote host.
  const localToRemoteMessageProcessor = (0, _nuclideDebuggerCommon().pathProcessor)(path => {
    const remote = vscode().Uri.parse(path).path;
    return remote;
  });
  const inStreamReader = new (jsonrpc().StreamMessageReader)(inStream);
  const inStreamWriter = new (jsonrpc().StreamMessageWriter)(proc.stdin);
  inStreamReader.listen(message => {
    logger.debug('Message from inStreamReader:', JSON.stringify(message, null, 2));
    localToRemoteMessageProcessor(message);
    inStreamWriter.write(message);
  }); // For messages from the remote debugger, rewrite paths on the remote host
  // as local big-dig:// URIs.

  const uriPrefix = `big-dig://${hostname}`;
  const remoteToLocalMessageProcessor = (0, _nuclideDebuggerCommon().pathProcessor)(path => `${uriPrefix}${path}`);
  const outStreamReader = new (jsonrpc().StreamMessageReader)(proc.stdout);
  const outStreamWriter = new (jsonrpc().StreamMessageWriter)(outStream);
  outStreamReader.listen(message => {
    logger.debug('Message from outStreamReader:', JSON.stringify(message, null, 2));
    remoteToLocalMessageProcessor(message);
    outStreamWriter.write(message);
  });
}

class BigDigDebugSession {
  constructor(proc) {
    this._proc = proc;
  }

  dispose() {
    // Do any other resources need to be released?
    // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    this._proc.kill('KILL');
  }

}

exports.BigDigDebugSession = BigDigDebugSession;