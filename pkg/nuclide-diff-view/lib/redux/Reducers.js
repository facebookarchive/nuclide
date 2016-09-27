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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionTypes2;

function _ActionTypes() {
  return _ActionTypes2 = _interopRequireWildcard(require('./ActionTypes'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _createEmptyAppState2;

function _createEmptyAppState() {
  return _createEmptyAppState2 = require('./createEmptyAppState');
}

function activeRepository(state, action) {
  switch (action.type) {
    case (_ActionTypes2 || _ActionTypes()).UPDATE_ACTIVE_REPOSITORY:
      return action.payload.hgRepository;
  }
  return state || (0, (_createEmptyAppState2 || _createEmptyAppState()).getEmptyActiveRepositoryState)();
}

function repositories(state, action) {
  switch (action.type) {
    case (_ActionTypes2 || _ActionTypes()).SET_COMPARE_ID:
    case (_ActionTypes2 || _ActionTypes()).UPDATE_DIRTY_FILES:
    case (_ActionTypes2 || _ActionTypes()).UPDATE_SELECTED_FILES:
    case (_ActionTypes2 || _ActionTypes()).UPDATE_HEAD_TO_FORKBASE_REVISIONS:
      {
        var repository = action.payload.repository;

        var oldRepositoryState = state.get(repository);
        (0, (_assert2 || _assert()).default)(oldRepositoryState != null);
        return new Map(state).set(repository, reduceRepositoryAction(oldRepositoryState, action));
      }
    case (_ActionTypes2 || _ActionTypes()).ADD_REPOSITORY:
      {
        var repository = action.payload.repository;

        return new Map(state).set(repository, (0, (_createEmptyAppState2 || _createEmptyAppState()).getEmptyRepositoryState)());
      }
    case (_ActionTypes2 || _ActionTypes()).REMOVE_REPOSITORY:
      {
        var repository = action.payload.repository;

        var newRepositories = new Map(state);
        newRepositories.delete(repository);
        return newRepositories;
      }
  }
  return state || (0, (_createEmptyAppState2 || _createEmptyAppState()).getEmptyRepositoriesState)();
}

function reduceRepositoryAction(repositoryState, action) {
  switch (action.type) {
    case (_ActionTypes2 || _ActionTypes()).SET_COMPARE_ID:
      return _extends({}, repositoryState, {
        compareRevisionId: action.payload.compareId
      });
    case (_ActionTypes2 || _ActionTypes()).UPDATE_DIRTY_FILES:
      return _extends({}, repositoryState, {
        dirtyFiles: action.payload.dirtyFiles
      });
    case (_ActionTypes2 || _ActionTypes()).UPDATE_SELECTED_FILES:
      return _extends({}, repositoryState, {
        selectedFiles: action.payload.selectedFiles
      });
    case (_ActionTypes2 || _ActionTypes()).UPDATE_HEAD_TO_FORKBASE_REVISIONS:
      return _extends({}, repositoryState, {
        headToForkBaseRevisions: action.payload.headToForkBaseRevisions,
        revisionStatuses: action.payload.revisionStatuses
      });
    default:
      throw new Error('Invalid Repository Action!');
  }
}

function commit(state, action) {
  switch (action.type) {
    case (_ActionTypes2 || _ActionTypes()).UPDATE_COMMIT_STATE:
      return action.payload.commit;
    case (_ActionTypes2 || _ActionTypes()).SET_COMMIT_MODE:
      return _extends({}, state, {
        mode: action.payload.commitMode
      });
  }
  return state || (0, (_createEmptyAppState2 || _createEmptyAppState()).getEmptyCommitState)();
}

function publish(state, action) {
  switch (action.type) {
    case (_ActionTypes2 || _ActionTypes()).UPDATE_PUBLISH_STATE:
      return action.payload.publish;
  }
  return state || (0, (_createEmptyAppState2 || _createEmptyAppState()).getEmptyPublishState)();
}

function fileDiff(state, action) {
  switch (action.type) {
    case (_ActionTypes2 || _ActionTypes()).UPDATE_FILE_DIFF:
      return action.payload.fileDiff;
  }
  return state || (0, (_createEmptyAppState2 || _createEmptyAppState()).getEmptyFileDiffState)();
}

function shouldRebaseOnAmend(state, action) {
  switch (action.type) {
    case (_ActionTypes2 || _ActionTypes()).SET_SHOULD_REBASE_ON_AMEND:
      return action.payload.shouldRebaseOnAmend;
  }
  return state || (0, (_createEmptyAppState2 || _createEmptyAppState()).getEmptyRebaseOnAmendState)();
}

function viewMode(state, action) {
  switch (action.type) {
    case (_ActionTypes2 || _ActionTypes()).SET_VIEW_MODE:
      return action.payload.viewMode;
  }
  return state || (0, (_createEmptyAppState2 || _createEmptyAppState()).getEmptyViewModeState)();
}