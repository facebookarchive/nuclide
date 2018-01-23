'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LaunchAttachActions = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _AttachProcessInfo;

function _load_AttachProcessInfo() {
  return _AttachProcessInfo = require('./AttachProcessInfo');
}

var _LaunchProcessInfo;

function _load_LaunchProcessInfo() {
  return _LaunchProcessInfo = require('./LaunchProcessInfo');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var _LaunchAttachDispatcher;

function _load_LaunchAttachDispatcher() {
  return _LaunchAttachDispatcher = require('./LaunchAttachDispatcher');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ATTACH_TARGET_LIST_REFRESH_INTERVAL = 2000; /**
                                                   * Copyright (c) 2015-present, Facebook, Inc.
                                                   * All rights reserved.
                                                   *
                                                   * This source code is licensed under the license found in the LICENSE file in
                                                   * the root directory of this source tree.
                                                   *
                                                   * 
                                                   * @format
                                                   */

class LaunchAttachActions {

  constructor(dispatcher, targetUri) {
    this._dispatcher = dispatcher;
    this._targetUri = targetUri;
    this._refreshTimerId = null;
    this._parentUIVisible = true; // Visible by default.
    this._attachUIVisible = false;
    this.updateAttachUIVisibility = this.updateAttachUIVisibility.bind(this);
    this.updateParentUIVisibility = this.updateParentUIVisibility.bind(this);
    this.updateAttachTargetList = this.updateAttachTargetList.bind(this);
  }

  attachDebugger(attachTarget) {
    const attachInfo = new (_AttachProcessInfo || _load_AttachProcessInfo()).AttachProcessInfo(this.getTargetUri(), attachTarget);
    return this._startDebugging(attachInfo);
  }

  launchDebugger(launchTarget) {
    const launchInfo = new (_LaunchProcessInfo || _load_LaunchProcessInfo()).LaunchProcessInfo(this.getTargetUri(), launchTarget);
    return this._startDebugging(launchInfo);
  }

  _startDebugging(processInfo) {
    return (0, _asyncToGenerator.default)(function* () {
      const debuggerService = yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote');
      yield debuggerService.startDebugging(processInfo);
    })();
  }

  // Override.
  updateAttachTargetList() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const rpcService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('NativeDebuggerService', _this.getTargetUri());

      if (!rpcService) {
        throw new Error('Invariant violation: "rpcService"');
      }

      const attachTargetList = yield rpcService.getAttachTargetInfoList();
      _this._dispatcher.dispatch({
        actionType: (_LaunchAttachDispatcher || _load_LaunchAttachDispatcher()).ActionTypes.UPDATE_ATTACH_TARGET_LIST,
        attachTargetInfos: attachTargetList
      });
    })();
  }

  getTargetUri() {
    return this._targetUri;
  }

  updateParentUIVisibility(visible) {
    this._parentUIVisible = visible;
    this._updateAutoRefresh();
  }

  updateAttachUIVisibility(visible) {
    this._attachUIVisible = visible;
    this._updateAutoRefresh();
  }

  _updateAutoRefresh() {
    this._killAutoRefreshTimer();
    if (this._parentUIVisible && this._attachUIVisible) {
      this.updateAttachTargetList();
      this._refreshTimerId = setInterval(this.updateAttachTargetList, ATTACH_TARGET_LIST_REFRESH_INTERVAL);
    }
  }

  _killAutoRefreshTimer() {
    if (this._refreshTimerId != null) {
      clearInterval(this._refreshTimerId);
      this._refreshTimerId = null;
    }
  }

  toggleLaunchAttachDialog() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:toggle-launch-attach');
  }

  showDebuggerPanel() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  }

  dispose() {
    this._killAutoRefreshTimer();
  }
}
exports.LaunchAttachActions = LaunchAttachActions;