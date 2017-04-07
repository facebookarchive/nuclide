'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEmptyCommitState = getEmptyCommitState;
exports.getEmptyPublishState = getEmptyPublishState;
exports.getEmptySuggestedReviewerState = getEmptySuggestedReviewerState;
exports.getEmptyFileDiffState = getEmptyFileDiffState;
exports.getEmptyRepositoryState = getEmptyRepositoryState;
exports.createEmptyAppState = createEmptyAppState;
exports.getEmptyTextDiff = getEmptyTextDiff;

var _constants;

function _load_constants() {
  return _constants = require('../constants');
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

function getEmptySuggestedReviewerState() {
  return {
    status: 'not-initialized'
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
    enabledFeatures: new Set(),
    fileDiff: getEmptyFileDiffState(),
    isLoadingFileDiff: false,
    isPrepareMode: false,
    lintExcuse: '',
    publish: getEmptyPublishState(),
    repositories: new Map(),
    shouldCommitInteractively: false,
    shouldDockPublishView: true,
    shouldPublishOnCommit: false,
    shouldRebaseOnAmend: true,
    shouldUseTextBasedForm: false,
    uiProviders: [],
    viewMode: (_constants || _load_constants()).DiffMode.BROWSE_MODE,
    suggestedReviewers: getEmptySuggestedReviewerState(),
    verbatimModeEnabled: false
  };
}

function getEmptyTextDiff() {
  return {
    addedLines: [],
    newLineOffsets: [],
    newToOld: [],
    oldLineOffsets: [],
    oldToNew: [],
    removedLines: []
  };
}