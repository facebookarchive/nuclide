'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDebuggerProvider = createDebuggerProvider;
exports.getHomeFragments = getHomeFragments;

var _HhvmLaunchAttachProvider;

function _load_HhvmLaunchAttachProvider() {
  return _HhvmLaunchAttachProvider = require('./HhvmLaunchAttachProvider');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
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

function createDebuggerProvider() {
  return {
    name: 'hhvm',
    getLaunchAttachProvider(connection) {
      if ((_nuclideUri || _load_nuclideUri()).default.isRemote(connection)) {
        return new (_HhvmLaunchAttachProvider || _load_HhvmLaunchAttachProvider()).HhvmLaunchAttachProvider('Hack / PHP', connection);
      }
      return null;
    }
  };
}

function getHomeFragments() {
  return {
    feature: {
      title: 'PHP Debugger',
      icon: 'nuclicon-debugger',
      description: 'Connect to a PHP server process and debug Hack code from within Nuclide.',
      command: 'nuclide-debugger:show-attach-dialog'
    },
    priority: 6
  };
}