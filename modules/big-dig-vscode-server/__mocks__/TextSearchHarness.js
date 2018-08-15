"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextSearchHarness = void 0;

function proto() {
  const data = _interopRequireWildcard(require("../Protocol.js"));

  proto = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _SearchRpcMethods() {
  const data = require("../SearchRpcMethods");

  _SearchRpcMethods = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
class TextSearchHarness {
  // Collects all of the results
  // The mock search provider we give to `SearchRpcMethods`.
  // Corresponding to each `basePath`, each `Subject` sends results to `_doTextSearch`.
  // Collects results of `_doTextSearch`.
  constructor() {
    this._isStarted = false;
    this._matchResults = [];
    this._currentResults = [];
    this.forText = jest.fn();
    this.searcher = {
      // We are not testing this:
      forFiles(...args) {
        throw new Error('forFiles should not be called');
      },

      // We are testing this:
      forText: this.forText
    };
    this.rpc = new (_SearchRpcMethods().SearchRpcMethods)(this.searcher);
  }

  start(query, basePaths, options = {}) {
    if (!(this._isStarted === false)) {
      throw new Error('Already started');
    }

    this._isStarted = true;
    basePaths.forEach(() => {
      const newQuery = new _RxMin.Subject();
      this.forText.mockReturnValueOnce(newQuery);

      this._matchResults.push(newQuery);
    });
    const params = {
      query,
      basePaths: basePaths.map(x => typeof x === 'string' ? {
        path: x,
        includes: [],
        excludes: []
      } : x),
      options: Object.assign({}, TextSearchHarness.defaultOptions, options)
    };
    this._search = this.rpc._doTextSearch(params).mergeAll().do(x => this._currentResults.push(x)).toArray().toPromise();
  }

  dispose() {
    this.rpc.dispose();
  }

  results() {
    if (!(this._isStarted === true)) {
      throw new Error('Must call `start()` first');
    }

    return this._search;
  }

  currentResults() {
    if (!(this._isStarted === true)) {
      throw new Error('Must call `start()` first');
    }

    return this._currentResults;
  }

  nextMatch(basePathId, value) {
    if (!(this._isStarted === true)) {
      throw new Error('Must call `start()` first');
    }

    this._matchResults[basePathId].next(value);
  }

  completeMatch(basePathId) {
    if (!(this._isStarted === true)) {
      throw new Error('Must call `start()` first');
    }

    this._matchResults[basePathId].complete();
  }

  completeMatches() {
    if (!(this._isStarted === true)) {
      throw new Error('Must call `start()` first');
    }

    this._matchResults.forEach(m => m.complete());
  }

}

exports.TextSearchHarness = TextSearchHarness;
TextSearchHarness.defaultOptions = {
  isRegExp: false,
  isCaseSensitive: false,
  isWordMatch: false
};