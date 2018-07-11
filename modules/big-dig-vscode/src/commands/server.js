"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shutdownRemoteServer = shutdownRemoteServer;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

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

function _remote() {
  const data = require("../remote");

  _remote = function () {
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
const logger = (0, _log4js().getLogger)('commands');
/**
 * Displays a quick-pick selection of *connected* servers; picking a server will
 * tell the server to shut down.
 */

async function shutdownRemoteServer() {
  try {
    // Select all active connections.
    const connections = (0, _remote().getServers)().map(server => server.getCurrentConnection()).filter(Boolean).map(makeQuickPickItem);
    const items = Promise.all(connections);
    const option = await vscode().window.showQuickPick(items, {
      placeHolder: 'Select a remote server to shut down'
    });

    if (option != null && option.conn != null) {
      option.conn.shutdown();
    }
  } catch (err) {
    logger.error(err);
  }
}

async function makeQuickPickItem(conn) {
  const {
    authority: label
  } = vscode().Uri.parse(conn.getAddress());

  try {
    const status = await conn.getServerStatus();
    const uptime = formatTimespan(status.uptime);
    const memory = formatMemory(status.memoryUsage.heapUsed);
    const version = status.version != null ? status.version : '<unknown version>';
    return {
      label,
      description: version,
      detail: `uptime: ${uptime}; ${memory} used`,
      conn
    };
  } catch (error) {
    return {
      label,
      description: '<ERROR>'
    };
  }
}
/**
 * Like `toFixed`, but trims the trailing zeros (and '.').
 */


function toFixedTrimZeros(value, fractionDigits) {
  return value.toFixed(fractionDigits).replace(/[.]?0*$/, '');
}

function formatMemory(bytes) {
  // Show two decimals, but without trailing zeros
  const mb = toFixedTrimZeros(bytes / 1048576, 2);
  return `${mb} MiB`;
}

function formatTimespan(totalSeconds) {
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor(totalSeconds / (60 * 60) % 24);
  const minutes = Math.floor(totalSeconds / 60 % 60);
  const seconds = toFixedTrimZeros(totalSeconds % 60, 2);

  const quantity = (x, one, plural) => x === 1 ? `${x} ${one}` : `${x} ${plural}`;

  const dy = quantity(days, 'day', 'days');
  const hr = quantity(hours, 'hr', 'hrs');
  const min = quantity(minutes, 'min', 'mins');
  const sec = quantity(seconds, 'sec', 'secs');
  return days > 0 ? `${dy}, ${hr}, ${min}` : hours > 0 ? `${hr}, ${min}` : minutes > 0 ? `${min}, ${sec}` : sec;
}