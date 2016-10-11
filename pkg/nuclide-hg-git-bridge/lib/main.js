Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.getHgRepositories = getHgRepositories;
exports.getHgRepositoryStream = getHgRepositoryStream;

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _commonsNodeCollection;

function _load_commonsNodeCollection() {
  return _commonsNodeCollection = require('../../commons-node/collection');
}

var _commonsNodeObservable;

function _load_commonsNodeObservable() {
  return _commonsNodeObservable = require('../../commons-node/observable');
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _repositoryContainsPath = require('./repositoryContainsPath');

exports.repositoryContainsPath = _interopRequire(_repositoryContainsPath);

var _repositoryForPath = require('./repositoryForPath');

exports.repositoryForPath = _interopRequire(_repositoryForPath);

function getHgRepositories() {
  return new Set((0, (_commonsNodeCollection || _load_commonsNodeCollection()).arrayCompact)(atom.project.getRepositories()).filter(function (repository) {
    return repository.getType() === 'hg';
  }));
}

function getHgRepositoryStream() {
  var currentRepositories = (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(atom.project.onDidChangePaths.bind(atom.project)).startWith(null).map(function () {
    return getHgRepositories();
  });

  return (0, (_commonsNodeObservable || _load_commonsNodeObservable()).diffSets)(currentRepositories).flatMap(function (repoDiff) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.from(repoDiff.added);
  });
}