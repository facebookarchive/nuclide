'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.createConfigObs = createConfigObs;
exports.getStore = getStore;
exports.portsForDebugBridge = portsForDebugBridge;

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

var _DebugBridge;

function _load_DebugBridge() {
  return _DebugBridge = require('./DebugBridge');
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

class DebugBridgePathStore {
  constructor() {
    this._registeredPaths = new Map();
    this._sortedPaths = [];
    this._lastWorkingPath = null;
    this._customPath = null;
    this._ports = [(_DebugBridge || _load_DebugBridge()).DEFAULT_ADB_PORT];
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
      // flowlint-next-line sketchy-null-string:off
      active: this._customPath || this._lastWorkingPath,
      all: this.getPaths(),
      ports: this.getPorts()
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

  addPort(port) {
    // Keep the ports sorted such that the most recently added
    // is always at the end.
    this.removePort(port);
    this._ports.push(port);
  }

  removePort(port) {
    const idx = this._ports.indexOf(port);
    if (idx >= 0) {
      this._ports.splice(idx, 1);
    }
  }

  getPorts() {
    return Array.from(this._ports);
  }
}

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
  return _rxjsBundlesRxMinJs.Observable.defer((0, _asyncToGenerator.default)(function* () {
    return {
      path: yield pathForDebugBridge(db),
      ports: portsForDebugBridge(db)
    };
  })).map(config => ({
    path: config.path,
    ports: config.ports
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

function portsForDebugBridge(db) {
  const store = getStore(db);
  return store.getPorts();
}