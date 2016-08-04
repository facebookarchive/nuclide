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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.accumulateState = accumulateState;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _immutable2;

function _immutable() {
  return _immutable2 = _interopRequireDefault(require('immutable'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

function getEmptyRepositoryState() {
  return {
    activeShortHead: (_constants2 || _constants()).EMPTY_SHORTHEAD,
    isRestoring: false,
    shortHeadsToFileList: (_immutable2 || _immutable()).default.Map()
  };
}

function accumulateState(state, action) {
  switch (action.type) {
    case (_constants2 || _constants()).ActionType.ADD_PROJECT_REPOSITORY:
      return accumulateAddProjectRepository(state, action);

    case (_constants2 || _constants()).ActionType.REMOVE_PROJECT_REPOSITORY:
      return accumulateRemoveProjectRepository(state, action);

    case (_constants2 || _constants()).ActionType.UPDATE_PANE_ITEM_STATE:
      return accumulateUpdatePaneItemState(state, action);

    case (_constants2 || _constants()).ActionType.UPDATE_REPOSITORY_BOOKMARKS:
    case (_constants2 || _constants()).ActionType.START_RESTORING_REPOSITORY_STATE:
    case (_constants2 || _constants()).ActionType.COMPLETE_RESTORING_REPOSITORY_STATE:
      return accumulateRepositoryStateAction(state, action);

    default:
      return state;
  }
}

function accumulateAddProjectRepository(state, action) {

  var repositoryPath = action.payload.repository.getWorkingDirectory();
  var newRepositoryState = state.repositoryPathToState.get(repositoryPath) || getEmptyRepositoryState();
  return _extends({}, state, {
    repositoryPathToState: state.repositoryPathToState.set(repositoryPath, newRepositoryState)
  });
}

function accumulateRemoveProjectRepository(state, action) {

  var repositoryPath = action.payload.repository.getWorkingDirectory();
  return _extends({}, state, {
    repositoryPathToState: state.repositoryPathToState.delete(repositoryPath)
  });
}

function accumulateRepositoryStateAction(state, action) {
  var repositoryPath = action.payload.repository.getWorkingDirectory();

  var newRepositoryState = accumulateRepositoryState(state.repositoryPathToState.get(repositoryPath), action);
  return _extends({}, state, {
    repositoryPathToState: state.repositoryPathToState.set(repositoryPath, newRepositoryState)
  });
}

function accumulateRepositoryState(repositoryState, action) {
  switch (action.type) {
    case (_constants2 || _constants()).ActionType.UPDATE_REPOSITORY_BOOKMARKS:
      return accumulateRepositoryStateUpdateBookmarks(repositoryState, action);
    case (_constants2 || _constants()).ActionType.START_RESTORING_REPOSITORY_STATE:
      (0, (_assert2 || _assert()).default)(repositoryState, 'repository state not found when starting to restore!');
      return _extends({}, repositoryState, {
        isRestoring: true
      });
    case (_constants2 || _constants()).ActionType.COMPLETE_RESTORING_REPOSITORY_STATE:
      (0, (_assert2 || _assert()).default)(repositoryState, 'repository state not found when starting to restore!');
      return _extends({}, repositoryState, {
        isRestoring: false
      });
    default:
      return repositoryState || getEmptyRepositoryState();
  }
}

function accumulateRepositoryStateUpdateBookmarks(repositoryState_, action) {
  var repositoryState = repositoryState_;

  repositoryState = repositoryState || getEmptyRepositoryState();
  var _action$payload = action.payload;
  var bookmarkNames = _action$payload.bookmarkNames;
  var activeShortHead = _action$payload.activeShortHead;
  var _repositoryState = repositoryState;
  var shortHeadsToFileList = _repositoryState.shortHeadsToFileList;

  // Invalidate removed bookmarks data.
  for (var shortHead of repositoryState.shortHeadsToFileList.keys()) {
    if (!bookmarkNames.has(shortHead)) {
      shortHeadsToFileList = shortHeadsToFileList.delete(shortHead);
    }
  }

  return _extends({}, repositoryState, {
    activeShortHead: activeShortHead,
    shortHeadsToFileList: shortHeadsToFileList
  });
}

function accumulateUpdatePaneItemState(state, action) {
  var repositoryPathToEditors = action.payload.repositoryPathToEditors;

  return _extends({}, state, {
    repositoryPathToState: (_immutable2 || _immutable()).default.Map(Array.from(state.repositoryPathToState.entries()).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var repositoryPath = _ref2[0];
      var repositoryState = _ref2[1];

      var fileList = (repositoryPathToEditors.get(repositoryPath) || []).map(function (textEditor) {
        return textEditor.getPath() || '';
      });
      return [repositoryPath, accumulateRepositoryStateUpdatePaneItemState(repositoryState, fileList)];
    }))
  });
}

function accumulateRepositoryStateUpdatePaneItemState(repositoryState, fileList) {
  if (repositoryState.isRestoring) {
    return repositoryState;
  }
  return _extends({}, repositoryState, {
    shortHeadsToFileList: repositoryState.shortHeadsToFileList.set(repositoryState.activeShortHead, fileList)
  });
}