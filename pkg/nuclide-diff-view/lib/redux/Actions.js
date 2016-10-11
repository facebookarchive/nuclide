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

exports.openView = openView;
exports.closeView = closeView;
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
exports.setViewMode = setViewMode;
exports.setCommitMode = setCommitMode;
exports.updateCommitState = updateCommitState;
exports.updatePublishState = updatePublishState;
exports.setShouldRebaseOnAmend = setShouldRebaseOnAmend;
exports.commit = commit;
exports.publishDiff = publishDiff;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionTypes;

function _load_ActionTypes() {
  return _ActionTypes = _interopRequireWildcard(require('./ActionTypes'));
}

function openView() {
  return {
    type: (_ActionTypes || _load_ActionTypes()).OPEN_VIEW
  };
}

function closeView() {
  return {
    type: (_ActionTypes || _load_ActionTypes()).CLOSE_VIEW
  };
}

function addRepository(repository) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).ADD_REPOSITORY,
    payload: {
      repository: repository
    }
  };
}

function setCompareId(repository, compareId) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).SET_COMPARE_ID,
    payload: {
      repository: repository,
      compareId: compareId
    }
  };
}

function updateDirtyFiles(repository, dirtyFiles) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_DIRTY_FILES,
    payload: {
      repository: repository,
      dirtyFiles: dirtyFiles
    }
  };
}

function removeRepository(repository) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).REMOVE_REPOSITORY,
    payload: {
      repository: repository
    }
  };
}

function updateSelectedFiles(repository, selectedFiles) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_SELECTED_FILES,
    payload: {
      repository: repository,
      selectedFiles: selectedFiles
    }
  };
}

function updateLoadingSelectedFiles(repository, isLoading) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_LOADING_SELECTED_FILES,
    payload: {
      repository: repository,
      isLoading: isLoading
    }
  };
}

function updateHeadToForkBaseRevisionsState(repository, headToForkBaseRevisions, revisionStatuses) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_HEAD_TO_FORKBASE_REVISIONS,
    payload: {
      repository: repository,
      headToForkBaseRevisions: headToForkBaseRevisions,
      revisionStatuses: revisionStatuses
    }
  };
}

function updateActiveRepository(hgRepository) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY,
    payload: {
      hgRepository: hgRepository
    }
  };
}

function setCwdApi(cwdApi) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).SET_CWD_API,
    payload: {
      cwdApi: cwdApi
    }
  };
}

function diffFile(filePath, onChangeModified) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).DIFF_FILE,
    payload: {
      filePath: filePath,
      onChangeModified: onChangeModified
    }
  };
}

function updateFileDiff(fileDiff) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_FILE_DIFF,
    payload: {
      fileDiff: fileDiff
    }
  };
}

function setViewMode(viewMode) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE,
    payload: {
      viewMode: viewMode
    }
  };
}

function setCommitMode(commitMode) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).SET_COMMIT_MODE,
    payload: {
      commitMode: commitMode
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

function updatePublishState(publish) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_PUBLISH_STATE,
    payload: {
      publish: publish
    }
  };
}

function setShouldRebaseOnAmend(shouldRebaseOnAmend) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).SET_SHOULD_REBASE_ON_AMEND,
    payload: {
      shouldRebaseOnAmend: shouldRebaseOnAmend
    }
  };
}

function commit(repository, message) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).COMMIT,
    payload: {
      message: message,
      repository: repository
    }
  };
}

function publishDiff(repository, message, isPrepareMode, lintExcuse, publishUpdates) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).PUBLISH_DIFF,
    payload: {
      isPrepareMode: isPrepareMode,
      lintExcuse: lintExcuse,
      message: message,
      publishUpdates: publishUpdates,
      repository: repository
    }
  };
}