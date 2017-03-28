'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _createEmptyAppState;

function _load_createEmptyAppState() {
  return _createEmptyAppState = require('./redux/createEmptyAppState');
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

const DID_UPDATE_STATE_EVENT = 'did-update-state';

class DiffViewModel {

  constructor(actionCreators, progressUpdates) {
    this._actionCreators = actionCreators;
    this._progressUpdates = progressUpdates;
    this._emitter = new _atom.Emitter();
    this._state = (0, (_createEmptyAppState || _load_createEmptyAppState()).createEmptyAppState)();
  }

  diffFile(filePath) {
    this._actionCreators.diffFile(filePath);
  }

  getDirtyFileChangesCount() {
    const { activeRepositoryState: { dirtyFiles } } = this._state;
    return dirtyFiles.size;
  }

  setViewMode(viewMode) {
    this._actionCreators.setViewMode(viewMode);
  }

  setCompareRevision(revision) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-set-revision');

    if (!(this._state.activeRepository != null)) {
      throw new Error('There must be an active repository!');
    }

    this._actionCreators.setCompareId(this._state.activeRepository, revision.id);
  }

  publishDiff(publishMessage, isPrepareMode) {
    const activeRepository = this._state.activeRepository;

    if (!(activeRepository != null)) {
      throw new Error('Cannot publish without an active stack!');
    }

    this._actionCreators.publishDiff(activeRepository, publishMessage, isPrepareMode, this._state.lintExcuse, this._progressUpdates);
  }

  updatePublishMessage(message) {
    const { publish } = this._state;
    this._actionCreators.updatePublishState(Object.assign({}, publish, {
      message
    }));
  }

  onDidUpdateState(callback) {
    return this._emitter.on(DID_UPDATE_STATE_EVENT, callback);
  }

  commit(message, bookmarkName) {
    if (message === '') {
      atom.notifications.addError('Commit aborted', { detail: 'Commit message empty' });
      return;
    }
    const activeRepository = this._state.activeRepository;

    if (!(activeRepository != null)) {
      throw new Error('No active repository stack');
    }

    this._actionCreators.commit(activeRepository, message, this._progressUpdates, bookmarkName);
  }

  injectState(newState) {
    this._state = newState;
    this._emitter.emit(DID_UPDATE_STATE_EVENT);
  }

  getState() {
    return this._state;
  }

  setCommitMode(commitMode) {
    this._actionCreators.setCommitMode(commitMode);
  }

  setShouldAmendRebase(shouldRebaseOnAmend) {
    this._actionCreators.setShouldRebaseOnAmend(shouldRebaseOnAmend);
  }

  setShouldCommitInteractively(shouldCommitInteractively) {
    this._actionCreators.setShouldCommitInteractively(shouldCommitInteractively);
  }

  setShouldPublishOnCommit(shoulPublishOnCommit) {
    this._actionCreators.setShouldPublishOnCommit(shoulPublishOnCommit);
  }

  updatePublishStateWithMessage(message) {
    this._actionCreators.updatePublishState(Object.assign({}, this._state.publish, {
      message
    }));
  }

  setLintExcuse(lintExcuse) {
    this._actionCreators.setLintExcuse(lintExcuse);
  }

  setIsPrepareMode(isPrepareMode) {
    this._actionCreators.setIsPrepareMode(isPrepareMode);
  }

  setVerbatimModeEnabled(verbatimModeEnabled) {
    this._actionCreators.setVerbatimModeEnabled(verbatimModeEnabled);
  }
}
exports.default = DiffViewModel;