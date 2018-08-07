"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.accumulateState = accumulateState;

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
function getEmptyRepositoryState() {
  return {
    activeShortHead: _constants().EMPTY_SHORTHEAD,
    isRestoring: false,
    shortHeadsToFileList: Immutable().Map()
  };
}

function accumulateState(state, action) {
  switch (action.type) {
    case _constants().ActionType.ADD_PROJECT_REPOSITORY:
      return accumulateAddProjectRepository(state, action);

    case _constants().ActionType.REMOVE_PROJECT_REPOSITORY:
      return accumulateRemoveProjectRepository(state, action);

    case _constants().ActionType.UPDATE_PANE_ITEM_STATE:
      return accumulateUpdatePaneItemState(state, action);

    case _constants().ActionType.UPDATE_REPOSITORY_BOOKMARKS:
    case _constants().ActionType.START_RESTORING_REPOSITORY_STATE:
    case _constants().ActionType.COMPLETE_RESTORING_REPOSITORY_STATE:
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
    case _constants().ActionType.UPDATE_REPOSITORY_BOOKMARKS:
      return accumulateRepositoryStateUpdateBookmarks(repositoryState, action);

    case _constants().ActionType.START_RESTORING_REPOSITORY_STATE:
      if (!repositoryState) {
        throw new Error('repository state not found when starting to restore!');
      }

      return Object.assign({}, repositoryState, {
        isRestoring: true
      });

    case _constants().ActionType.COMPLETE_RESTORING_REPOSITORY_STATE:
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
  const {
    bookmarkNames,
    activeShortHead
  } = action.payload;
  let {
    shortHeadsToFileList
  } = repositoryState; // Invalidate removed bookmarks data.

  for (const shortHead of repositoryState.shortHeadsToFileList.keys()) {
    if (!bookmarkNames.has(shortHead)) {
      shortHeadsToFileList = shortHeadsToFileList.delete(shortHead);
    }
  }

  return Object.assign({}, repositoryState, {
    activeShortHead,
    shortHeadsToFileList
  });
}

function accumulateUpdatePaneItemState(state, action) {
  const {
    repositoryPathToEditors
  } = action.payload;
  return Object.assign({}, state, {
    repositoryPathToState: Immutable().Map(Array.from(state.repositoryPathToState.entries()).map(([repositoryPath, repositoryState]) => {
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