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

exports.applyActionMiddleware = applyActionMiddleware;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var HANDLED_ACTION_TYPES = [(_constants2 || _constants()).ActionType.ADD_PROJECT_REPOSITORY, (_constants2 || _constants()).ActionType.RESTORE_PANE_ITEM_STATE];

function getActionsOfType(actions, type) {
  return actions.filter(function (action) {
    return action.type === type;
  });
}

function applyActionMiddleware(actions, getState) {
  var output = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge(
  // Let the unhandled ActionTypes pass through.
  actions.filter(function (action) {
    return HANDLED_ACTION_TYPES.indexOf(action.type) === -1;
  }), getActionsOfType(actions, (_constants2 || _constants()).ActionType.ADD_PROJECT_REPOSITORY).flatMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_constants2 || _constants()).ActionType.ADD_PROJECT_REPOSITORY);
    return watchProjectRepository(action, getState);
  }), getActionsOfType(actions, (_constants2 || _constants()).ActionType.RESTORE_PANE_ITEM_STATE).switchMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_constants2 || _constants()).ActionType.RESTORE_PANE_ITEM_STATE);
    return restorePaneItemState(action, getState);
  }));
  return output.share();
}

function watchProjectRepository(action, getState) {
  var repository = action.payload.repository;

  var repositoryAsync = repository.async;
  // Type was checked with `getType`. Downcast to safely access members with Flow.
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(
  // Re-fetch when the list of bookmarks changes.
  repositoryAsync.onDidChangeBookmarks.bind(repositoryAsync)), (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(
  // Re-fetch when the active bookmark changes (called "short head" to match
  // Atom's Git API).
  repositoryAsync.onDidChangeShortHead.bind(repositoryAsync))).startWith(null) // Kick it off the first time
  .switchMap(function () {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromPromise(repositoryAsync.getBookmarks());
  }).map(function (bookmarks) {
    var bookmarkNames = new Set(bookmarks.map(function (bookmark) {
      return bookmark.bookmark;
    }).concat([(_constants2 || _constants()).EMPTY_SHORTHEAD]));

    var activeBookmark = bookmarks.filter(function (bookmark) {
      return bookmark.active;
    })[0];
    var activeShortHead = activeBookmark == null ? (_constants2 || _constants()).EMPTY_SHORTHEAD : activeBookmark.bookmark;

    return {
      payload: {
        activeShortHead: activeShortHead,
        bookmarkNames: bookmarkNames,
        repository: repository
      },
      type: (_constants2 || _constants()).ActionType.UPDATE_REPOSITORY_BOOKMARKS
    };
  }).takeUntil((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(repository.onDidDestroy.bind(repository))).concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of({
    payload: {
      repository: repository
    },
    type: (_constants2 || _constants()).ActionType.REMOVE_PROJECT_REPOSITORY
  }));
}

function restorePaneItemState(action, getState) {
  var _action$payload = action.payload;
  var repository = _action$payload.repository;
  var shortHead = _action$payload.shortHead;

  var repositoryState = getState().repositoryPathToState.get(repository.getWorkingDirectory());
  if (repositoryState == null) {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
  }

  // TODO(most): refactor to a `Set` all the way.
  var fileUris = new Set(repositoryState.shortHeadsToFileList.get(shortHead) || []);

  var oldOpenEditors = (0, (_utils2 || _utils()).getRepoPathToEditors)().get(repository.getWorkingDirectory()) || [];
  var oldOpenUris = oldOpenEditors.map(function (textEditor) {
    return textEditor.getPath() || '';
  });

  var editorsToReload = oldOpenEditors.filter(function (textEditor) {
    return fileUris.has(textEditor.getPath() || '');
  });
  var editorsToClose = oldOpenEditors.filter(function (textEditor) {
    return !fileUris.has(textEditor.getPath() || '');
  });
  var urisToOpen = Array.from(fileUris).filter(function (fileUri) {
    return oldOpenUris.indexOf(fileUri) === -1;
  });

  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of({
    payload: {
      repository: repository
    },
    type: (_constants2 || _constants()).ActionType.START_RESTORING_REPOSITORY_STATE
  }), (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(editorsToClose)
  // Close the open files from the old short head.
  .map(function (textEditor) {
    var editorPane = atom.workspace.paneForItem(textEditor);
    (0, (_assert2 || _assert()).default)(editorPane);
    editorPane.destroyItem(textEditor);
  }).ignoreElements(),
  // Note: the reloading step can be omitted if the file watchers are proven to be robust.
  // But that's not the case; hence, a reload on bookmark switch/restore doesn't hurt.
  (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(editorsToReload).flatMap(function (textEditor) {
    // Reload the open files that also exist to be in the current.
    if (textEditor.isModified()) {
      // If the filesystem version has changed while it's edited,
      // the user will be prompted to resolve the conflict: `file-watcher`.
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
    } else {
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromPromise(textEditor.getBuffer().load());
    }
  }).ignoreElements(), (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(urisToOpen).flatMap(function (fileUri) {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromPromise(atom.workspace.open(fileUri));
  }).ignoreElements(), (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of({
    payload: {
      repository: repository
    },
    type: (_constants2 || _constants()).ActionType.COMPLETE_RESTORING_REPOSITORY_STATE
  }));
}