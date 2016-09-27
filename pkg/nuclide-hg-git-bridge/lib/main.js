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

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _commonsNodeObservable2;

function _commonsNodeObservable() {
  return _commonsNodeObservable2 = require('../../commons-node/observable');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _repositoryContainsPath = require('./repositoryContainsPath');

exports.repositoryContainsPath = _interopRequire(_repositoryContainsPath);

var _repositoryForPath = require('./repositoryForPath');

exports.repositoryForPath = _interopRequire(_repositoryForPath);

function getHgRepositories() {
  return new Set((0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayCompact)(atom.project.getRepositories()).filter(function (repository) {
    return repository.getType() === 'hg';
  }));
}

function getHgRepositoryStream() {
  var currentRepositories = (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(atom.project.onDidChangePaths.bind(atom.project)).startWith(null).map(function () {
    return getHgRepositories();
  });

  return (0, (_commonsNodeObservable2 || _commonsNodeObservable()).diffSets)(currentRepositories).flatMap(function (repoDiff) {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(repoDiff.added);
  });
}