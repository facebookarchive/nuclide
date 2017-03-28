'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyActionMiddleware = applyActionMiddleware;

var _ActionType;

function _load_ActionType() {
  return _ActionType = _interopRequireWildcard(require('./ActionType'));
}

var _nuclideHgRepositoryClient;

function _load_nuclideHgRepositoryClient() {
  return _nuclideHgRepositoryClient = require('../../nuclide-hg-repository-client');
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _vcs;

function _load_vcs() {
  return _vcs = require('../../commons-atom/vcs');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const HANDLED_ACTION_TYPES = [(_ActionType || _load_ActionType()).CREATE_BOOKMARK, (_ActionType || _load_ActionType()).DELETE_BOOKMARK, (_ActionType || _load_ActionType()).FETCH_PROJECT_REPOSITORIES, (_ActionType || _load_ActionType()).RENAME_BOOKMARK, (_ActionType || _load_ActionType()).UPDATE_TO_BOOKMARK]; /**
                                                                                                                                                                                                                                                                                                                       * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                       * All rights reserved.
                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                       * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                                                                                                                       * the root directory of this source tree.
                                                                                                                                                                                                                                                                                                                       *
                                                                                                                                                                                                                                                                                                                       * 
                                                                                                                                                                                                                                                                                                                       */

function applyActionMiddleware(actions, getState) {
  const output = _rxjsBundlesRxMinJs.Observable.merge(
  // Skip unhandled ActionTypes.
  actions.filter(action => HANDLED_ACTION_TYPES.indexOf(action.type) === -1), actions.filter(action => action.type === (_ActionType || _load_ActionType()).CREATE_BOOKMARK).switchMap(action => {
    if (!(action.type === (_ActionType || _load_ActionType()).CREATE_BOOKMARK)) {
      throw new Error('Invariant violation: "action.type === ActionType.CREATE_BOOKMARK"');
    }

    const { name, repository } = action.payload;
    if (repository.getType() !== 'hg') {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    if (!(repository instanceof (_nuclideHgRepositoryClient || _load_nuclideHgRepositoryClient()).HgRepositoryClient)) {
      throw new Error('Invariant violation: "repository instanceof HgRepositoryClient"');
    }

    const stacked = (_featureConfig || _load_featureConfig()).default.get((_constants || _load_constants()).STACKED_CONFIG_KEY);
    let createBookmarkTask;

    if (stacked) {
      createBookmarkTask = _rxjsBundlesRxMinJs.Observable.fromPromise(repository.createBookmark(name));
    } else {
      createBookmarkTask = _rxjsBundlesRxMinJs.Observable.fromPromise(repository.checkoutForkBase()).switchMap(() => _rxjsBundlesRxMinJs.Observable.fromPromise(repository.createBookmark(name)));
    }

    // TODO(most): Add loading indicators.
    return createBookmarkTask.catch(error => {
      atom.notifications.addWarning('Failed to create bookmark', {
        detail: error,
        dismissable: true
      });
      return _rxjsBundlesRxMinJs.Observable.empty();
    }).ignoreElements();
  }),

  // Fetch and subscribe to repositories and their bookmarks.
  actions.filter(action => action.type === (_ActionType || _load_ActionType()).FETCH_PROJECT_REPOSITORIES).switchMap(action => {
    const { projectDirectories } = getState();

    return _rxjsBundlesRxMinJs.Observable.from(projectDirectories).flatMap(directory => {
      const repository = (0, (_vcs || _load_vcs()).repositoryForPath)(directory.getPath());
      if (repository == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      const setDirectoryAction = {
        payload: {
          directory,
          repository
        },
        type: (_ActionType || _load_ActionType()).SET_DIRECTORY_REPOSITORY
      };

      if (repository.getType() !== 'hg') {
        return _rxjsBundlesRxMinJs.Observable.of(setDirectoryAction);
      }

      // Type was checked with `getType`. Downcast to safely access members with Flow.

      if (!(repository instanceof (_nuclideHgRepositoryClient || _load_nuclideHgRepositoryClient()).HgRepositoryClient)) {
        throw new Error('Invariant violation: "repository instanceof HgRepositoryClient"');
      }

      const bookmarkUpdates = _rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(
      // Re-fetch when the list of bookmarks changes.
      repository.onDidChangeBookmarks.bind(repository)), (0, (_event || _load_event()).observableFromSubscribeFunction)(
      // Re-fetch when the active bookmark changes (called "short head" to match
      // Atom's Git API).
      repository.onDidChangeShortHead.bind(repository))).startWith(null) // Kick it off the first time
      .switchMap(() => {
        return _rxjsBundlesRxMinJs.Observable.fromPromise(repository.getBookmarks());
      }).map(bookmarks => ({
        type: (_ActionType || _load_ActionType()).SET_REPOSITORY_BOOKMARKS,
        payload: {
          bookmarks,
          // TODO(most): figure out flow type incompatability.
          repository: repository
        }
      }));

      const statusUpdates = _rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(repository.onDidChangeStatuses.bind(repository)), (0, (_event || _load_event()).observableFromSubscribeFunction)(repository.onDidChangeStatus.bind(repository))).startWith(null).switchMap(() => {
        return _rxjsBundlesRxMinJs.Observable.of({
          payload: {
            directory,
            repository
          },
          type: (_ActionType || _load_ActionType()).UPDATE_UNCOMMITTED_CHANGES
        });
      });

      return _rxjsBundlesRxMinJs.Observable.of(setDirectoryAction).concat(_rxjsBundlesRxMinJs.Observable.merge(bookmarkUpdates, statusUpdates));
    });
  }), actions.filter(action => action.type === (_ActionType || _load_ActionType()).UPDATE_TO_BOOKMARK).switchMap(action => {
    // Action was filtered, invariant check to downcast in Flow.
    if (!(action.type === (_ActionType || _load_ActionType()).UPDATE_TO_BOOKMARK)) {
      throw new Error('Invariant violation: "action.type === ActionType.UPDATE_TO_BOOKMARK"');
    }

    const { bookmark, repository } = action.payload;
    return _rxjsBundlesRxMinJs.Observable.fromPromise(repository.checkoutReference(bookmark.bookmark, false)).ignoreElements().catch(error => {
      atom.notifications.addWarning('Failed Updating to Bookmark', {
        description: 'Revert or commit uncommitted changes before changing bookmarks.',
        detail: error,
        dismissable: true
      });

      return _rxjsBundlesRxMinJs.Observable.empty();
    });
  }), actions.filter(action => action.type === (_ActionType || _load_ActionType()).RENAME_BOOKMARK).groupBy(action => {
    // Action was filtered, invariant check to downcast in Flow.
    if (!(action.type === (_ActionType || _load_ActionType()).RENAME_BOOKMARK)) {
      throw new Error('Invariant violation: "action.type === ActionType.RENAME_BOOKMARK"');
    }

    return action.payload.bookmark.rev;
  }).flatMap(renames => {
    return renames.switchMap(action => {
      // Action was filtered, invariant check to downcast in Flow.
      if (!(action.type === (_ActionType || _load_ActionType()).RENAME_BOOKMARK)) {
        throw new Error('Invariant violation: "action.type === ActionType.RENAME_BOOKMARK"');
      }

      const { repository } = action.payload;

      if (!(repository instanceof (_nuclideHgRepositoryClient || _load_nuclideHgRepositoryClient()).HgRepositoryClient)) {
        atom.notifications.addWarning('Failed Renaming Bookmark', {
          detail: `Expected repository type 'hg' but found ${repository.getType()}`,
          dismissable: true
        });
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      const {
        bookmark,
        nextName
      } = action.payload;

      return _rxjsBundlesRxMinJs.Observable.of({
        payload: {
          bookmark,
          repository
        },
        type: (_ActionType || _load_ActionType()).SET_BOOKMARK_IS_LOADING
      }).concat(_rxjsBundlesRxMinJs.Observable.fromPromise(repository.renameBookmark(bookmark.bookmark, nextName)).ignoreElements().catch(error => {
        atom.notifications.addWarning('Failed Renaming Bookmark', {
          detail: error,
          dismissable: true
        });

        return _rxjsBundlesRxMinJs.Observable.of({
          payload: {
            bookmark,
            repository
          },
          type: (_ActionType || _load_ActionType()).UNSET_BOOKMARK_IS_LOADING
        });
      }));
    });
  }), actions.filter(action => action.type === (_ActionType || _load_ActionType()).DELETE_BOOKMARK).groupBy(action => {
    // Action was filtered, invariant check to downcast in Flow.
    if (!(action.type === (_ActionType || _load_ActionType()).DELETE_BOOKMARK)) {
      throw new Error('Invariant violation: "action.type === ActionType.DELETE_BOOKMARK"');
    }

    return action.payload.bookmark.rev;
  }).flatMap(renames => {
    return renames.switchMap(action => {
      // Action was filtered, invariant check to downcast in Flow.
      if (!(action.type === (_ActionType || _load_ActionType()).DELETE_BOOKMARK)) {
        throw new Error('Invariant violation: "action.type === ActionType.DELETE_BOOKMARK"');
      }

      const { repository } = action.payload;

      if (!(repository instanceof (_nuclideHgRepositoryClient || _load_nuclideHgRepositoryClient()).HgRepositoryClient)) {
        atom.notifications.addWarning('Failed Deleting Bookmark', {
          detail: `Expected repository type 'hg' but found ${repository.getType()}`,
          dismissable: true
        });
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      const { bookmark } = action.payload;

      return _rxjsBundlesRxMinJs.Observable.of({
        payload: {
          bookmark,
          repository
        },
        type: (_ActionType || _load_ActionType()).SET_BOOKMARK_IS_LOADING
      }).concat(_rxjsBundlesRxMinJs.Observable.fromPromise(repository.deleteBookmark(bookmark.bookmark)).ignoreElements().catch(error => {
        atom.notifications.addWarning('Failed Deleting Bookmark', {
          detail: error,
          dismissable: true
        });

        return _rxjsBundlesRxMinJs.Observable.of({
          payload: {
            bookmark,
            repository
          },
          type: (_ActionType || _load_ActionType()).UNSET_BOOKMARK_IS_LOADING
        });
      }));
    });
  }));
  return output.share();
}