"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyActionMiddleware = applyActionMiddleware;

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
const HANDLED_ACTION_TYPES = [_constants().ActionType.ADD_PROJECT_REPOSITORY, _constants().ActionType.RESTORE_PANE_ITEM_STATE];

function getActionsOfType(actions, type) {
  return actions.filter(action => action.type === type);
}

function applyActionMiddleware(actions, getState) {
  const output = _RxMin.Observable.merge( // Let the unhandled ActionTypes pass through.
  actions.filter(action => HANDLED_ACTION_TYPES.indexOf(action.type) === -1), getActionsOfType(actions, _constants().ActionType.ADD_PROJECT_REPOSITORY).flatMap(action => {
    if (!(action.type === _constants().ActionType.ADD_PROJECT_REPOSITORY)) {
      throw new Error("Invariant violation: \"action.type === ActionType.ADD_PROJECT_REPOSITORY\"");
    }

    return watchProjectRepository(action, getState);
  }), getActionsOfType(actions, _constants().ActionType.RESTORE_PANE_ITEM_STATE).switchMap(action => {
    if (!(action.type === _constants().ActionType.RESTORE_PANE_ITEM_STATE)) {
      throw new Error("Invariant violation: \"action.type === ActionType.RESTORE_PANE_ITEM_STATE\"");
    }

    return restorePaneItemState(action, getState);
  }));

  return output.share();
}

function watchProjectRepository(action, getState) {
  const {
    repository
  } = action.payload;
  const hgRepository = repository; // Type was checked with `getType`. Downcast to safely access members with Flow.

  return hgRepository.observeBookmarks().map(bookmarks => {
    const bookmarkNames = new Set(bookmarks.map(bookmark => bookmark.bookmark).concat([_constants().EMPTY_SHORTHEAD]));
    const activeBookmark = bookmarks.filter(bookmark => bookmark.active)[0];
    const activeShortHead = activeBookmark == null ? _constants().EMPTY_SHORTHEAD : activeBookmark.bookmark;
    return {
      payload: {
        activeShortHead,
        bookmarkNames,
        repository
      },
      type: _constants().ActionType.UPDATE_REPOSITORY_BOOKMARKS
    };
  }).takeUntil((0, _event().observableFromSubscribeFunction)(repository.onDidDestroy.bind(repository))).concat(_RxMin.Observable.of({
    payload: {
      repository
    },
    type: _constants().ActionType.REMOVE_PROJECT_REPOSITORY
  }));
}

function restorePaneItemState(action, getState) {
  const {
    repository,
    shortHead
  } = action.payload;
  const repositoryState = getState().repositoryPathToState.get(repository.getWorkingDirectory());

  if (repositoryState == null) {
    return _RxMin.Observable.empty();
  } // TODO(most): refactor to a `Set` all the way.


  const fileUris = new Set(repositoryState.shortHeadsToFileList.get(shortHead) || []);
  const oldOpenEditors = (0, _utils().getRepoPathToEditors)().get(repository.getWorkingDirectory()) || [];
  const oldOpenUris = oldOpenEditors.map(textEditor => textEditor.getPath() || '');
  const editorsToReload = oldOpenEditors.filter(textEditor => fileUris.has(textEditor.getPath() || ''));
  const editorsToClose = oldOpenEditors.filter(textEditor => !fileUris.has(textEditor.getPath() || ''));
  const urisToOpen = Array.from(fileUris).filter(fileUri => oldOpenUris.indexOf(fileUri) === -1);
  return _RxMin.Observable.concat(_RxMin.Observable.of({
    payload: {
      repository
    },
    type: _constants().ActionType.START_RESTORING_REPOSITORY_STATE
  }), _RxMin.Observable.from(editorsToClose) // Close the open files from the old short head.
  .map(textEditor => {
    const editorPane = atom.workspace.paneForItem(textEditor);

    if (editorPane != null) {
      editorPane.destroyItem(textEditor);
    } else {
      textEditor.destroy();
    }
  }).catch(error => {
    (0, _log4js().getLogger)('nuclide-bookshelf').error('bookshelf failed to close some editors', error);
    return _RxMin.Observable.empty();
  }).ignoreElements(), // Note: the reloading step can be omitted if the file watchers are proven to be robust.
  // But that's not the case; hence, a reload on bookmark switch/restore doesn't hurt.
  _RxMin.Observable.from(editorsToReload).flatMap(textEditor => {
    // Reload the open files that also exist to be in the current.
    if (textEditor.isModified()) {
      // If the filesystem version has changed while it's edited,
      // the user will be prompted to resolve the conflict: `file-watcher`.
      return _RxMin.Observable.empty();
    } else {
      return _RxMin.Observable.fromPromise(textEditor.getBuffer().load());
    }
  }).catch(error => {
    (0, _log4js().getLogger)('nuclide-bookshelf').error('bookshelf failed to reload some editors', error);
    return _RxMin.Observable.empty();
  }).ignoreElements(), _RxMin.Observable.from(urisToOpen).flatMap(fileUri => {
    return _RxMin.Observable.fromPromise((0, _goToLocation().goToLocation)(fileUri));
  }).catch(error => {
    (0, _log4js().getLogger)('nuclide-bookshelf').error('bookshelf failed to open some editors', error);
    return _RxMin.Observable.empty();
  }).ignoreElements(), _RxMin.Observable.of({
    payload: {
      repository
    },
    type: _constants().ActionType.COMPLETE_RESTORING_REPOSITORY_STATE
  }));
}