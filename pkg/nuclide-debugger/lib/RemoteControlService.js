'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _destroyItemWhere;

function _load_destroyItemWhere() {
  return _destroyItemWhere = require('nuclide-commons-atom/destroyItemWhere');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

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

  /**
   * @param getModel function always returning the latest singleton model.
   *
   * NB: Deactivating and reactivating will result in a new Model instance (and
   * new instances of everything else). This object exists in other packages
   * outside of any model, so objects vended early must still always manipulate
   * the latest model's state.
   */
  constructor(getModel) {
    this._getModel = getModel;
  }

  startDebugging(processInfo) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const model = _this._getModel();
      if (model == null) {
        throw new Error('Package is not activated.');
      }
      yield model.getActions().startDebugging(processInfo);
    })();
  }

  toggleBreakpoint(filePath, line) {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    model.getActions().toggleBreakpoint(filePath, line);
  }

  addBreakpoint(filePath, line) {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    model.getActions().addBreakpoint(filePath, line);
  }

  isInDebuggingMode(providerName) {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    const session = model.getStore().getDebuggerInstance();
    return session != null && session.getProviderName() === providerName;
  }

  getDebuggerInstance() {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    return model.getStore().getDebuggerInstance();
  }

  killDebugger() {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    model.getActions().stopDebugging();
  }

  getTerminal() {
    try {
      // $FlowFB
      const terminalUri = require('../../commons-node/nuclide-terminal-uri');
      return terminalUri;
    } catch (_) {
      return null;
    }
  }

  canLaunchDebugTargetInTerminal(targetUri) {
    // The terminal is not supported on Windows.
    return ((_nuclideUri || _load_nuclideUri()).default.isRemote(targetUri) || process.platform !== 'win32') && this.getTerminal() != null;
  }

  launchDebugTargetInTerminal(targetUri, command, args, cwd, environmentVariables) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const terminalUri = _this2.getTerminal();
      if (terminalUri == null) {
        return false;
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
        preservedCommands: ['nuclide-debugger:continue-debugging', 'nuclide-debugger:stop-debugging', 'nuclide-debugger:restart-debugging', 'nuclide-debugger:step-over', 'nuclide-debugger:step-into', 'nuclide-debugger:step-out']
      };

      const infoUri = terminalUri.uriFromInfo(info);

      // Ensure any previous instances of this same target are closed before
      // opening a new terminal tab. We don't want them to pile up if the
      // user keeps running the same app over and over.
      (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(function (item) {
        if (item.getURI == null) {
          return false;
        }

        const uri = item.getURI();
        try {
          // Only close terminal tabs with the same title and target binary.
          const otherInfo = terminalUri.infoFromUri(uri);
          return otherInfo.key === key;
        } catch (e) {}
        return false;
      });

      yield (0, (_goToLocation || _load_goToLocation()).goToLocation)(infoUri);

      const terminalPane = (0, (_nullthrows || _load_nullthrows()).default)(atom.workspace.paneForURI(infoUri));
      const terminal = (0, (_nullthrows || _load_nullthrows()).default)(terminalPane.itemForURI(infoUri));

      // Ensure the debugger is terminated if the process running inside the
      // terminal exits, and that the terminal destroys if the debugger stops.
      const model = _this2._getModel();
      if (model == null) {
        throw new Error('Package is not activated.');
      }

      const disposable = model.getStore().onDebuggerModeChange(function () {
        const debuggerModel = _this2._getModel();

        if (!(debuggerModel != null)) {
          throw new Error('Invariant violation: "debuggerModel != null"');
        }

        const debuggerMode = debuggerModel.getStore().getDebuggerMode();
        if (debuggerMode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED) {
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
        _this2.killDebugger();
      });

      return true;
    })();
  }
}
exports.default = RemoteControlService;