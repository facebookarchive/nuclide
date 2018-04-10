'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _destroyItemWhere;

function _load_destroyItemWhere() {
  return _destroyItemWhere = require('nuclide-commons-atom/destroyItemWhere');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _AtomServiceContainer;

function _load_AtomServiceContainer() {
  return _AtomServiceContainer = require('./AtomServiceContainer');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RemoteControlService {

  constructor(service) {
    this._service = service;
  }

  startDebugging(processInfo) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const instance = _this._startVspDebugging(processInfo.getProcessConfig());

      processInfo.setVspDebuggerInstance(instance);

      const { focusedProcess } = _this._service.viewModel;

      if (!(focusedProcess != null)) {
        throw new Error('Invariant violation: "focusedProcess != null"');
      }

      const disposable = _this._service.viewModel.onDidFocusProcess(function () {
        if (!_this._service.getModel().getProcesses().includes(focusedProcess)) {
          processInfo.dispose();
          disposable.dispose();
        }
      });
    })();
  }

  _startVspDebugging(config) {
    this._service.startDebugging(config);

    const { viewModel } = this._service;
    const { focusedProcess } = viewModel;

    if (!(focusedProcess != null)) {
      throw new Error('Invariant violation: "focusedProcess != null"');
    }

    const isFocusedProcess = () => {
      return this._service.getDebuggerMode() !== (_constants || _load_constants()).DebuggerMode.STOPPED && viewModel.focusedProcess === focusedProcess;
    };

    const customRequest = (() => {
      var _ref = (0, _asyncToGenerator.default)(function* (request, args) {
        if (!isFocusedProcess()) {
          throw new Error('Cannot send custom requests to a no longer active debug session!');
        }
        return focusedProcess.session.custom(request, args);
      });

      return function customRequest(_x, _x2) {
        return _ref.apply(this, arguments);
      };
    })();

    const observeCustomEvents = () => {
      if (!isFocusedProcess()) {
        throw new Error('Cannot send custom requests to a no longer active debug session!');
      }
      return focusedProcess.session.observeCustomEvents();
    };

    return Object.freeze({
      customRequest,
      observeCustomEvents
    });
  }

  canLaunchDebugTargetInTerminal(targetUri) {
    return (0, (_AtomServiceContainer || _load_AtomServiceContainer()).getTerminalService)() != null;
  }

  launchDebugTargetInTerminal(targetUri, command, args, cwd, environmentVariables) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const terminalApi = (0, (_AtomServiceContainer || _load_AtomServiceContainer()).getTerminalService)();
      if (terminalApi == null) {
        throw new Error('Cannot launch terminal without the terminal service');
      }
      const key = `targetUri=${targetUri}&command=${command}`;
      const info = {
        cwd,
        title: 'Debug output: ' + (_nuclideUri || _load_nuclideUri()).default.getPath(targetUri),
        key,
        command: {
          file: command,
          args
        },
        remainOnCleanExit: true,
        icon: 'nuclicon-debugger',
        defaultLocation: 'bottom',
        environmentVariables,
        preservedCommands: ['debugger:continue-debugging', 'debugger:stop-debugging', 'debugger:restart-debugging', 'debugger:step-over', 'debugger:step-into', 'debugger:step-out']
      };

      const infoUri = terminalApi.uriFromInfo(info);

      // Ensure any previous instances of this same target are closed before
      // opening a new terminal tab. We don't want them to pile up if the
      // user keeps running the same app over and over.
      (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(function (item) {
        if (item.getURI == null || item.getURI() == null) {
          return false;
        }

        const uri = (0, (_nullthrows || _load_nullthrows()).default)(item.getURI());
        try {
          // Only close terminal tabs with the same title and target binary.
          const otherInfo = terminalApi.infoFromUri(uri);
          return otherInfo.key === key;
        } catch (e) {}
        return false;
      });

      yield (0, (_goToLocation || _load_goToLocation()).goToLocation)(infoUri);

      const terminalPane = (0, (_nullthrows || _load_nullthrows()).default)(atom.workspace.paneForURI(infoUri));
      const terminal = (0, (_nullthrows || _load_nullthrows()).default)(terminalPane.itemForURI(infoUri));

      // Ensure the debugger is terminated if the process running inside the
      // terminal exits, and that the terminal destroys if the debugger stops.

      const disposable = _this2._service.onDidChangeMode(function (mode) {
        if (mode === (_constants || _load_constants()).DebuggerMode.STOPPED) {
          // This termination path is invoked if the debugger dies first, ensuring
          // we terminate the target process. This can happen if the user hits stop,
          // or if the debugger crashes.
          terminal.setProcessExitCallback(function () {});
          terminal.terminateProcess();
          disposable.dispose();
        }
      });

      terminal.setProcessExitCallback(function () {
        // This callback is invoked if the target process dies first, ensuring
        // we tear down the debugger.
        disposable.dispose();
        _this2._service.stopProcess();
      });
    })();
  }
}
exports.default = RemoteControlService; /**
                                         * Copyright (c) 2017-present, Facebook, Inc.
                                         * All rights reserved.
                                         *
                                         * This source code is licensed under the BSD-style license found in the
                                         * LICENSE file in the root directory of this source tree. An additional grant
                                         * of patent rights can be found in the PATENTS file in the same directory.
                                         *
                                         * 
                                         * @format
                                         */