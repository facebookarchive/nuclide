'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.repositoryForPath = exports.repositoryContainsPath = undefined;

var _repositoryContainsPath;

function _load_repositoryContainsPath() {
  return _repositoryContainsPath = require('./repositoryContainsPath');
}

Object.defineProperty(exports, 'repositoryContainsPath', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_repositoryContainsPath || _load_repositoryContainsPath()).default;
  }
});

var _repositoryForPath;

function _load_repositoryForPath() {
  return _repositoryForPath = require('./repositoryForPath');
}

Object.defineProperty(exports, 'repositoryForPath', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_repositoryForPath || _load_repositoryForPath()).default;
  }
});
exports.getHgRepositories = getHgRepositories;
exports.getHgRepositoryStream = getHgRepositoryStream;

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _observable;

function _load_observable() {
  return _observable = require('../../commons-node/observable');
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getHgRepositories() {
  return new Set((0, (_collection || _load_collection()).arrayCompact)(atom.project.getRepositories()).filter(repository => repository.getType() === 'hg'));
}

function getHgRepositoryStream() {
  const currentRepositories = (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.project.onDidChangePaths.bind(atom.project)).startWith(null).map(() => getHgRepositories());

  return (0, (_observable || _load_observable()).diffSets)(currentRepositories).flatMap(repoDiff => _rxjsBundlesRxMinJs.Observable.from(repoDiff.added));
}