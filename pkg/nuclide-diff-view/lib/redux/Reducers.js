'use strict';

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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const FILESYSTEM_REVISION_TITLE = 'Filesystem / Editor';

function rootReducer(state, action) {
  if (state == null) {
    return (0, (_createEmptyAppState || _load_createEmptyAppState()).createEmptyAppState)();
  }
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY:
      {
        const { hgRepository } = action.payload;
        return Object.assign({}, state, {
          activeRepository: hgRepository,
          activeRepositoryState: reduceActiveRepositoryState(state.repositories, hgRepository)
        });
      }

    case (_ActionTypes || _load_ActionTypes()).ADD_REPOSITORY:
    case (_ActionTypes || _load_ActionTypes()).REMOVE_REPOSITORY:
    case (_ActionTypes || _load_ActionTypes()).SET_COMPARE_ID:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_DIRTY_FILES:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_SELECTED_FILES:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_HEAD_TO_FORKBASE_REVISIONS:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_LOADING_SELECTED_FILES:
      {
        const repositories = reduceRepositories(state.repositories, action);

        return Object.assign({}, state, {
          activeRepositoryState: reduceActiveRepositoryState(repositories, state.activeRepository),
          repositories
        });
      }

    case (_ActionTypes || _load_ActionTypes()).UPDATE_SUGGESTED_REVIEWERS:
      {
        return Object.assign({}, state, {
          suggestedReviewers: action.payload.suggestedReviewers
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

    case (_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_NAVIGATION_SECTION:
      return Object.assign({}, state, {
        fileDiff: reduceNavigationSectionIndex(state.fileDiff, action)
      });

    case (_ActionTypes || _load_ActionTypes()).UPDATE_LOADING_FILE_DIFF:
      return Object.assign({}, state, {
        isLoadingFileDiff: action.payload.isLoading
      });

    // --interactive and --rebase are mutually exclusive
    case (_ActionTypes || _load_ActionTypes()).SET_SHOULD_COMMIT_INTERACTIVELY:
      return Object.assign({}, state, {
        shouldCommitInteractively: action.payload.shouldCommitInteractively,
        shouldPublishOnCommit: !action.payload.shouldCommitInteractively && state.shouldPublishOnCommit,
        shouldRebaseOnAmend: !action.payload.shouldCommitInteractively && state.shouldRebaseOnAmend
      });

    case (_ActionTypes || _load_ActionTypes()).SET_SHOULD_REBASE_ON_AMEND:
      return Object.assign({}, state, {
        shouldCommitInteractively: !action.payload.shouldRebaseOnAmend && state.shouldCommitInteractively,
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

    case (_ActionTypes || _load_ActionTypes()).UPDATE_DIFF_EDITORS_VISIBILITY:
      return Object.assign({}, state, {
        diffEditorsVisible: action.payload.visible
      });

    case (_ActionTypes || _load_ActionTypes()).UPDATE_DIFF_EDITORS:
      return Object.assign({}, state, {
        diffEditors: action.payload
      });
    case (_ActionTypes || _load_ActionTypes()).UPDATE_DIFF_NAVIGATOR_VISIBILITY:
      return Object.assign({}, state, {
        diffNavigatorVisible: action.payload.visible
      });

    case (_ActionTypes || _load_ActionTypes()).UPDATE_DOCK_CONFIG:
      return Object.assign({}, state, {
        shouldDockPublishView: action.payload.shouldDockPublishView
      });

    case (_ActionTypes || _load_ActionTypes()).SET_LINT_EXCUSE:
      return Object.assign({}, state, {
        lintExcuse: action.payload.lintExcuse
      });

    case (_ActionTypes || _load_ActionTypes()).SET_SHOULD_PUBLISH_ON_COMMIT:
      return Object.assign({}, state, {
        shouldCommitInteractively: !action.payload.shouldPublishOnCommit && state.shouldCommitInteractively,
        shouldPublishOnCommit: action.payload.shouldPublishOnCommit
      });

    case (_ActionTypes || _load_ActionTypes()).SET_IS_PREPARE_MODE:
      return Object.assign({}, state, {
        isPrepareMode: action.payload.isPrepareMode
      });

    case (_ActionTypes || _load_ActionTypes()).SET_TEXT_BASED_FORM:
      return Object.assign({}, state, {
        shouldUseTextBasedForm: action.payload.shouldUseTextBasedForm
      });

    case (_ActionTypes || _load_ActionTypes()).SET_VERBATIM_MODE_ENABLED:
      return Object.assign({}, state, {
        verbatimModeEnabled: action.payload.verbatimModeEnabled
      });

    case (_ActionTypes || _load_ActionTypes()).SET_ENABLED_FEATURES:
      return Object.assign({}, state, {
        enabledFeatures: action.payload.enabledFeatures
      });

    default:
      return state;
  }
}

function reduceActiveRepositoryState(repositories, activeRepository) {
  if (activeRepository == null || !repositories.has(activeRepository)) {
    return (0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyRepositoryState)();
  }
  const activeRepositoryState = repositories.get(activeRepository);

  if (!(activeRepositoryState != null)) {
    throw new Error('Invariant violation: "activeRepositoryState != null"');
  }

  return activeRepositoryState;
}

function reduceRepositories(repositories, action) {
  const newRepositories = new Map(repositories);
  const { repository } = action.payload;

  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).SET_COMPARE_ID:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_DIRTY_FILES:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_SELECTED_FILES:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_HEAD_TO_FORKBASE_REVISIONS:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_LOADING_SELECTED_FILES:
      {
        const oldRepositoryState = repositories.get(repository);

        if (!(oldRepositoryState != null)) {
          throw new Error('Invariant violation: "oldRepositoryState != null"');
        }

        newRepositories.set(repository, reduceRepositoryAction(oldRepositoryState, action));
        break;
      }
    case (_ActionTypes || _load_ActionTypes()).ADD_REPOSITORY:
      {
        newRepositories.set(repository, (0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyRepositoryState)());
        break;
      }
    case (_ActionTypes || _load_ActionTypes()).REMOVE_REPOSITORY:
      {
        newRepositories.delete(repository);
        break;
      }
  }
  return newRepositories;
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
      {
        const { headToForkBaseRevisions } = action.payload;
        return Object.assign({}, repositoryState, {
          headToForkBaseRevisions,
          headRevision: (0, (_utils || _load_utils()).getHeadRevision)(headToForkBaseRevisions),
          revisionStatuses: action.payload.revisionStatuses
        });
      }
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
  const { filePath, fromRevision, newContents, oldContents, textDiff } = action.payload;
  let { inlineElements: newEditorElements } = state.newEditorState;
  let { inlineElements: oldEditorElements } = state.oldEditorState;
  let { activeSectionIndex } = state;

  if (state.filePath !== filePath) {
    // Clear the ui elements and section index.
    activeSectionIndex = -1;
    newEditorElements = new Map();
    oldEditorElements = new Map();
  }

  const {
    addedLines,
    removedLines,
    newToOld,
    oldToNew
  } = textDiff;

  // Deserialize from JSON.
  const oldLineOffsets = new Map(textDiff.oldLineOffsets);
  const newLineOffsets = new Map(textDiff.newLineOffsets);

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
    activeSectionIndex,
    filePath,
    lineMapping: { newToOld, oldToNew },
    newEditorState,
    oldEditorState,
    navigationSections
  };
}

function reduceUiElements(state, action) {
  const { newEditorElements, oldEditorElements } = action.payload;
  const { newEditorState, oldEditorState } = state;

  const navigationSections = (0, (_diffUtils || _load_diffUtils()).computeNavigationSections)(newEditorState.highlightedLines.added, oldEditorState.highlightedLines.removed, newEditorElements.keys(), oldEditorElements.keys(), oldEditorState.offsets, newEditorState.offsets);

  return Object.assign({}, state, {
    oldEditorState: Object.assign({}, oldEditorState, {
      inlineElements: oldEditorElements,
      inlineOffsetElements: newEditorElements
    }),
    newEditorState: Object.assign({}, newEditorState, {
      inlineElements: newEditorElements,
      inlineOffsetElements: oldEditorElements
    }),
    navigationSections
  });
}

function reduceNavigationSectionIndex(state, action) {
  return Object.assign({}, state, {
    activeSectionIndex: action.payload.sectionIndex
  });
}

function reduceUiProviders(state, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).ADD_UI_PROVIDER:
      return state.concat(action.payload.uiProvider);
    case (_ActionTypes || _load_ActionTypes()).REMOVE_UI_PROVIDER:
      const { uiProvider } = action.payload;
      return state.filter(provider => provider !== uiProvider);
  }
  return state || [];
}