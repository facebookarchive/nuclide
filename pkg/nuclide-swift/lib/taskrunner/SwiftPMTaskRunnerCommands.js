'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildCommand = buildCommand;
exports.testCommand = testCommand;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildCommand(chdir, configuration, Xcc, Xlinker, Xswiftc, buildPath) {
  const commandArgs = ['build', '--chdir', chdir, '--configuration', configuration];
  if (Xcc.length > 0) {
    commandArgs.push('-Xcc', Xcc);
  }
  if (Xlinker.length > 0) {
    commandArgs.push('-Xlinker', Xlinker);
  }
  if (Xswiftc.length > 0) {
    commandArgs.push('-Xswiftc', Xswiftc);
  }
  if (buildPath.length > 0) {
    commandArgs.push('--build-path', buildPath);
  }
  return {
    command: _swiftPath(),
    args: commandArgs
  };
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

function testCommand(chdir, buildPath) {
  const commandArgs = ['test', '--chdir', chdir];
  if (buildPath.length > 0) {
    commandArgs.push('--build-path', buildPath);
  }
  return {
    command: _swiftPath(),
    args: commandArgs
  };
}

function _swiftPath() {
  const path = (_featureConfig || _load_featureConfig()).default.get('nuclide-swift.swiftToolchainPath');
  if (path) {
    return `${path}/usr/bin/swift`;
  }

  if (process.platform === 'darwin') {
    return '/Library/Developer/Toolchains/swift-latest.xctoolchain/usr/bin/swift';
  }

  return 'swift';
}