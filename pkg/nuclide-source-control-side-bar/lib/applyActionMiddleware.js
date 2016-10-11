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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionType;

function _load_ActionType() {
  return _ActionType = _interopRequireWildcard(require('./ActionType'));
}

var _nuclideHgRepositoryClient;

function _load_nuclideHgRepositoryClient() {
  return _nuclideHgRepositoryClient = require('../../nuclide-hg-repository-client');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
}

var _nuclideHgGitBridge;

function _load_nuclideHgGitBridge() {
  return _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var HANDLED_ACTION_TYPES = [(_ActionType || _load_ActionType()).DELETE_BOOKMARK, (_ActionType || _load_ActionType()).FETCH_PROJECT_REPOSITORIES, (_ActionType || _load_ActionType()).RENAME_BOOKMARK, (_ActionType || _load_ActionType()).UPDATE_TO_BOOKMARK];

function applyActionMiddleware(actions, getState) {
  var output = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge(
  // Skip unhandled ActionTypes.
  actions.filter(function (action) {
    return HANDLED_ACTION_TYPES.indexOf(action.type) === -1;
  }),

  // Fetch and subscribe to repositories and their bookmarks.
  actions.filter(function (action) {
    return action.type === (_ActionType || _load_ActionType()).FETCH_PROJECT_REPOSITORIES;
  }).switchMap(function (action) {
    var _getState = getState();

    var projectDirectories = _getState.projectDirectories;

    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.from(projectDirectories).flatMap(function (directory) {
      var repository = (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(directory.getPath());
      if (repository == null) {
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
      }

      var observable = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of({
        payload: {
          directory: directory,
          repository: repository
        },
        type: (_ActionType || _load_ActionType()).SET_DIRECTORY_REPOSITORY
      });

      if (repository.getType() === 'hg') {
        // Type was checked with `getType`. Downcast to safely access members with Flow.
        (0, (_assert || _load_assert()).default)(repository instanceof (_nuclideHgRepositoryClient || _load_nuclideHgRepositoryClient()).HgRepositoryClient);
        observable = observable.concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge((0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(
        // Re-fetch when the list of bookmarks changes.
        repository.onDidChangeBookmarks.bind(repository)), (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(
        // Re-fetch when the active bookmark changes (called "short head" to match
        // Atom's Git API).
        repository.onDidChangeShortHead.bind(repository))).startWith(null) // Kick it off the first time
        .switchMap(function () {
          return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(repository.getBookmarks());
        }).map(function (bookmarks) {
          return {
            type: (_ActionType || _load_ActionType()).SET_REPOSITORY_BOOKMARKS,
            payload: {
              bookmarks: bookmarks,
              // TODO(most): figure out flow type incompatability.
              repository: repository
            }
          };
        }));
      }

      return observable;
    });
  }), actions.filter(function (action) {
    return action.type === (_ActionType || _load_ActionType()).UPDATE_TO_BOOKMARK;
  }).switchMap(function (action) {
    // Action was filtered, invariant check to downcast in Flow.
    (0, (_assert || _load_assert()).default)(action.type === (_ActionType || _load_ActionType()).UPDATE_TO_BOOKMARK);

    var _action$payload = action.payload;
    var bookmark = _action$payload.bookmark;
    var repository = _action$payload.repository;

    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(repository.checkoutReference(bookmark.bookmark, false)).ignoreElements().catch(function (error) {
      atom.notifications.addWarning('Failed Updating to Bookmark', {
        description: 'Revert or commit uncommitted changes before changing bookmarks.',
        detail: error,
        dismissable: true
      });

      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
    });
  }), actions.filter(function (action) {
    return action.type === (_ActionType || _load_ActionType()).RENAME_BOOKMARK;
  }).groupBy(function (action) {
    // Action was filtered, invariant check to downcast in Flow.
    (0, (_assert || _load_assert()).default)(action.type === (_ActionType || _load_ActionType()).RENAME_BOOKMARK);
    return action.payload.bookmark.rev;
  }).flatMap(function (renames) {
    return renames.switchMap(function (action) {
      // Action was filtered, invariant check to downcast in Flow.
      (0, (_assert || _load_assert()).default)(action.type === (_ActionType || _load_ActionType()).RENAME_BOOKMARK);
      var repository = action.payload.repository;

      if (!(repository instanceof (_nuclideHgRepositoryClient || _load_nuclideHgRepositoryClient()).HgRepositoryClient)) {
        atom.notifications.addWarning('Failed Renaming Bookmark', {
          detail: 'Expected repository type \'hg\' but found ' + repository.getType(),
          dismissable: true
        });
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
      }
      var _action$payload2 = action.payload;
      var bookmark = _action$payload2.bookmark;
      var nextName = _action$payload2.nextName;

      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of({
        payload: {
          bookmark: bookmark,
          repository: repository
        },
        type: (_ActionType || _load_ActionType()).SET_BOOKMARK_IS_LOADING
      }).concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(repository.renameBookmark(bookmark.bookmark, nextName)).ignoreElements().catch(function (error) {
        atom.notifications.addWarning('Failed Renaming Bookmark', {
          detail: error,
          dismissable: true
        });

        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of({
          payload: {
            bookmark: bookmark,
            repository: repository
          },
          type: (_ActionType || _load_ActionType()).UNSET_BOOKMARK_IS_LOADING
        });
      }));
    });
  }), actions.filter(function (action) {
    return action.type === (_ActionType || _load_ActionType()).DELETE_BOOKMARK;
  }).groupBy(function (action) {
    // Action was filtered, invariant check to downcast in Flow.
    (0, (_assert || _load_assert()).default)(action.type === (_ActionType || _load_ActionType()).DELETE_BOOKMARK);
    return action.payload.bookmark.rev;
  }).flatMap(function (renames) {
    return renames.switchMap(function (action) {
      // Action was filtered, invariant check to downcast in Flow.
      (0, (_assert || _load_assert()).default)(action.type === (_ActionType || _load_ActionType()).DELETE_BOOKMARK);
      var repository = action.payload.repository;

      if (!(repository instanceof (_nuclideHgRepositoryClient || _load_nuclideHgRepositoryClient()).HgRepositoryClient)) {
        atom.notifications.addWarning('Failed Deleting Bookmark', {
          detail: 'Expected repository type \'hg\' but found ' + repository.getType(),
          dismissable: true
        });
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
      }
      var bookmark = action.payload.bookmark;

      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of({
        payload: {
          bookmark: bookmark,
          repository: repository
        },
        type: (_ActionType || _load_ActionType()).SET_BOOKMARK_IS_LOADING
      }).concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(repository.deleteBookmark(bookmark.bookmark)).ignoreElements().catch(function (error) {
        atom.notifications.addWarning('Failed Deleting Bookmark', {
          detail: error,
          dismissable: true
        });

        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of({
          payload: {
            bookmark: bookmark,
            repository: repository
          },
          type: (_ActionType || _load_ActionType()).UNSET_BOOKMARK_IS_LOADING
        });
      }));
    });
  }));
  return output.share();
}