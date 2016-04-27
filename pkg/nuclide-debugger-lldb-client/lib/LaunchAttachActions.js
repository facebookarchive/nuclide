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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _Constants = require('./Constants');

var _AttachProcessInfo = require('./AttachProcessInfo');

var _LaunchProcessInfo = require('./LaunchProcessInfo');

var _nuclideClient = require('../../nuclide-client');

var LaunchAttachActions = (function () {
  function LaunchAttachActions(dispatcher, targetUri) {
    _classCallCheck(this, LaunchAttachActions);

    this._dispatcher = dispatcher;
    this._targetUri = targetUri;
  }

  _createClass(LaunchAttachActions, [{
    key: 'attachDebugger',
    value: function attachDebugger(attachTarget) {
      var attachInfo = new _AttachProcessInfo.AttachProcessInfo(this._targetUri, attachTarget);
      return this._startDebugging(attachInfo);
    }
  }, {
    key: 'launchDebugger',
    value: function launchDebugger(launchTarget) {
      var launchInfo = new _LaunchProcessInfo.LaunchProcessInfo(this._targetUri, launchTarget);
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
      var debuggerService = yield require('../../nuclide-service-hub-plus').consumeFirstProvider('nuclide-debugger.remote');
      yield debuggerService.startDebugging(processInfo);
    })
  }, {
    key: 'updateAttachTargetList',
    value: _asyncToGenerator(function* () {
      var rpcService = (0, _nuclideClient.getServiceByNuclideUri)('LLDBDebuggerRpcService', this._targetUri);
      (0, _assert2['default'])(rpcService);
      var attachTargetList = yield rpcService.getAttachTargetInfoList();
      this._emitNewAction(_Constants.LaunchAttachActionCode.UPDATE_ATTACH_TARGET_LIST, attachTargetList);
    })
  }, {
    key: '_emitNewAction',
    value: function _emitNewAction(actionType, data) {
      this._dispatcher.dispatch({
        actionType: actionType,
        data: data
      });
    }
  }]);

  return LaunchAttachActions;
})();

exports.LaunchAttachActions = LaunchAttachActions;