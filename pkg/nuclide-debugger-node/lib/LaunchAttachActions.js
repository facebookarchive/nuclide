'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LaunchAttachActions = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _LaunchAttachDispatcher;

function _load_LaunchAttachDispatcher() {
  return _LaunchAttachDispatcher = require('./LaunchAttachDispatcher');
}

var _NodeAttachProcessInfo;

function _load_NodeAttachProcessInfo() {
  return _NodeAttachProcessInfo = require('./NodeAttachProcessInfo');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LaunchAttachActions extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).LaunchAttachActionsBase {

  constructor(dispatcher, targetUri) {
    super(targetUri);
    this._dispatcher = dispatcher;
  }

  attachDebugger(attachTarget) {
    const attachInfo = new (_NodeAttachProcessInfo || _load_NodeAttachProcessInfo()).NodeAttachProcessInfo(this.getTargetUri(), attachTarget);
    return this._startDebugging(attachInfo);
  }

  _startDebugging(processInfo) {
    return (0, _asyncToGenerator.default)(function* () {
      const debuggerService = yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote');
      yield debuggerService.startDebugging(processInfo);
    })();
  }

  updateAttachTargetList() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const rpcService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getNodeDebuggerServiceByNuclideUri)(_this.getTargetUri());
      const attachTargetList = yield rpcService.getAttachTargetInfoList();
      _this._dispatcher.dispatch({
        actionType: (_LaunchAttachDispatcher || _load_LaunchAttachDispatcher()).ActionTypes.UPDATE_ATTACH_TARGET_LIST,
        attachTargetInfos: attachTargetList
      });
    })();
  }
}
exports.LaunchAttachActions = LaunchAttachActions; /**
                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                    * All rights reserved.
                                                    *
                                                    * This source code is licensed under the license found in the LICENSE file in
                                                    * the root directory of this source tree.
                                                    *
                                                    * 
                                                    */