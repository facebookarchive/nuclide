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
exports.addRepository = addRepository;
exports.setCompareId = setCompareId;
exports.updateDirtyFiles = updateDirtyFiles;
exports.removeRepository = removeRepository;
exports.updateSelectedFiles = updateSelectedFiles;
exports.updateLoadingSelectedFiles = updateLoadingSelectedFiles;
exports.updateHeadToForkBaseRevisionsState = updateHeadToForkBaseRevisionsState;
exports.updateActiveRepository = updateActiveRepository;
exports.setCwdApi = setCwdApi;
exports.diffFile = diffFile;
exports.updateFileDiff = updateFileDiff;
exports.updateFileUiElements = updateFileUiElements;
exports.setViewMode = setViewMode;
exports.setCommitMode = setCommitMode;
exports.updateCommitState = updateCommitState;
exports.updateSuggestedReviewers = updateSuggestedReviewers;
exports.updatePublishState = updatePublishState;
exports.setShouldRebaseOnAmend = setShouldRebaseOnAmend;
exports.commit = commit;
exports.publishDiff = publishDiff;
exports.addUiProvider = addUiProvider;
exports.removeUiProvider = removeUiProvider;
exports.updateLoadingFileDiff = updateLoadingFileDiff;
exports.updateDiffEditorsVisibility = updateDiffEditorsVisibility;
exports.updateDiffEditors = updateDiffEditors;
exports.updateDiffNavigatorVisibility = updateDiffNavigatorVisibility;
exports.updateActiveNavigationSection = updateActiveNavigationSection;
exports.updateDockConfig = updateDockConfig;

var _ActionTypes;

function _load_ActionTypes() {
  return _ActionTypes = _interopRequireWildcard(require('./ActionTypes'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function addRepository(repository) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).ADD_REPOSITORY,
    payload: {
      repository
    }
  };
}function setCompareId(repository, compareId) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).SET_COMPARE_ID,
    payload: {
      repository,
      compareId
    }
  };
}

function updateDirtyFiles(repository, dirtyFiles) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_DIRTY_FILES,
    payload: {
      repository,
      dirtyFiles
    }
  };
}

function removeRepository(repository) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).REMOVE_REPOSITORY,
    payload: {
      repository
    }
  };
}

function updateSelectedFiles(repository, selectedFiles) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_SELECTED_FILES,
    payload: {
      repository,
      selectedFiles
    }
  };
}

function updateLoadingSelectedFiles(repository, isLoading) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_LOADING_SELECTED_FILES,
    payload: {
      repository,
      isLoading
    }
  };
}

function updateHeadToForkBaseRevisionsState(repository, headToForkBaseRevisions, revisionStatuses) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_HEAD_TO_FORKBASE_REVISIONS,
    payload: {
      repository,
      headToForkBaseRevisions,
      revisionStatuses
    }
  };
}

function updateActiveRepository(hgRepository) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY,
    payload: {
      hgRepository
    }
  };
}

function setCwdApi(cwdApi) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).SET_CWD_API,
    payload: {
      cwdApi
    }
  };
}

function diffFile(filePath, onChangeModified) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).DIFF_FILE,
    payload: {
      filePath,
      onChangeModified
    }
  };
}

function updateFileDiff(filePath, newContents, oldContents, fromRevision, textDiff) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_FILE_DIFF,
    payload: {
      filePath,
      fromRevision,
      newContents,
      oldContents,
      textDiff
    }
  };
}

function updateFileUiElements(newEditorElements, oldEditorElements) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_FILE_UI_ELEMENTS,
    payload: {
      newEditorElements,
      oldEditorElements
    }
  };
}

function setViewMode(viewMode) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE,
    payload: {
      viewMode
    }
  };
}

function setCommitMode(commitMode) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).SET_COMMIT_MODE,
    payload: {
      commitMode
    }
  };
}

function updateCommitState(commitState) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_COMMIT_STATE,
    payload: {
      commit: commitState
    }
  };
}

function updateSuggestedReviewers(suggestedReviewers) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_SUGGESTED_REVIEWERS,
    payload: {
      suggestedReviewers
    }
  };
}

function updatePublishState(publish) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_PUBLISH_STATE,
    payload: {
      publish
    }
  };
}

function setShouldRebaseOnAmend(shouldRebaseOnAmend) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).SET_SHOULD_REBASE_ON_AMEND,
    payload: {
      shouldRebaseOnAmend
    }
  };
}

function commit(repository, message, publishUpdates) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).COMMIT,
    payload: {
      message,
      repository,
      publishUpdates
    }
  };
}

function publishDiff(repository, message, isPrepareMode, lintExcuse, publishUpdates) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).PUBLISH_DIFF,
    payload: {
      isPrepareMode,
      lintExcuse,
      message,
      publishUpdates,
      repository
    }
  };
}

function addUiProvider(uiProvider) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).ADD_UI_PROVIDER,
    payload: {
      uiProvider
    }
  };
}

function removeUiProvider(uiProvider) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).REMOVE_UI_PROVIDER,
    payload: {
      uiProvider
    }
  };
}

function updateLoadingFileDiff(isLoading) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_LOADING_FILE_DIFF,
    payload: {
      isLoading
    }
  };
}

function updateDiffEditorsVisibility(visible) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_DIFF_EDITORS_VISIBILITY,
    payload: {
      visible
    }
  };
}

function updateDiffEditors(diffEditors) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_DIFF_EDITORS,
    payload: diffEditors
  };
}

function updateDiffNavigatorVisibility(visible) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_DIFF_NAVIGATOR_VISIBILITY,
    payload: {
      visible
    }
  };
}

function updateActiveNavigationSection(sectionIndex) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_NAVIGATION_SECTION,
    payload: {
      sectionIndex
    }
  };
}

function updateDockConfig(shouldDockPublishView) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_DOCK_CONFIG,
    payload: {
      shouldDockPublishView
    }
  };
}