'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.createConfigObs = createConfigObs;
exports.getStore = getStore;
exports.portForDebugBridge = portForDebugBridge;

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DebugBridgePathStore {
  constructor() {
    this._registeredPaths = new Map();
    this._sortedPaths = [];
    this._lastWorkingPath = null;
    this._customPath = null;
    this._port = null;
  }

  registerPath(id, dbPath) {
    this._registeredPaths.set(id, dbPath);
    this._sortedPaths = Array.from(this._registeredPaths.values()).sort((a, b) => b.priority - a.priority).map(_dbPath => _dbPath.path);
  }

  getPaths() {
    const lastWorkingPath = this._lastWorkingPath;
    if (lastWorkingPath == null) {
      return (0, (_collection || _load_collection()).arrayUnique)(this._sortedPaths);
    }
    return (0, (_collection || _load_collection()).arrayUnique)([lastWorkingPath, ...this._sortedPaths]);
  }

  notifyWorkingPath(workingPath) {
    this._lastWorkingPath = workingPath;
  }

  getFullConfig() {
    return {
      active: this._customPath || this._lastWorkingPath,
      all: this.getPaths(),
      port: this.getPort()
    };
  }

  registerCustomPath(path) {
    if (path != null) {
      this.registerPath('custom', { path, priority: -1 });
    }
    this._customPath = path;
  }

  getCustomPath() {
    return this._customPath;
  }

  setPort(port) {
    this._port = port;
  }

  getPort() {
    return this._port;
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

const runningPromises = new Map();

// Ensure only one call is executed at a time
function reusePromiseUntilResolved(id, cb) {
  let runningPromise = runningPromises.get(id);
  if (runningPromise == null) {
    runningPromise = (0, (_promise || _load_promise()).lastly)(cb(), () => {
      runningPromises.delete(id);
    });
    runningPromises.set(id, runningPromise);
  }
  return runningPromise;
}

function pathForDebugBridge(db) {
  const store = getStore(db);
  // give priority to custom paths
  const customPath = store.getCustomPath();
  if (customPath != null) {
    return Promise.resolve(customPath);
  }

  return reusePromiseUntilResolved(db, (0, _asyncToGenerator.default)(function* () {
    const workingPath = yield (0, (_promise || _load_promise()).asyncFind)(store.getPaths(), (() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (path) {
        try {
          yield (0, (_process || _load_process()).runCommand)(path, ['start-server']).toPromise();
          return path;
        } catch (e) {
          return null;
        }
      });

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    })());
    if (workingPath == null) {
      throw new Error(`${db} is unavailable. Add it to your path and restart nuclide or make sure that ` + `'${db} start-server' works.`);
    }
    store.notifyWorkingPath(workingPath);
    return workingPath;
  }));
}

function createConfigObs(db) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => pathForDebugBridge(db)).map(path => ({
    path,
    port: portForDebugBridge(db)
  }));
}

const pathStore = new Map();

function getStore(db) {
  let cached = pathStore.get(db);
  if (cached == null) {
    cached = new DebugBridgePathStore();
    cached.registerPath('default', { path: db, priority: -1 });
    pathStore.set(db, cached);
  }
  return cached;
}

function portForDebugBridge(db) {
  const store = getStore(db);
  return store.getPort();
}