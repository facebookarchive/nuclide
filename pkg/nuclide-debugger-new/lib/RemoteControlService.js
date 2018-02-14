'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class RemoteControlService {

  constructor(service) {
    this._service = service;
  }

  startDebugging(processInfo) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this._startVspDebugging({
        debuggerName: processInfo._serviceName,
        targetUri: processInfo.getTargetUri(),
        debugMode: processInfo._debugMode,
        adapterType: processInfo._adapterType,
        adapterExecutable: processInfo._adapterExecutable,
        capabilities: processInfo.getDebuggerCapabilities(),
        properties: processInfo.getDebuggerProps(),
        config: processInfo._config
      });
    })();
  }

  getCurrentDebuggerName() {
    const { focusedProcess } = this._service.viewModel;
    if (focusedProcess == null) {
      return null;
    } else {
      return focusedProcess.configuration.debuggerName;
    }
  }

  _startVspDebugging(config) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this2._service.startDebugging(config);
      const { viewModel } = _this2._service;
      const { focusedProcess } = viewModel;

      if (!(focusedProcess != null)) {
        throw new Error('Invariant violation: "focusedProcess != null"');
      }

      const isFocussedProcess = function () {
        return _this2._service.getDebuggerMode() !== (_constants || _load_constants()).DebuggerMode.STOPPED && viewModel.focusedProcess === focusedProcess;
      };

      const customRequest = (() => {
        var _ref = (0, _asyncToGenerator.default)(function* (request, args) {
          if (!isFocussedProcess()) {
            throw new Error('Cannot send custom requests to a no longer active debug session!');
          }
          return focusedProcess.session.custom(request, args);
        });

        return function customRequest(_x, _x2) {
          return _ref.apply(this, arguments);
        };
      })();

      const observeCustomEvents = function () {
        if (!isFocussedProcess()) {
          throw new Error('Cannot send custom requests to a no longer active debug session!');
        }
        return focusedProcess.session.observeCustomEvents();
      };

      return {
        customRequest,
        observeCustomEvents
      };
    })();
  }

  canLaunchDebugTargetInTerminal(targetUri) {
    // Launcing in terminal isn't yet supported
    return false;
  }

  launchDebugTargetInTerminal(targetUri, command, args, cwd, environmentVariables) {
    return (0, _asyncToGenerator.default)(function* () {
      throw new Error('TODO: Add support for launching in terminal');
    })();
  }
}
exports.default = RemoteControlService;