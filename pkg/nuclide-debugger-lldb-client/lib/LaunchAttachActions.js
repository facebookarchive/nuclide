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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _Constants2;

function _Constants() {
  return _Constants2 = require('./Constants');
}

var _AttachProcessInfo2;

function _AttachProcessInfo() {
  return _AttachProcessInfo2 = require('./AttachProcessInfo');
}

var _LaunchProcessInfo2;

function _LaunchProcessInfo() {
  return _LaunchProcessInfo2 = require('./LaunchProcessInfo');
}

var _nuclideClient2;

function _nuclideClient() {
  return _nuclideClient2 = require('../../nuclide-client');
}

var _commonsAtomConsumeFirstProvider2;

function _commonsAtomConsumeFirstProvider() {
  return _commonsAtomConsumeFirstProvider2 = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var ATTACH_TARGET_LIST_REFRESH_INTERVAL = 2000;

var LaunchAttachActions = (function () {
  function LaunchAttachActions(dispatcher, targetUri) {
    _classCallCheck(this, LaunchAttachActions);

    this._dispatcher = dispatcher;
    this._targetUri = targetUri;
    this._refreshTimerId = null;
    this._dialogVisible = true; // visible by default.
    this.updateAttachTargetList = this.updateAttachTargetList.bind(this);
    this._handleLaunchAttachDialogToggle = this._handleLaunchAttachDialogToggle.bind(this);
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable(atom.commands.add('atom-workspace', {
      // eslint-disable-next-line nuclide-internal/command-menu-items
      'nuclide-debugger:toggle-launch-attach': this._handleLaunchAttachDialogToggle
    }));
    this._setTimerEnabledState(true);
  }

  _createClass(LaunchAttachActions, [{
    key: '_handleLaunchAttachDialogToggle',
    value: function _handleLaunchAttachDialogToggle() {
      this._dialogVisible = !this._dialogVisible;
      this._setTimerEnabledState(this._dialogVisible);
      // Fire and forget.
      this.updateAttachTargetList();
    }
  }, {
    key: '_setTimerEnabledState',
    value: function _setTimerEnabledState(enabled) {
      if (enabled) {
        this._refreshTimerId = setInterval(this.updateAttachTargetList, ATTACH_TARGET_LIST_REFRESH_INTERVAL);
      } else if (this._refreshTimerId != null) {
        clearTimeout(this._refreshTimerId);
      }
    }
  }, {
    key: 'attachDebugger',
    value: function attachDebugger(attachTarget) {
      var attachInfo = new (_AttachProcessInfo2 || _AttachProcessInfo()).AttachProcessInfo(this._targetUri, attachTarget);
      return this._startDebugging(attachInfo);
    }
  }, {
    key: 'launchDebugger',
    value: function launchDebugger(launchTarget) {
      var launchInfo = new (_LaunchProcessInfo2 || _LaunchProcessInfo()).LaunchProcessInfo(this._targetUri, launchTarget);
      return this._startDebugging(launchInfo);
    }
  }, {
    key: 'toggleLaunchAttachDialog',
    value: function toggleLaunchAttachDialog() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:toggle-launch-attach');
    }
  }, {
    key: 'showDebuggerPanel',
    value: function showDebuggerPanel() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
    }
  }, {
    key: '_startDebugging',
    value: _asyncToGenerator(function* (processInfo) {
      var debuggerService = yield (0, (_commonsAtomConsumeFirstProvider2 || _commonsAtomConsumeFirstProvider()).default)('nuclide-debugger.remote');
      yield debuggerService.startDebugging(processInfo);
    })
  }, {
    key: 'updateAttachTargetList',
    value: _asyncToGenerator(function* () {
      var rpcService = (0, (_nuclideClient2 || _nuclideClient()).getServiceByNuclideUri)('LLDBDebuggerRpcService', this._targetUri);
      (0, (_assert2 || _assert()).default)(rpcService);
      var attachTargetList = yield rpcService.getAttachTargetInfoList();
      this._emitNewAction((_Constants2 || _Constants()).LaunchAttachActionCode.UPDATE_ATTACH_TARGET_LIST, attachTargetList);
    })
  }, {
    key: '_emitNewAction',
    value: function _emitNewAction(actionType, data) {
      this._dispatcher.dispatch({
        actionType: actionType,
        data: data
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return LaunchAttachActions;
})();

exports.LaunchAttachActions = LaunchAttachActions;