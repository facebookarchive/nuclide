"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _fuzzaldrinPlus() {
  const data = _interopRequireDefault(require("fuzzaldrin-plus"));

  _fuzzaldrinPlus = function () {
    return data;
  };

  return data;
}

function _matchIndexesToRanges() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/matchIndexesToRanges"));

  _matchIndexesToRanges = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _FileFamilyUtils() {
  const data = require("./FileFamilyUtils");

  _FileFamilyUtils = function () {
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
class FileFamilyDashProvider {
  constructor(aggregators, cwds) {
    this.debounceDelay = 0;
    this.display = {
      title: 'File Family',
      prompt: {
        verb: 'Go to',
        object: 'Related file'
      },
      action: 'file-family-dash-provider:toggle-provider'
    };
    this.prefix = 'alt';
    this.priority = 10;
    this._aggregators = aggregators;
    this._cwds = cwds;
  }

  executeQuery(query, queryContext, callback) {
    const aggregator = this._aggregators.getValue();

    if (aggregator == null) {
      callback([{
        type: 'generic',
        relevance: 1,
        primaryText: 'An error occurred. Please try again.'
      }]);
      return new (_UniversalDisposable().default)();
    }

    const activeUri = queryContext.focusedUri;

    if (activeUri == null) {
      callback([{
        type: 'generic',
        relevance: 1,
        primaryText: 'Open a file to retrieve alternates for it.'
      }]);
      return new (_UniversalDisposable().default)();
    }

    const results = _RxMin.Observable.defer(() => aggregator.getRelatedFiles(activeUri)).map(graph => {
      const cwd = this._cwds.getValue();

      const projectUri = cwd && cwd.getCwd();
      return (0, _FileFamilyUtils().getAlternatesFromGraph)(graph, activeUri).filter(uri => query === '' || _fuzzaldrinPlus().default.score(uri, query) > 0).sort((a, b) => query === '' ? 0 : _fuzzaldrinPlus().default.score(a, query) - _fuzzaldrinPlus().default.score(b, query)).map(alternateUri => ({
        type: 'openable',
        uri: alternateUri,
        uriMatchRanges: (0, _matchIndexesToRanges().default)(_fuzzaldrinPlus().default.match(alternateUri, query)),
        projectUri: projectUri != null && alternateUri.includes(projectUri) ? projectUri : null,
        openOptions: {},
        relevance: 1
      }));
    });

    return new (_UniversalDisposable().default)(results.subscribe(callback));
  }

}

exports.default = FileFamilyDashProvider;