"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfigObserver = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _FileCache() {
  const data = require("./FileCache");

  _FileCache = function () {
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
class ConfigObserver {
  constructor(cache, fileExtensions, findConfigDir) {
    this._fileCache = cache;
    this._fileExtensions = fileExtensions;
    this._findConfigDir = findConfigDir;
    this._currentConfigs = new _RxMin.BehaviorSubject(new Set()); // TODO: Consider incrementally updating, rather than recomputing on each event.

    this._subscription = cache.observeFileEvents().filter(fileEvent => fileEvent.kind !== _constants().FileEventKind.EDIT).mapTo(undefined).merge(cache.observeDirectoryEvents().mapTo(undefined)).switchMap(() => _RxMin.Observable.fromPromise(this._computeOpenConfigs())).distinctUntilChanged(_collection().areSetsEqual) // Filter out initial empty set, which duplicates the initial value of the BehaviorSubject
    .skipWhile(dirs => dirs.size === 0).subscribe(this._currentConfigs);
  }

  async _computeOpenConfigs() {
    const paths = Array.from(this._fileCache.getOpenDirectories()).concat(Array.from(this._fileCache.getOpenFiles()).filter(filePath => this._fileExtensions.indexOf(_nuclideUri().default.extname(filePath)) !== -1));
    const result = new Set((await Promise.all(paths.map(path => this._findConfigDir(path)))).filter(path => path != null)); // $FlowIssue Flow doesn't understand filter

    return result;
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