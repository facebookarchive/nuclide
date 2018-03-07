'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHHVMRuntimeArgs = getHHVMRuntimeArgs;
function getHHVMRuntimeArgs(launchConfig) {
  if (launchConfig.hhvmRuntimeArgs.some(s => s === '-c' || s === '--config')) {
    return launchConfig.hhvmRuntimeArgs;
  }

  return ['-c', '/usr/local/hphpi/cli.hdf'].concat(...launchConfig.hhvmRuntimeArgs);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */