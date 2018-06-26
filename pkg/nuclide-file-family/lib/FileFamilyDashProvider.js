'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fuzzaldrinPlus;

function _load_fuzzaldrinPlus() {
  return _fuzzaldrinPlus = _interopRequireDefault(require('fuzzaldrin-plus'));
}

var _matchIndexesToRanges;

function _load_matchIndexesToRanges() {
  return _matchIndexesToRanges = _interopRequireDefault(require('../../../modules/nuclide-commons/matchIndexesToRanges'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _FileFamilyUtils;

function _load_FileFamilyUtils() {
  return _FileFamilyUtils = require('./FileFamilyUtils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
      return new (_UniversalDisposable || _load_UniversalDisposable()).default();
    }

    const activeUri = queryContext.focusedUri;
    if (activeUri == null) {
      callback([{
        type: 'generic',
        relevance: 1,
        primaryText: 'Open a file to retrieve alternates for it.'
      }]);
      return new (_UniversalDisposable || _load_UniversalDisposable()).default();
    }

    const results = _rxjsBundlesRxMinJs.Observable.defer(() => aggregator.getRelatedFiles(activeUri)).map(graph => {
      const cwd = this._cwds.getValue();
      const projectUri = cwd && cwd.getCwd();
      return (0, (_FileFamilyUtils || _load_FileFamilyUtils()).getAlternatesFromGraph)(graph, activeUri).filter(uri => query === '' || (_fuzzaldrinPlus || _load_fuzzaldrinPlus()).default.score(uri, query) > 0).sort((a, b) => query === '' ? 0 : (_fuzzaldrinPlus || _load_fuzzaldrinPlus()).default.score(a, query) - (_fuzzaldrinPlus || _load_fuzzaldrinPlus()).default.score(b, query)).map(alternateUri => ({
        type: 'openable',
        uri: alternateUri,
        uriMatchRanges: (0, (_matchIndexesToRanges || _load_matchIndexesToRanges()).default)((_fuzzaldrinPlus || _load_fuzzaldrinPlus()).default.match(alternateUri, query)),
        projectUri: projectUri != null && alternateUri.includes(projectUri) ? projectUri : null,
        openOptions: {},
        relevance: 1
      }));
    });

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(results.subscribe(callback));
  }
}
exports.default = FileFamilyDashProvider; /**
                                           * Copyright (c) 2015-present, Facebook, Inc.
                                           * All rights reserved.
                                           *
                                           * This source code is licensed under the license found in the LICENSE file in
                                           * the root directory of this source tree.
                                           *
                                           * 
                                           * @format
                                           */