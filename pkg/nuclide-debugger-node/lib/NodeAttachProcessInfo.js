'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodeAttachProcessInfo = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class NodeAttachProcessInfo extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerProcessInfo {

  constructor(targetUri, targetInfo) {
    super('node', targetUri);
    this._targetInfo = targetInfo;
  }

  debug() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const rpcService = _this._getRpcService();
      yield rpcService.attach(_this._targetInfo);
      return new (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerInstance(_this, rpcService);
    })();
  }

  _getRpcService() {
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getNodeDebuggerServiceByNuclideUri)(this.getTargetUri());
    return new service.NodeDebuggerService();
  }
}
exports.NodeAttachProcessInfo = NodeAttachProcessInfo; /**
                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                        * All rights reserved.
                                                        *
                                                        * This source code is licensed under the license found in the LICENSE file in
                                                        * the root directory of this source tree.
                                                        *
                                                        * 
                                                        */