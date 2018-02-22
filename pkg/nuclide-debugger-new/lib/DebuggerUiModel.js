'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WORKSPACE_VIEW_URI = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _react = _interopRequireWildcard(require('react'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _AtomServiceContainer;

function _load_AtomServiceContainer() {
  return _AtomServiceContainer = require('./AtomServiceContainer');
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

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/debugger';

const CONNECTIONS_UPDATED_EVENT = 'CONNECTIONS_UPDATED_EVENT';
const PROVIDERS_UPDATED_EVENT = 'PROVIDERS_UPDATED_EVENT';

/**
 * Atom ViewProvider compatible model object.
 */
class DebuggerModel {

  // Debugger providers
  constructor(service) {
    this._service = service;

    this._emitter = new _atom.Emitter();
    this._debuggerProviders = new Set();
    this._evaluationExpressionProviders = new Set();
    // There is always a local connection.
    this._connections = ['local'];

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._cleanUpDatatip();
    }, this._listenForProjectChange());
  }

  // Threads state


  _listenForProjectChange() {
    return atom.project.onDidChangePaths(() => {
      this._updateConnections();
    });
  }

  /**
   * Utility for getting refreshed connections.
   * TODO: refresh connections when new directories are removed/added in file-tree.
   */
  _updateConnections() {
    const connections = this._getRemoteConnections();
    // Always have one single local connection.
    connections.push('local');
    this._connections = connections;
    this._emitter.emit(CONNECTIONS_UPDATED_EVENT);
  }

  /**
   * Get remote connections without duplication.
   */
  _getRemoteConnections() {
    // TODO: move this logic into RemoteConnection package.
    return atom.project.getPaths().filter(path => {
      return (_nuclideUri || _load_nuclideUri()).default.isRemote(path);
    }).map(remotePath => {
      const { hostname } = (_nuclideUri || _load_nuclideUri()).default.parseRemoteUri(remotePath);
      return (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, '/');
    }).filter((path, index, inputArray) => {
      return inputArray.indexOf(path) === index;
    });
  }

  dispose() {
    this._disposables.dispose();
  }

  getEvaluationExpressionProviders() {
    return this._evaluationExpressionProviders;
  }

  addEvaluationExpressionProvider(provider) {
    this._evaluationExpressionProviders.add(provider);
  }

  removeEvaluationExpressionProvider(provider) {
    this._evaluationExpressionProviders.delete(provider);
  }

  addDebuggerProvider(provider) {
    this._debuggerProviders.add(provider);
    this._emitter.emit(PROVIDERS_UPDATED_EVENT);
  }

  removeDebuggerProvider(provider) {
    this._debuggerProviders.delete(provider);
  }

  /**
   * Subscribe to new connection updates from DebuggerActions.
   */
  onConnectionsUpdated(callback) {
    return this._emitter.on(CONNECTIONS_UPDATED_EVENT, callback);
  }

  onProvidersUpdated(callback) {
    return this._emitter.on(PROVIDERS_UPDATED_EVENT, callback);
  }

  getConnections() {
    return this._connections;
  }

  /**
   * Return available launch/attach provider for input connection.
   * Caller is responsible for disposing the results.
   */
  getLaunchAttachProvidersForConnection(connection) {
    const availableLaunchAttachProviders = [];
    for (const provider of this._debuggerProviders) {
      const launchAttachProvider = provider.getLaunchAttachProvider(connection);
      if (launchAttachProvider != null) {
        availableLaunchAttachProviders.push(launchAttachProvider);
      }
    }
    return availableLaunchAttachProviders;
  }

  _cleanUpDatatip() {
    if (this._threadChangeDatatip != null) {
      this._threadChangeDatatip.dispose();
      this._threadChangeDatatip = null;
    }
  }

  _notifyThreadSwitch(sourceURL, lineNumber, message) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      // TODO use
      const path = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(sourceURL);
      // we want to put the message one line above the current line unless the selected
      // line is the top line, in which case we will put the datatip next to the line.
      const notificationLineNumber = lineNumber === 0 ? 0 : lineNumber - 1;
      // only handle real files for now
      const datatipService = (0, (_AtomServiceContainer || _load_AtomServiceContainer()).getDatatipService)();
      if (datatipService != null && path != null && atom.workspace != null) {
        // This should be goToLocation instead but since the searchAllPanes option is correctly
        // provided it's not urgent.
        // eslint-disable-next-line rulesdir/atom-apis
        atom.workspace.open(path, { searchAllPanes: true }).then(function (editor) {
          const buffer = editor.getBuffer();
          const rowRange = buffer.rangeForRow(notificationLineNumber);
          _this._cleanUpDatatip();
          _this._threadChangeDatatip = datatipService.createPinnedDataTip({
            component: function () {
              return _react.createElement(
                'div',
                { className: 'nuclide-debugger-thread-switch-alert' },
                _react.createElement((_Icon || _load_Icon()).Icon, { icon: 'alert' }),
                message
              );
            },
            range: rowRange,
            pinnable: true
          }, editor);
        });
      }
    })();
  }
}
exports.default = DebuggerModel;