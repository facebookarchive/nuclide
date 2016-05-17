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

exports.activate = activate;
exports.consumeMergeConflictsApi = consumeMergeConflictsApi;
exports.consumeCwdApi = consumeCwdApi;

var getMercurialContext = _asyncToGenerator(function* () {
  var activeTextEditor = atom.workspace.getActiveTextEditor();
  var activePath = null;
  if (activeTextEditor != null && activeTextEditor.getPath()) {
    activePath = activeTextEditor.getPath();
  }
  if (activePath == null && cwdApi != null) {
    var directory = cwdApi.getCwd();
    if (directory != null) {
      activePath = directory.getPath();
    }
  }
  var hgRepository = null;
  var priority = 2;
  if (activePath != null) {
    var repository = (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).repositoryForPath)(activePath);
    if (isHgRepo(repository)) {
      hgRepository = repository;
      priority = 3;
    }
  }
  var repositories = atom.project.getRepositories();
  var directories = atom.project.getDirectories();
  if (hgRepository == null) {
    hgRepository = repositories.filter(isHgRepo)[0];
  }
  if (hgRepository == null) {
    return null;
  }
  var workingDirectory = directories[repositories.indexOf(hgRepository)];
  return new (_MercurialConflictContext2 || _MercurialConflictContext()).MercurialConflictContext(hgRepository, workingDirectory, priority);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _nuclideHgGitBridge2;

function _nuclideHgGitBridge() {
  return _nuclideHgGitBridge2 = require('../../nuclide-hg-git-bridge');
}

var _MercurialConflictContext2;

function _MercurialConflictContext() {
  return _MercurialConflictContext2 = require('./MercurialConflictContext');
}

var cwdApi = null;

function activate() {}

function consumeMergeConflictsApi(conflictsApi) {
  conflictsApi.registerContextApi({
    getContext: function getContext() {
      return getMercurialContext();
    }
  });
}

function consumeCwdApi(api) {
  cwdApi = api;
}

function isHgRepo(repository) {
  return repository != null && repository.getType() === 'hg';
}