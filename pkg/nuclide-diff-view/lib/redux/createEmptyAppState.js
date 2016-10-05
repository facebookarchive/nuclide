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

exports.getEmptyActiveRepositoryState = getEmptyActiveRepositoryState;
exports.getEmptyCommitState = getEmptyCommitState;
exports.getEmptyPublishState = getEmptyPublishState;
exports.getEmptyFileDiffState = getEmptyFileDiffState;
exports.getEmptyRebaseOnAmendState = getEmptyRebaseOnAmendState;
exports.getEmptyRepositoriesState = getEmptyRepositoriesState;
exports.getEmptyRepositoryState = getEmptyRepositoryState;
exports.getEmptyViewModeState = getEmptyViewModeState;
exports.createEmptyAppState = createEmptyAppState;

var _constants2;

function _constants() {
  return _constants2 = require('../constants');
}

function getEmptyActiveRepositoryState() {
  return null;
}

function getEmptyCommitState() {
  return {
    message: null,
    mode: (_constants2 || _constants()).CommitMode.COMMIT,
    state: (_constants2 || _constants()).CommitModeState.READY
  };
}

function getEmptyPublishState() {
  return {
    message: null,
    mode: (_constants2 || _constants()).PublishMode.CREATE,
    state: (_constants2 || _constants()).PublishModeState.READY
  };
}

function getEmptyFileDiffState() {
  return {
    filePath: '',
    fromRevisionTitle: 'No file selected',
    newContents: '',
    oldContents: '',
    toRevisionTitle: 'No file selected'
  };
}

function getEmptyRebaseOnAmendState() {
  return true;
}

function getEmptyRepositoriesState() {
  return new Map();
}

function getEmptyRepositoryState() {
  return {
    revisionStatuses: new Map(),
    dirtyFiles: new Map(),
    headToForkBaseRevisions: [],
    compareRevisionId: null,
    selectedFiles: new Map()
  };
}

function getEmptyViewModeState() {
  return (_constants2 || _constants()).DiffMode.BROWSE_MODE;
}

function createEmptyAppState() {
  return {
    activeRepository: getEmptyActiveRepositoryState(),
    commit: getEmptyCommitState(),
    fileDiff: getEmptyFileDiffState(),
    publish: getEmptyPublishState(),
    repositories: getEmptyRepositoriesState(),
    shouldRebaseOnAmend: getEmptyRebaseOnAmendState(),
    viewMode: getEmptyViewModeState()
  };
}