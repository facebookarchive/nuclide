"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHHVMRuntimeArgs = getHHVMRuntimeArgs;
exports.getHhvmStackTraces = getHhvmStackTraces;
exports.getRestartInstructions = getRestartInstructions;
exports.DEVSERVER_HHVM_PATH = void 0;

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const DEVSERVER_HHVM_PATH = '/usr/local/hphpi/bin/hhvm';
exports.DEVSERVER_HHVM_PATH = DEVSERVER_HHVM_PATH;

function getHHVMRuntimeArgs(launchConfig) {
  if (launchConfig.hhvmRuntimeArgs.some(s => s === '-c' || s === '--config')) {
    return launchConfig.hhvmRuntimeArgs;
  }

  return ['-c', '/usr/local/hphpi/cli.hdf'].concat(...launchConfig.hhvmRuntimeArgs);
}

async function getHhvmStackTraces() {
  const STACK_TRACE_LOCATION = '/var/tmp/cores/';
  const STACK_TRACE_PATTERN = /stacktrace\..+\.log/;
  const fileNames = await _fsPromise().default.readdir(STACK_TRACE_LOCATION);
  return fileNames.filter(fileName => STACK_TRACE_PATTERN.exec(fileName) != null).map(fileName => _nuclideUri().default.join(STACK_TRACE_LOCATION, fileName));
}

function getRestartInstructions() {
  return 'Nuclide was unable to connect to your HHVM instance. Please wait ' + 'a few moments and try again. If your webserver instance is still not ' + 'responding, you can run `sudo webserver restart` from a terminal to restart it.';
}