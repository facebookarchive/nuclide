'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LaunchAttachActions = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ATTACH_TARGET_LIST_REFRESH_INTERVAL = 2000;let LaunchAttachActions = exports.LaunchAttachActions = class LaunchAttachActions {

  constructor(dispatcher, targetUri) {
    this._dispatcher = dispatcher;
    this._targetUri = targetUri;
    this._refreshTimerId = null;
    this._dialogVisible = true; // visible by default.
    this.updateAttachTargetList = this.updateAttachTargetList.bind(this);
    this._handleLaunchAttachDialogToggle = this._handleLaunchAttachDialogToggle.bind(this);
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('atom-workspace', {
      // eslint-disable-next-line nuclide-internal/atom-commands
      'nuclide-debugger:toggle-launch-attach': this._handleLaunchAttachDialogToggle
    }), () => {
      if (this._refreshTimerId != null) {
        clearTimeout(this._refreshTimerId);
        this._refreshTimerId = null;
      }
    });
    this._setTimerEnabledState(true);
  }

  _handleLaunchAttachDialogToggle() {
    this._dialogVisible = !this._dialogVisible;
    this._setTimerEnabledState(this._dialogVisible);
    // Fire and forget.
    this.updateAttachTargetList();
  }

  _setTimerEnabledState(enabled) {
    if (enabled) {
      this._refreshTimerId = setInterval(this.updateAttachTargetList, ATTACH_TARGET_LIST_REFRESH_INTERVAL);
    } else if (this._refreshTimerId != null) {
      clearTimeout(this._refreshTimerId);
    }
  }

  attachDebugger(attachTarget) {
    const attachInfo = new (_NodeAttachProcessInfo || _load_NodeAttachProcessInfo()).NodeAttachProcessInfo(this._targetUri, attachTarget);
    return this._startDebugging(attachInfo);
  }

  toggleLaunchAttachDialog() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:toggle-launch-attach');
  }

  showDebuggerPanel() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
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
      const rpcService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getNodeDebuggerServiceByNuclideUri)(_this._targetUri);
      const attachTargetList = yield rpcService.getAttachTargetInfoList();
      _this._dispatcher.dispatch({
        actionType: (_LaunchAttachDispatcher || _load_LaunchAttachDispatcher()).ActionTypes.UPDATE_ATTACH_TARGET_LIST,
        attachTargetInfos: attachTargetList
      });
    })();
  }

  dispose() {
    this._subscriptions.dispose();
  }
};