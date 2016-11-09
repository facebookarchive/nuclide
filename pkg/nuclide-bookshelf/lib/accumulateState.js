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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.accumulateState = accumulateState;

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getEmptyRepositoryState() {
  return {
    activeShortHead: (_constants || _load_constants()).EMPTY_SHORTHEAD,
    isRestoring: false,
    shortHeadsToFileList: (_immutable || _load_immutable()).default.Map()
  };
}

function accumulateState(state, action) {
  switch (action.type) {
    case (_constants || _load_constants()).ActionType.ADD_PROJECT_REPOSITORY:
      return accumulateAddProjectRepository(state, action);

    case (_constants || _load_constants()).ActionType.REMOVE_PROJECT_REPOSITORY:
      return accumulateRemoveProjectRepository(state, action);

    case (_constants || _load_constants()).ActionType.UPDATE_PANE_ITEM_STATE:
      return accumulateUpdatePaneItemState(state, action);

    case (_constants || _load_constants()).ActionType.UPDATE_REPOSITORY_BOOKMARKS:
    case (_constants || _load_constants()).ActionType.START_RESTORING_REPOSITORY_STATE:
    case (_constants || _load_constants()).ActionType.COMPLETE_RESTORING_REPOSITORY_STATE:
      return accumulateRepositoryStateAction(state, action);

    default:
      return state;
  }
}

function accumulateAddProjectRepository(state, action) {

  const repositoryPath = action.payload.repository.getWorkingDirectory();
  const newRepositoryState = state.repositoryPathToState.get(repositoryPath) || getEmptyRepositoryState();
  return Object.assign({}, state, {
    repositoryPathToState: state.repositoryPathToState.set(repositoryPath, newRepositoryState)
  });
}

function accumulateRemoveProjectRepository(state, action) {

  const repositoryPath = action.payload.repository.getWorkingDirectory();
  return Object.assign({}, state, {
    repositoryPathToState: state.repositoryPathToState.delete(repositoryPath)
  });
}

function accumulateRepositoryStateAction(state, action) {
  const repositoryPath = action.payload.repository.getWorkingDirectory();

  const newRepositoryState = accumulateRepositoryState(state.repositoryPathToState.get(repositoryPath), action);
  return Object.assign({}, state, {
    repositoryPathToState: state.repositoryPathToState.set(repositoryPath, newRepositoryState)
  });
}

function accumulateRepositoryState(repositoryState, action) {
  switch (action.type) {
    case (_constants || _load_constants()).ActionType.UPDATE_REPOSITORY_BOOKMARKS:
      return accumulateRepositoryStateUpdateBookmarks(repositoryState, action);
    case (_constants || _load_constants()).ActionType.START_RESTORING_REPOSITORY_STATE:
      if (!repositoryState) {
        throw new Error('repository state not found when starting to restore!');
      }

      return Object.assign({}, repositoryState, {
        isRestoring: true
      });
    case (_constants || _load_constants()).ActionType.COMPLETE_RESTORING_REPOSITORY_STATE:
      if (!repositoryState) {
        throw new Error('repository state not found when starting to restore!');
      }

      return Object.assign({}, repositoryState, {
        isRestoring: false
      });
    default:
      return repositoryState || getEmptyRepositoryState();
  }
}

function accumulateRepositoryStateUpdateBookmarks(repositoryState_, action) {
  let repositoryState = repositoryState_;

  repositoryState = repositoryState || getEmptyRepositoryState();
  var _action$payload = action.payload;
  const bookmarkNames = _action$payload.bookmarkNames,
        activeShortHead = _action$payload.activeShortHead;
  var _repositoryState = repositoryState;
  let shortHeadsToFileList = _repositoryState.shortHeadsToFileList;
  // Invalidate removed bookmarks data.

  for (const shortHead of repositoryState.shortHeadsToFileList.keys()) {
    if (!bookmarkNames.has(shortHead)) {
      shortHeadsToFileList = shortHeadsToFileList.delete(shortHead);
    }
  }

  return Object.assign({}, repositoryState, {
    activeShortHead: activeShortHead,
    shortHeadsToFileList: shortHeadsToFileList
  });
}

function accumulateUpdatePaneItemState(state, action) {
  const repositoryPathToEditors = action.payload.repositoryPathToEditors;

  return Object.assign({}, state, {
    repositoryPathToState: (_immutable || _load_immutable()).default.Map(Array.from(state.repositoryPathToState.entries()).map((_ref) => {
      var _ref2 = _slicedToArray(_ref, 2);

      let repositoryPath = _ref2[0],
          repositoryState = _ref2[1];

      const fileList = (repositoryPathToEditors.get(repositoryPath) || []).map(textEditor => textEditor.getPath() || '');
      return [repositoryPath, accumulateRepositoryStateUpdatePaneItemState(repositoryState, fileList)];
    }))
  });
}

function accumulateRepositoryStateUpdatePaneItemState(repositoryState, fileList) {
  if (repositoryState.isRestoring) {
    return repositoryState;
  }
  return Object.assign({}, repositoryState, {
    shortHeadsToFileList: repositoryState.shortHeadsToFileList.set(repositoryState.activeShortHead, fileList)
  });
}