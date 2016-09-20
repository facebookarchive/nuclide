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

exports.addRepository = addRepository;
exports.setDiffOption = setDiffOption;
exports.setCompareId = setCompareId;
exports.updateDirtyFiles = updateDirtyFiles;
exports.removeRepository = removeRepository;
exports.activateRepository = activateRepository;
exports.deactivateRepository = deactivateRepository;
exports.updateSelectedFiles = updateSelectedFiles;
exports.updateHeadToForkBaseRevisionsState = updateHeadToForkBaseRevisionsState;

var _ActionTypes2;

function _ActionTypes() {
  return _ActionTypes2 = require('./ActionTypes');
}

function addRepository(repository) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).ADD_REPOSITORY,
    payload: {
      repository: repository
    }
  };
}

function setDiffOption(repository, diffOption) {
  return {
    type: (_ActionTypes2 || _ActionTypes()).SET_DIFF_OPTION,
    payload: {
      repository: repository,
      diffOption: diffOption
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
  // TODO(most): return and handle the real action.
  return {
    type: (_ActionTypes2 || _ActionTypes()).DUMMY
  };
}

function removeRepository(repository) {
  // TODO(most): return and handle the real action.
  return {
    type: (_ActionTypes2 || _ActionTypes()).DUMMY
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

function updateSelectedFiles(repository, revisionFileChanges) {
  // TODO(most): return and handle the real action.
  return {
    type: (_ActionTypes2 || _ActionTypes()).DUMMY
  };
}

function updateHeadToForkBaseRevisionsState(repository, revisions, revisionStatuses) {
  // TODO(most): return and handle the real action.
  return {
    type: (_ActionTypes2 || _ActionTypes()).DUMMY
  };
}