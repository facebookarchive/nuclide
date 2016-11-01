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
exports.rootReducer = rootReducer;

var _ActionTypes;

function _load_ActionTypes() {
  return _ActionTypes = _interopRequireWildcard(require('./ActionTypes'));
}

var _createEmptyAppState;

function _load_createEmptyAppState() {
  return _createEmptyAppState = require('./createEmptyAppState');
}

var _diffUtils;

function _load_diffUtils() {
  return _diffUtils = require('../diff-utils');
}

var _utils;

function _load_utils() {
  return _utils = require('../utils');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const FILESYSTEM_REVISION_TITLE = 'Filesystem / Editor';

function rootReducer(state, action) {
  if (state == null) {
    return (0, (_createEmptyAppState || _load_createEmptyAppState()).createEmptyAppState)();
  }
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY:
      return Object.assign({}, state, {
        activeRepository: action.payload.hgRepository
      });

    case (_ActionTypes || _load_ActionTypes()).ADD_REPOSITORY:
    case (_ActionTypes || _load_ActionTypes()).REMOVE_REPOSITORY:
    case (_ActionTypes || _load_ActionTypes()).SET_COMPARE_ID:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_DIRTY_FILES:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_SELECTED_FILES:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_HEAD_TO_FORKBASE_REVISIONS:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_LOADING_SELECTED_FILES:
      {
        return Object.assign({}, state, {
          repositories: reduceRepositories(state.repositories, action)
        });
      }

    case (_ActionTypes || _load_ActionTypes()).UPDATE_COMMIT_STATE:
    case (_ActionTypes || _load_ActionTypes()).SET_COMMIT_MODE:
      {
        return Object.assign({}, state, {
          commit: reduceCommitState(state.commit, action)
        });
      }

    case (_ActionTypes || _load_ActionTypes()).UPDATE_PUBLISH_STATE:
      return Object.assign({}, state, {
        publish: reducePublishState(state.publish, action)
      });

    case (_ActionTypes || _load_ActionTypes()).UPDATE_FILE_DIFF:
      return Object.assign({}, state, {
        fileDiff: reduceFileDiff(state.fileDiff, action)
      });
    case (_ActionTypes || _load_ActionTypes()).UPDATE_FILE_UI_ELEMENTS:
      return Object.assign({}, state, {
        fileDiff: reduceUiElements(state.fileDiff, action)
      });

    case (_ActionTypes || _load_ActionTypes()).UPDATE_LOADING_FILE_DIFF:
      return Object.assign({}, state, {
        isLoadingFileDiff: action.payload.isLoading
      });

    case (_ActionTypes || _load_ActionTypes()).SET_SHOULD_REBASE_ON_AMEND:
      return Object.assign({}, state, {
        shouldRebaseOnAmend: action.payload.shouldRebaseOnAmend
      });

    case (_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE:
      return Object.assign({}, state, {
        viewMode: action.payload.viewMode
      });

    case (_ActionTypes || _load_ActionTypes()).SET_CWD_API:
      return Object.assign({}, state, {
        cwdApi: action.payload.cwdApi
      });

    case (_ActionTypes || _load_ActionTypes()).ADD_UI_PROVIDER:
    case (_ActionTypes || _load_ActionTypes()).REMOVE_UI_PROVIDER:
      return Object.assign({}, state, {
        uiProviders: reduceUiProviders(state.uiProviders, action)
      });

    default:
      return state;
  }
}

function reduceRepositories(state, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).SET_COMPARE_ID:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_DIRTY_FILES:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_SELECTED_FILES:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_HEAD_TO_FORKBASE_REVISIONS:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_LOADING_SELECTED_FILES:
      {
        const repository = action.payload.repository;

        const oldRepositoryState = state.get(repository);

        if (!(oldRepositoryState != null)) {
          throw new Error('Invariant violation: "oldRepositoryState != null"');
        }

        return new Map(state).set(repository, reduceRepositoryAction(oldRepositoryState, action));
      }
    case (_ActionTypes || _load_ActionTypes()).ADD_REPOSITORY:
      {
        const repository = action.payload.repository;

        return new Map(state).set(repository, (0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyRepositoryState)());
      }
    case (_ActionTypes || _load_ActionTypes()).REMOVE_REPOSITORY:
      {
        const repository = action.payload.repository;

        const newRepositories = new Map(state);
        newRepositories.delete(repository);
        return newRepositories;
      }
  }
  return state;
}

