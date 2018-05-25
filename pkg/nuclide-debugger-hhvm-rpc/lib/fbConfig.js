'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEVSERVER_HHVM_PATH = undefined;
exports.getHHVMRuntimeArgs = getHHVMRuntimeArgs;
exports.getHhvmStackTraces = getHhvmStackTraces;
exports.getRestartInstructions = getRestartInstructions;

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEVSERVER_HHVM_PATH = exports.DEVSERVER_HHVM_PATH = '/usr/local/hphpi/bin/hhvm'; /**
                                                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                                                        * All rights reserved.
                                                                                        *
                                                                                        * This source code is licensed under the license found in the LICENSE file in
                                                                                        * the root directory of this source tree.
                                                                                        *
                                                                                        * 
                                                                                        * @format
                                                                                        */

function getHHVMRuntimeArgs(launchConfig) {
  if (launchConfig.hhvmRuntimeArgs.some(s => s === '-c' || s === '--config')) {
    return launchConfig.hhvmRuntimeArgs;
  }

  return ['-c', '/usr/local/hphpi/cli.hdf'].concat(...launchConfig.hhvmRuntimeArgs);
}

async function getHhvmStackTraces() {
  const STACK_TRACE_LOCATION = '/var/tmp/cores/';
  const STACK_TRACE_PATTERN = /stacktrace\..+\.log/;
  const fileNames = await (_fsPromise || _load_fsPromise()).default.readdir(STACK_TRACE_LOCATION);
  return fileNames.filter(fileName => STACK_TRACE_PATTERN.exec(fileName) != null).map(fileName => (_nuclideUri || _load_nuclideUri()).default.join(STACK_TRACE_LOCATION, fileName));
}

function getRestartInstructions() {
  return 'Nuclide was unable to connect to your HHVM instance. Please wait ' + 'a few moments and try again. If your webserver instance is still not ' + 'responding, you can run `sudo webserver restart` from a terminal to restart it.';
}