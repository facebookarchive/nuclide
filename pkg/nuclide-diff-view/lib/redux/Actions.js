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
exports.activateRepository = activateRepository;
exports.deactivateRepository = deactivateRepository;
exports.updateSelectedFiles = updateSelectedFiles;
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

var _ActionTypes2;

function _ActionTypes() {
  return _ActionTypes2 = require('./ActionTypes');
}

function openView() {
  return {
    type: (_ActionTypes2 || _ActionTypes()).OPEN_VIEW
  };
}

function closeView() {
  return {
    type: (_ActionTypes2 || _ActionTypes()).CLOSE_VIEW
  };
}

function addRepository(repository) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).ADD_REPOSITORY,
    payload: {
      repository: repository
    }
  };
}

function setCompareId(repository, compareId) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).SET_COMPARE_ID,
    payload: {
      repository: repository,
      compareId: compareId
    }
  };
}

function updateDirtyFiles(repository, dirtyFiles) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).UPDATE_DIRTY_FILES,
    payload: {
      repository: repository,
      dirtyFiles: dirtyFiles
    }
  };
}

function removeRepository(repository) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).REMOVE_REPOSITORY,
    payload: {
      repository: repository
    }
  };
}

function activateRepository(repository) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).ACTIVATE_REPOSITORY,
    payload: {
      repository: repository
    }
  };
}

function deactivateRepository(repository) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).DEACTIVATE_REPOSITORY,
    payload: {
      repository: repository
    }
  };
}

function updateSelectedFiles(repository, selectedFiles) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).UPDATE_SELECTED_FILES,
    payload: {
      repository: repository,
      selectedFiles: selectedFiles
    }
  };
}

function updateHeadToForkBaseRevisionsState(repository, headToForkBaseRevisions, revisionStatuses) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).UPDATE_HEAD_TO_FORKBASE_REVISIONS,
    payload: {
      repository: repository,
      headToForkBaseRevisions: headToForkBaseRevisions,
      revisionStatuses: revisionStatuses
    }
  };
}

function updateActiveRepository(hgRepository) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).UPDATE_ACTIVE_REPOSITORY,
    payload: {
      hgRepository: hgRepository
    }
  };
}

function setCwdApi(cwdApi) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).SET_CWD_API,
    payload: {
      cwdApi: cwdApi
    }
  };
}

function diffFile(filePath, onChangeModified) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).DIFF_FILE,
    payload: {
      filePath: filePath,
      onChangeModified: onChangeModified
    }
  };
}

function updateFileDiff(fileDiff) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).UPDATE_FILE_DIFF,
    payload: {
      fileDiff: fileDiff
    }
  };
}

function setViewMode(viewMode) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).SET_VIEW_MODE,
    payload: {
      viewMode: viewMode
    }
  };
}

function setCommitMode(commitMode) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).SET_COMMIT_MODE,
    payload: {
      commitMode: commitMode
    }
  };
}

function updateCommitState(commitState) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).UPDATE_COMMIT_STATE,
    payload: {
      commit: commitState
    }
  };
}

function updatePublishState(publish) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).UPDATE_PUBLISH_STATE,
    payload: {
      publish: publish
    }
  };
}

function setShouldRebaseOnAmend(shouldRebaseOnAmend) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).SET_SHOULD_REBASE_ON_AMEND,
    payload: {
      shouldRebaseOnAmend: shouldRebaseOnAmend
    }
  };
}

function commit(repository, message) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).COMMIT,
    payload: {
      message: message,
      repository: repository
    }
  };
}

function publishDiff(repository, message, lintExcuse, publishUpdates) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).PUBLISH_DIFF,
    payload: {
      lintExcuse: lintExcuse,
      message: message,
      publishUpdates: publishUpdates,
      repository: repository
    }
  };
}