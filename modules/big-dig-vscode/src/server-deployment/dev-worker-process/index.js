"use strict";

function log4js() {
  const data = _interopRequireWildcard(require("log4js"));

  log4js = function () {
    return data;
  };

  return data;
}

function _development() {
  const data = require("../development");

  _development = function () {
    return data;
  };

  return data;
}

function _send() {
  const data = _interopRequireDefault(require("./send"));

  _send = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
 * This is a standalone program that acts as a worker process to build a
 * development package of the remote server. It communicates with a host
 * process using Node IPC.
 */
log4js().configure({
  appenders: [{
    type: require.resolve("./send-appender")
  }, {
    type: 'console'
  }]
});

function handleError(tag) {
  return error => (0, _send().default)({
    tag,
    error: error.message + '\n' + error.stack
  });
}

function sendVersion(version) {
  (0, _send().default)({
    tag: 'packageVersion',
    version
  });
}

function sendDeltaPkgData(deltaPkgData) {
  (0, _send().default)({
    tag: 'deltaPkgData',
    deltaPkgData: deltaPkgData.toString('binary')
  });
}

function sendFullPkgData(fullPkgData) {
  (0, _send().default)({
    tag: 'fullPkgData',
    fullPkgData: fullPkgData.toString('binary')
  });
}

function sendResult(result) {
  (0, _send().default)({
    tag: 'result',
    baseVersion: result.baseVersion,
    version: result.version,
    fullPkgFilename: result.fullPkgFilename,
    deltaPkgData: result.deltaPkgData != null
  });
}

async function main() {
  try {
    (0, _development().packageVersion)().then(sendVersion, handleError('packageVersion-error'));
    const result = await (0, _development().createDevZip)();
    sendResult(result);

    if (result.deltaPkgData != null) {
      result.deltaPkgData.then(sendDeltaPkgData, handleError('deltaPkgData-error'));
    }

    result.fullPkgData.then(sendFullPkgData, handleError('fullPkgData-error'));
  } catch (error) {
    handleError('result-error')(error);
  }
}

main();