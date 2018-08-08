"use strict";

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _scheduleIdleCallback() {
  const data = _interopRequireDefault(require("../../commons-node/scheduleIdleCallback"));

  _scheduleIdleCallback = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _nuclideRpc() {
  const data = require("../../nuclide-rpc");

  _nuclideRpc = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _FuzzyFileNameProvider() {
  const data = _interopRequireDefault(require("./FuzzyFileNameProvider"));

  _FuzzyFileNameProvider = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _passesGK() {
  const data = require("../../commons-node/passesGK");

  _passesGK = function () {
    return data;
  };

  return data;
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
const logger = (0, _log4js().getLogger)('nuclide-fuzzy-filename-provider');
/**
 * A fallback provider for when the initial query hasn't come back yet.
 */

class Activation {
  constructor() {
    this._readySearch = this._readySearch.bind(this);
    this._subscriptions = new (_UniversalDisposable().default)();
    this._subscriptionsByRoot = new Map(); // Do search preprocessing for all existing and future root directories.

    this._readySearch(atom.project.getPaths());

    this._subscriptions.add(atom.project.onDidChangePaths(this._readySearch));
  }

  _readySearch(projectPaths) {
    // Add new project roots.
    for (const projectPath of projectPaths) {
      if (!this._subscriptionsByRoot.has(projectPath)) {
        const disposables = new (_UniversalDisposable().default)( // Wait a bit before starting the initial search, since it's a heavy op.
        (0, _scheduleIdleCallback().default)(() => {
          this._initialSearch(projectPath).catch(err => {
            // RPC timeout errors can often happen here, but don't dispose the search.
            if (err instanceof _nuclideRpc().RpcTimeoutError) {
              logger.warn(`Warmup fuzzy filename search for ${projectPath} hit the RPC timeout.`);
            } else {
              logger.error(`Error starting fuzzy filename search for ${projectPath}:`, err);

              this._disposeSearch(projectPath);
            }
          });
        }, {
          timeout: 5000
        }));

        this._subscriptionsByRoot.set(projectPath, disposables);
      }
    } // Clean up removed project roots.


    for (const [projectPath] of this._subscriptionsByRoot) {
      if (!projectPaths.includes(projectPath)) {
        this._disposeSearch(projectPath);
      }
    }
  }

  async _initialSearch(projectPath) {
    const service = (0, _nuclideRemoteConnection().getFuzzyFileSearchServiceByNuclideUri)(projectPath);
    const isAvailable = await service.isFuzzySearchAvailableFor(projectPath);

    if (!isAvailable) {
      throw new Error('Nonexistent directory');
    }

    const disposables = this._subscriptionsByRoot.get(projectPath);

    if (!(disposables != null)) {
      throw new Error("Invariant violation: \"disposables != null\"");
    }

    const busySignalDisposable = this._busySignalService == null ? new (_UniversalDisposable().default)() : this._busySignalService.reportBusy(`File search: indexing ${projectPath}`);
    disposables.add(busySignalDisposable); // It doesn't matter what the search term is. Empirically, doing an initial
    // search speeds up the next search much more than simply doing the setup
    // kicked off by 'fileSearchForDirectory'.
    //
    // We use an unlikely queryString so it is easy to filter out from metrics.

    try {
      await service.queryFuzzyFile({
        rootDirectory: projectPath,
        queryString: '^^^',
        ignoredNames: (0, _utils().getIgnoredNames)(),
        preferCustomSearch: Boolean((0, _passesGK().isGkEnabled)('nuclide_prefer_myles_search')),
        context: null
      });
    } catch (err) {
      throw err;
    } finally {
      disposables.dispose();
    }
  }

  _disposeSearch(projectPath) {
    try {
      const service = (0, _nuclideRemoteConnection().getFuzzyFileSearchServiceByNuclideUri)(projectPath);
      service.disposeFuzzySearch(projectPath);
    } catch (err) {// Ignore errors here; this is pretty best-effort anyway.
    } finally {
      const disposables = this._subscriptionsByRoot.get(projectPath);

      if (disposables != null) {
        disposables.dispose();

        this._subscriptionsByRoot.delete(projectPath);
      }
    }
  }

  registerProvider() {
    return Object.assign({}, _FuzzyFileNameProvider().default, {
      executeQuery: async (query, directory) => {
        const initialDisposable = this._subscriptionsByRoot.get(directory.getPath()); // If the initial query is still executing, use the fallback provider.


        if (initialDisposable != null && !initialDisposable.disposed && this._fallbackProvider != null) {
          const results = await this._fallbackProvider.executeQuery(query, directory);

          if (results != null && results.length > 0) {
            return results;
          }
        }

        return _FuzzyFileNameProvider().default.executeQuery(query, directory);
      }
    });
  }

  consumeBusySignal(service) {
    this._busySignalService = service;
    return new (_UniversalDisposable().default)(() => {
      this._busySignalService = null;
    });
  }

  consumeFallbackProvider(provider) {
    this._fallbackProvider = provider;
    return new (_UniversalDisposable().default)(() => {
      this._fallbackProvider = null;
    });
  }

  dispose() {
    this._subscriptions.dispose();

    this._subscriptionsByRoot.forEach(disposables => disposables.dispose());

    this._subscriptionsByRoot.clear();
  }

}

(0, _createPackage().default)(module.exports, Activation);