"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRemoteTerminal = createRemoteTerminal;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

function _ConnectionWrapper() {
  const data = require("../ConnectionWrapper");

  _ConnectionWrapper = function () {
    return data;
  };

  return data;
}

function _TerminalWrapper() {
  const data = require("./TerminalWrapper");

  _TerminalWrapper = function () {
    return data;
  };

  return data;
}

function _configuration() {
  const data = require("../configuration");

  _configuration = function () {
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
 *  strict-local
 * @format
 */

/**
 * Creates a vscode.Terminal attached to a remote
 */
async function createRemoteTerminal(conn, cwd, env) {
  const {
    shell,
    shellArgs
  } = (0, _configuration().getIntegratedTerminal)();
  const t = new (_TerminalWrapper().TerminalWrapper)('term: ' + conn.getAddress()); // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)

  const p = await (0, _RemoteProcess().spawnRemote)(conn, shell, shellArgs, {
    cwd,
    shell: false,
    usePty: true,
    env,
    addBigDigToPath: true
  });
  await t.ready;
  t.terminal.show(false);
  t.stdin.pipe(p.stdin);
  t.on('close', () => {
    p.kill('SIGTERM');
  });
  t.on('resize', () => {
    p.resize(t.columns, t.rows);
  });
  p.stdout.pipe(t.stdout);
  p.stderr.pipe(t.stderr);
  p.once('close', () => t.close());
  p.once('error', err => {
    vscode().window.showWarningMessage(`Error from terminal: ${err.toString()}`);
    t.close();
  });
  return t.terminal;
}