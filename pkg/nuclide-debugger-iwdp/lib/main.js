Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.createDebuggerProvider = createDebuggerProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _IwdpLaunchAttachProvider;

function _load_IwdpLaunchAttachProvider() {
  return _IwdpLaunchAttachProvider = require('./IwdpLaunchAttachProvider');
}

function createDebuggerProvider() {
  return {
    name: 'IWDP',
    getLaunchAttachProvider: function getLaunchAttachProvider(connection) {
      if ((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isLocal(connection)) {
        return new (_IwdpLaunchAttachProvider || _load_IwdpLaunchAttachProvider()).IwdpLaunchAttachProvider('iOS Webkit Debug Proxy', connection);
      } else {
        return null;
      }
    }
  };
}