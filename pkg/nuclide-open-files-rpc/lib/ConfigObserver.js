'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfigObserver = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _FileCache;

function _load_FileCache() {
  return _FileCache = require('./FileCache');
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

class ConfigObserver {

  constructor(cache, fileExtensions, findConfigDir) {
    this._fileCache = cache;
    this._fileExtensions = fileExtensions;
    this._findConfigDir = findConfigDir;
    this._currentConfigs = new _rxjsBundlesRxMinJs.BehaviorSubject(new Set());
    // TODO: Consider incrementally updating, rather than recomputing on each event.
    this._subscription = cache.observeFileEvents().filter(fileEvent => fileEvent.kind !== (_constants || _load_constants()).FileEventKind.EDIT).mapTo(undefined).merge(cache.observeDirectoryEvents().mapTo(undefined)).switchMap(() => _rxjsBundlesRxMinJs.Observable.fromPromise(this._computeOpenConfigs())).distinctUntilChanged((_collection || _load_collection()).areSetsEqual)
    // Filter out initial empty set, which duplicates the initial value of the BehaviorSubject
    .skipWhile(dirs => dirs.size === 0).subscribe(this._currentConfigs);
  }

  _computeOpenConfigs() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const paths = Array.from(_this._fileCache.getOpenDirectories()).concat(Array.from(_this._fileCache.getOpenFiles()).filter(function (filePath) {
        return _this._fileExtensions.indexOf((_nuclideUri || _load_nuclideUri()).default.extname(filePath)) !== -1;
      }));

      const result = new Set((yield Promise.all(paths.map(function (path) {
        return _this._findConfigDir(path);
      }))).filter(function (path) {
        return path != null;
      }));
      // $FlowIssue Flow doesn't understand filter
      return result;
    })();
  }

  observeConfigs() {
    return this._currentConfigs.asObservable();
  }

  getOpenConfigs() {
    return this._currentConfigs.getValue();
  }

  dispose() {
    this._subscription.unsubscribe();
    this._currentConfigs.complete();
    this._currentConfigs.unsubscribe();
  }
}
exports.ConfigObserver = ConfigObserver;