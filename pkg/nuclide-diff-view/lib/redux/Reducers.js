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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.activeRepository = activeRepository;
exports.repositories = repositories;
exports.commit = commit;
exports.publish = publish;
exports.fileDiff = fileDiff;
exports.shouldRebaseOnAmend = shouldRebaseOnAmend;
exports.viewMode = viewMode;
exports.cwdApi = cwdApi;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionTypes;

function _load_ActionTypes() {
  return _ActionTypes = _interopRequireWildcard(require('./ActionTypes'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _createEmptyAppState;

function _load_createEmptyAppState() {
  return _createEmptyAppState = require('./createEmptyAppState');
}

function activeRepository(state, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY:
      return action.payload.hgRepository;
  }
  return state || (0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyActiveRepositoryState)();
}

function repositories(state, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).SET_COMPARE_ID:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_DIRTY_FILES:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_SELECTED_FILES:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_HEAD_TO_FORKBASE_REVISIONS:
    case (_ActionTypes || _load_ActionTypes()).UPDATE_LOADING_SELECTED_FILES:
      {
        var repository = action.payload.repository;

        var oldRepositoryState = state.get(repository);
        (0, (_assert || _load_assert()).default)(oldRepositoryState != null);
        return new Map(state).set(repository, reduceRepositoryAction(oldRepositoryState, action));
      }
    case (_ActionTypes || _load_ActionTypes()).ADD_REPOSITORY:
      {
        var repository = action.payload.repository;

        return new Map(state).set(repository, (0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyRepositoryState)());
      }
    case (_ActionTypes || _load_ActionTypes()).REMOVE_REPOSITORY:
      {
        var repository = action.payload.repository;

        var newRepositories = new Map(state);
        newRepositories.delete(repository);
        return newRepositories;
      }
  }
  return state || (0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyRepositoriesState)();
}

function reduceRepositoryAction(repositoryState, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).SET_COMPARE_ID:
      return _extends({}, repositoryState, {
        compareRevisionId: action.payload.compareId
      });
    case (_ActionTypes || _load_ActionTypes()).UPDATE_DIRTY_FILES:
      return _extends({}, repositoryState, {
        dirtyFiles: action.payload.dirtyFiles
      });
    case (_ActionTypes || _load_ActionTypes()).UPDATE_SELECTED_FILES:
      return _extends({}, repositoryState, {
        selectedFiles: action.payload.selectedFiles
      });
    case (_ActionTypes || _load_ActionTypes()).UPDATE_HEAD_TO_FORKBASE_REVISIONS:
      return _extends({}, repositoryState, {
        headToForkBaseRevisions: action.payload.headToForkBaseRevisions,
        revisionStatuses: action.payload.revisionStatuses
      });
    case (_ActionTypes || _load_ActionTypes()).UPDATE_LOADING_SELECTED_FILES:
      return _extends({}, repositoryState, {
        isLoadingSelectedFiles: action.payload.isLoading
      });
    default:
      throw new Error('Invalid Repository Action!');
  }
}

function commit(state, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).UPDATE_COMMIT_STATE:
      return action.payload.commit;
    case (_ActionTypes || _load_ActionTypes()).SET_COMMIT_MODE:
      return _extends({}, state, {
        mode: action.payload.commitMode
      });
  }
  return state || (0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyCommitState)();
}

function publish(state, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).UPDATE_PUBLISH_STATE:
      return action.payload.publish;
  }
  return state || (0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyPublishState)();
}

function fileDiff(state, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).UPDATE_FILE_DIFF:
      return action.payload.fileDiff;
  }
  return state || (0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyFileDiffState)();
}

function shouldRebaseOnAmend(state, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).SET_SHOULD_REBASE_ON_AMEND:
      return action.payload.shouldRebaseOnAmend;
  }
  if (state === undefined) {
    return (0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyRebaseOnAmendState)();
  }
  return state;
}

function viewMode(state, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE:
      return action.payload.viewMode;
  }
  return state || (0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyViewModeState)();
}

function cwdApi(state, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).SET_CWD_API:
      return action.payload.cwdApi;
  }
  return state || null;
}