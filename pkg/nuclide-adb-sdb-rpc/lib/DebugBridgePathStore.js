'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pathForDebugBridge = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let pathForDebugBridge = exports.pathForDebugBridge = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (db) {
    return reusePromiseUntilResolved(db, (0, _asyncToGenerator.default)(function* () {
      const store = getStore(db);
      const workingPath = yield (0, (_promise || _load_promise()).asyncFind)(store.getPaths(), (() => {
        var _ref3 = (0, _asyncToGenerator.default)(function* (path) {
          try {
            yield (0, (_process || _load_process()).runCommand)(path, ['start-server']).toPromise();
            return path;
          } catch (e) {
            return null;
          }
        });

        return function (_x2) {
          return _ref3.apply(this, arguments);
        };
      })());
      store.notifyWorkingPath(workingPath);
      if (workingPath != null) {
        return workingPath;
      }
      throw new Error(`${db} is unavailable. Add it to your path and restart nuclide or make sure that ` + `'${db} start-server' works.`);
    }));
  });

  return function pathForDebugBridge(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.getStore = getStore;

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _promise;

function _load_promise() {
  return _promise = require('../../commons-node/promise');
}

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DebugBridgePathStore {

  constructor() {
    this._registeredPaths = new Map();
    this._sortedPaths = [];
    this._lastWorkingPath = null;
  }

  registerPath(id, dbPath) {
    this._registeredPaths.set(id, dbPath);
    this._sortedPaths = Array.from(this._registeredPaths.values()).sort((a, b) => b.priority - a.priority).map(_dbPath => _dbPath.path);
  }

  getPaths() {
    if (this._lastWorkingPath == null) {
      return this._sortedPaths;
    }
    return (0, (_collection || _load_collection()).arrayUnique)([this._lastWorkingPath].concat(...this._sortedPaths));
  }

  notifyWorkingPath(workingPath) {
    this._lastWorkingPath = workingPath;
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

const pathStore = new Map();

function getStore(db) {
  let cached = pathStore.get(db);
  if (cached == null) {
    cached = new DebugBridgePathStore(db);
    cached.registerPath('default', { path: db, priority: -1 });
    pathStore.set(db, cached);
  }
  return cached;
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