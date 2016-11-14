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
exports.MercurialConflictDetector = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _MercurialConflictContext;

function _load_MercurialConflictContext() {
  return _MercurialConflictContext = require('./MercurialConflictContext');
}

var _atom = require('atom');

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

let MercurialConflictDetector = exports.MercurialConflictDetector = class MercurialConflictDetector {

  constructor() {
    this._subscriptions = new _atom.CompositeDisposable();
    this._repositorySubscriptions = new Map();
    this._mercurialConflictContext = new (_MercurialConflictContext || _load_MercurialConflictContext()).MercurialConflictContext();
    this._subscriptions.add(atom.project.onDidChangePaths(this._updateRepositories.bind(this)));
  }

  setConflictsApi(conflictsApi) {
    this._conflictsApi = conflictsApi;
    conflictsApi.registerContextApi({
      getContext: () => Promise.resolve(this._mercurialConflictContext)
    });
    this._updateRepositories();
  }

  _updateRepositories() {
    const repositories = new Set(atom.project.getRepositories().filter(repository => repository != null && repository.getType() === 'hg'));
    // Dispose removed projects repositories, if any.
    for (const _ref of this._repositorySubscriptions) {
      var _ref2 = _slicedToArray(_ref, 2);

      const repository = _ref2[0];
      const repositorySubscription = _ref2[1];

      if (repositories.has(repository)) {
        continue;
      }
      repositorySubscription.dispose();
      this._repositorySubscriptions.delete(repository);
    }

    // Add the new project repositories, if any.
    for (const repository of repositories) {
      if (this._repositorySubscriptions.has(repository)) {
        continue;
      }
      this._watchRepository(repository);
    }
  }

  _watchRepository(repository) {
    const subscriptions = new _atom.CompositeDisposable();
    this._conflictStateChanged(repository);
    subscriptions.add(repository.onDidChangeConflictState(() => this._conflictStateChanged(repository)));
    this._repositorySubscriptions.set(repository, subscriptions);
  }

  _conflictStateChanged(repository) {
    const conflictsApi = this._conflictsApi;
    if (conflictsApi == null || conflictsApi.showForContext == null) {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().info('No compatible "merge-conflicts" API found.');
      return;
    }
    if (repository.isInConflict()) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('hg-conflict-detctor.detected-conflicts');
      this._mercurialConflictContext.setConflictingRepository(repository);
      conflictsApi.showForContext(this._mercurialConflictContext);
      atom.notifications.addWarning('Nuclide detected merge conflicts in your active project\'s repository', {
        detail: 'Use the conflicts resolver UI below to help resolve them',
        nativeFriendly: true
      });
    } else {
      const toClear = this._mercurialConflictContext.getConflictingRepository() === repository;
      if (toClear) {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('hg-conflict-detctor.resolved-outside-nuclide');
        this._mercurialConflictContext.clearConflictState();
        conflictsApi.hideForContext(this._mercurialConflictContext);
        atom.notifications.addInfo('Conflicts resolved outside of Nuclide');
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().info('Conflicts resolved outside of Nuclide');
      } else {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('hg-conflict-detctor.resolved-in-nuclide');
      }
    }
  }

  dispose() {
    this._subscriptions.dispose();
    for (const repositorySubscription of this._repositorySubscriptions.values()) {
      repositorySubscription.dispose();
    }
    this._repositorySubscriptions.clear();
  }

};