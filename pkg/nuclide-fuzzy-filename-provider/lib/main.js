'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _nuclideBusySignal;

function _load_nuclideBusySignal() {
  return _nuclideBusySignal = require('../../nuclide-busy-signal');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _scheduleIdleCallback;

function _load_scheduleIdleCallback() {
  return _scheduleIdleCallback = _interopRequireDefault(require('../../commons-node/scheduleIdleCallback'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _FuzzyFileNameProvider;

function _load_FuzzyFileNameProvider() {
  return _FuzzyFileNameProvider = _interopRequireDefault(require('./FuzzyFileNameProvider'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)(); /**
                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                              * All rights reserved.
                                                                              *
                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                              * the root directory of this source tree.
                                                                              *
                                                                              * 
                                                                              */

class Activation {

  constructor() {
    this._busySignalProvider = new (_nuclideBusySignal || _load_nuclideBusySignal()).BusySignalProviderBase();
    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptionsByRoot = new Map();

    this._readySearch = this._readySearch.bind(this);

    // Do search preprocessing for all existing and future root directories.
    this._readySearch(atom.project.getPaths());
    this._subscriptions.add(atom.project.onDidChangePaths(this._readySearch));
  }

  _readySearch(projectPaths) {
    // Add new project roots.
    for (const projectPath of projectPaths) {
      if (!this._subscriptionsByRoot.has(projectPath)) {
        const disposables = new _atom.CompositeDisposable(
        // Wait a bit before starting the initial search, since it's a heavy op.
        (0, (_scheduleIdleCallback || _load_scheduleIdleCallback()).default)(() => {
          this._initialSearch(projectPath).catch(err => {
            // RPC timeout errors can often happen here, but don't dispose the search.
            if (err instanceof (_nuclideRpc || _load_nuclideRpc()).RpcTimeoutError) {
              logger.warn(`Warmup fuzzy filename search for ${projectPath} hit the RPC timeout.`);
            } else {
              logger.error(`Error starting fuzzy filename search for ${projectPath}: ${err}`);
              this._disposeSearch(projectPath);
            }
          });
        }, { timeout: 5000 }));
        this._subscriptionsByRoot.set(projectPath, disposables);
      }
    }

    // Clean up removed project roots.
    for (const [projectPath] of this._subscriptionsByRoot) {
      if (!projectPaths.includes(projectPath)) {
        this._disposeSearch(projectPath);
      }
    }
  }

  _initialSearch(projectPath) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFuzzyFileSearchServiceByNuclideUri)(projectPath);
      const isAvailable = yield service.isFuzzySearchAvailableFor(projectPath);
      if (!isAvailable) {
        throw new Error('Nonexistent directory');
      }

      const disposables = _this._subscriptionsByRoot.get(projectPath);

      if (!(disposables != null)) {
        throw new Error('Invariant violation: "disposables != null"');
      }

      const busySignalDisposable = _this._busySignalProvider.displayMessage(`File search: indexing ${projectPath}`);
      disposables.add(busySignalDisposable);

      // It doesn't matter what the search term is. Empirically, doing an initial
      // search speeds up the next search much more than simply doing the setup
      // kicked off by 'fileSearchForDirectory'.
      try {
        yield service.queryFuzzyFile(projectPath, 'a', (0, (_utils || _load_utils()).getIgnoredNames)());
      } catch (err) {
        throw err;
      } finally {
        busySignalDisposable.dispose();
        disposables.remove(busySignalDisposable);
      }
    })();
  }

  _disposeSearch(projectPath) {
    try {
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFuzzyFileSearchServiceByNuclideUri)(projectPath);
      service.disposeFuzzySearch(projectPath);
    } catch (err) {
      logger.error(`Error disposing fuzzy filename service for ${projectPath}`, err);
    } finally {
      const disposables = this._subscriptionsByRoot.get(projectPath);
      if (disposables != null) {
        disposables.dispose();
        this._subscriptionsByRoot.delete(projectPath);
      }
    }
  }

  registerProvider() {
    return (_FuzzyFileNameProvider || _load_FuzzyFileNameProvider()).default;
  }

  provideBusySignal() {
    return this._busySignalProvider;
  }

  dispose() {
    this._subscriptions.dispose();
    this._subscriptionsByRoot.forEach(disposables => disposables.dispose());
    this._subscriptionsByRoot.clear();
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);