function reduceRepositoryAction(repositoryState, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).SET_COMPARE_ID:
      return Object.assign({}, repositoryState, {
        compareRevisionId: action.payload.compareId
      });
    case (_ActionTypes || _load_ActionTypes()).UPDATE_DIRTY_FILES:
      return Object.assign({}, repositoryState, {
        dirtyFiles: action.payload.dirtyFiles
      });
    case (_ActionTypes || _load_ActionTypes()).UPDATE_SELECTED_FILES:
      return Object.assign({}, repositoryState, {
        selectedFiles: action.payload.selectedFiles
      });
    case (_ActionTypes || _load_ActionTypes()).UPDATE_HEAD_TO_FORKBASE_REVISIONS:
      return Object.assign({}, repositoryState, {
        headToForkBaseRevisions: action.payload.headToForkBaseRevisions,
        revisionStatuses: action.payload.revisionStatuses
      });
    case (_ActionTypes || _load_ActionTypes()).UPDATE_LOADING_SELECTED_FILES:
      return Object.assign({}, repositoryState, {
        isLoadingSelectedFiles: action.payload.isLoading
      });
    default:
      throw new Error('Invalid Repository Action!');
  }
}

function reduceCommitState(state, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).UPDATE_COMMIT_STATE:
      return action.payload.commit;
    case (_ActionTypes || _load_ActionTypes()).SET_COMMIT_MODE:
      return Object.assign({}, state, {
        mode: action.payload.commitMode
      });
  }
  return state;
}

function reducePublishState(state, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).UPDATE_PUBLISH_STATE:
      return action.payload.publish;
  }
  return state;
}

function reduceFileDiff(state, action) {
  var _action$payload = action.payload;
  const filePath = _action$payload.filePath,
        fromRevision = _action$payload.fromRevision,
        newContents = _action$payload.newContents,
        oldContents = _action$payload.oldContents;
  const newEditorElements = state.newEditorState.inlineElements;
  const oldEditorElements = state.oldEditorState.inlineElements;

  var _computeDiff = (0, (_diffUtils || _load_diffUtils()).computeDiff)(oldContents, newContents);

  const addedLines = _computeDiff.addedLines,
        removedLines = _computeDiff.removedLines,
        oldLineOffsets = _computeDiff.oldLineOffsets,
        newLineOffsets = _computeDiff.newLineOffsets,
        newToOld = _computeDiff.newToOld,
        oldToNew = _computeDiff.oldToNew;


  const oldEditorState = {
    revisionTitle: fromRevision == null ? '...' : (0, (_utils || _load_utils()).formatFileDiffRevisionTitle)(fromRevision),
    text: oldContents,
    offsets: oldLineOffsets,
    highlightedLines: {
      added: [],
      removed: removedLines
    },
    inlineElements: oldEditorElements,
    inlineOffsetElements: newEditorElements
  };
  const newEditorState = {
    revisionTitle: FILESYSTEM_REVISION_TITLE,
    text: newContents,
    offsets: newLineOffsets,
    highlightedLines: {
      added: addedLines,
      removed: []
    },
    inlineElements: newEditorElements,
    inlineOffsetElements: oldEditorElements
  };

  const navigationSections = (0, (_diffUtils || _load_diffUtils()).computeNavigationSections)(addedLines, removedLines, newEditorElements.keys(), oldEditorElements.keys(), oldLineOffsets, newLineOffsets);

  return {
    filePath: filePath,
    lineMapping: { newToOld: newToOld, oldToNew: oldToNew },
    newEditorState: newEditorState,
    oldEditorState: oldEditorState,
    navigationSections: navigationSections
  };
}

function reduceUiElements(state, action) {
  var _action$payload2 = action.payload;
  const newEditorElements = _action$payload2.newEditorElements,
        oldEditorElements = _action$payload2.oldEditorElements;
  const newEditorState = state.newEditorState,
        oldEditorState = state.oldEditorState;

  return Object.assign({}, state, {
    oldEditorState: Object.assign({}, oldEditorState, {
      inlineElements: oldEditorElements,
      inlineOffsetElements: newEditorElements
    }),
    newEditorState: Object.assign({}, newEditorState, {
      inlineElements: newEditorElements,
      inlineOffsetElements: oldEditorElements
    })
  });
}

function reduceUiProviders(state, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).ADD_UI_PROVIDER:
      return state.concat(action.payload.uiProvider);
    case (_ActionTypes || _load_ActionTypes()).REMOVE_UI_PROVIDER:
      const uiProvider = action.payload.uiProvider;

      return state.filter(provider => provider !== uiProvider);
  }
  return state || [];
}