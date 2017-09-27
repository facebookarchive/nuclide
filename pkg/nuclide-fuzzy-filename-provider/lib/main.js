'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
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

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
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

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-fuzzy-filename-provider');

/**
 * A fallback provider for when the initial query hasn't come back yet.
 */


class Activation {

  constructor() {
    this._readySearch = this._readySearch.bind(this);

    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._subscriptionsByRoot = new Map();

    // Do search preprocessing for all existing and future root directories.
    this._readySearch(atom.project.getPaths());
    this._subscriptions.add(atom.project.onDidChangePaths(this._readySearch));
  }

  _readySearch(projectPaths) {
    // Add new project roots.
    for (const projectPath of projectPaths) {
      if (!this._subscriptionsByRoot.has(projectPath)) {
        const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(
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

      const busySignalDisposable = _this._busySignalService == null ? new (_UniversalDisposable || _load_UniversalDisposable()).default() : _this._busySignalService.reportBusy(`File search: indexing ${projectPath}`);
      disposables.add(busySignalDisposable);

      // It doesn't matter what the search term is. Empirically, doing an initial
      // search speeds up the next search much more than simply doing the setup
      // kicked off by 'fileSearchForDirectory'.
      try {
        yield service.queryFuzzyFile(projectPath, 'a', (0, (_utils || _load_utils()).getIgnoredNames)());
      } catch (err) {
        throw err;
      } finally {
        disposables.dispose();
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
    var _this2 = this;

    return Object.assign({}, (_FuzzyFileNameProvider || _load_FuzzyFileNameProvider()).default, {
      executeQuery: (() => {
        var _ref = (0, _asyncToGenerator.default)(function* (query, directory) {
          const initialDisposable = _this2._subscriptionsByRoot.get(directory.getPath());
          // If the initial query is still executing, use the fallback provider.
          if (initialDisposable != null && !initialDisposable.disposed && _this2._fallbackProvider != null) {
            const results = yield _this2._fallbackProvider.executeQuery(query, directory);
            if (results != null && results.length > 0) {
              return results;
            }
          }
          return (_FuzzyFileNameProvider || _load_FuzzyFileNameProvider()).default.executeQuery(query, directory);
        });

        return function executeQuery(_x, _x2) {
          return _ref.apply(this, arguments);
        };
      })()
    });
  }

  consumeBusySignal(service) {
    this._busySignalService = service;
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._busySignalService = null;
    });
  }

  consumeFallbackProvider(provider) {
    this._fallbackProvider = provider;
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._fallbackProvider = null;
    });
  }

  dispose() {
    this._subscriptions.dispose();
    this._subscriptionsByRoot.forEach(disposables => disposables.dispose());
    this._subscriptionsByRoot.clear();
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);