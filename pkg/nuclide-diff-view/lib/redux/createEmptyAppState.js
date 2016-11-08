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
exports.getEmptyCommitState = getEmptyCommitState;
exports.getEmptyPublishState = getEmptyPublishState;
exports.getEmptyFileDiffState = getEmptyFileDiffState;
exports.getEmptyRepositoryState = getEmptyRepositoryState;
exports.createEmptyAppState = createEmptyAppState;

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

function getEmptyCommitState() {
  return {
    message: null,
    mode: (_constants || _load_constants()).CommitMode.COMMIT,
    state: (_constants || _load_constants()).CommitModeState.READY
  };
}

function getEmptyPublishState() {
  return {
    message: null,
    mode: (_constants || _load_constants()).PublishMode.CREATE,
    state: (_constants || _load_constants()).PublishModeState.READY
  };
}

function initialEditorState() {
  return {
    revisionTitle: 'No file selected',
    text: '',
    offsets: new Map(),
    highlightedLines: {
      added: [],
      removed: []
    },
    inlineElements: new Map(),
    inlineOffsetElements: new Map()
  };
}

function getEmptyFileDiffState() {
  return {
    filePath: '',
    lineMapping: { oldToNew: [], newToOld: [] },
    newEditorState: initialEditorState(),
    oldEditorState: initialEditorState(),
    navigationSections: [],
    activeSectionIndex: -1
  };
}

function getEmptyRepositoryState() {
  return {
    revisionStatuses: new Map(),
    dirtyFiles: new Map(),
    headToForkBaseRevisions: [],
    headRevision: null,
    isLoadingSelectedFiles: false,
    compareRevisionId: null,
    selectedFiles: new Map()
  };
}

function createEmptyAppState() {
  return {
    activeRepository: null,
    activeRepositoryState: getEmptyRepositoryState(),
    commit: getEmptyCommitState(),
    cwdApi: null,
    diffEditors: null,
    diffEditorsVisible: false,
    diffNavigatorVisible: false,
    fileDiff: getEmptyFileDiffState(),
    isLoadingFileDiff: false,
    publish: getEmptyPublishState(),
    repositories: new Map(),
    shouldRebaseOnAmend: true,
    uiProviders: [],
    viewMode: (_constants || _load_constants()).DiffMode.BROWSE_MODE
  };
}