'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MercurialConflictDetector = undefined;

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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class MercurialConflictDetector {

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
    for (const [repository, repositorySubscription] of this._repositorySubscriptions) {
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
}
exports.MercurialConflictDetector = MercurialConflictDetector;