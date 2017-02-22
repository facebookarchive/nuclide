'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDebuggerProvider = createDebuggerProvider;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _IwdpLaunchAttachProvider;

function _load_IwdpLaunchAttachProvider() {
  return _IwdpLaunchAttachProvider = require('./IwdpLaunchAttachProvider');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createDebuggerProvider() {
  return {
    name: 'Mobile JS',
    getLaunchAttachProvider: connection => {
      if ((_nuclideUri || _load_nuclideUri()).default.isLocal(connection)) {
        return new (_IwdpLaunchAttachProvider || _load_IwdpLaunchAttachProvider()).IwdpLaunchAttachProvider('Mobile JS', connection);
      } else {
        return null;
      }
    }
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */