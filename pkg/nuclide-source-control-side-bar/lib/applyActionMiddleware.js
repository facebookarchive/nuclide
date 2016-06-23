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

var _ActionType2;

function _ActionType() {
  return _ActionType2 = _interopRequireWildcard(require('./ActionType'));
}

var _nuclideHgRepositoryClient2;

function _nuclideHgRepositoryClient() {
  return _nuclideHgRepositoryClient2 = require('../../nuclide-hg-repository-client');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _nuclideHgGitBridge2;

function _nuclideHgGitBridge() {
  return _nuclideHgGitBridge2 = require('../../nuclide-hg-git-bridge');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var HANDLED_ACTION_TYPES = [(_ActionType2 || _ActionType()).FETCH_PROJECT_REPOSITORIES, (_ActionType2 || _ActionType()).UPDATE_TO_BOOKMARK];

function applyActionMiddleware(actions, getState) {
  var output = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.merge(
  // Skip unhandled ActionTypes.
  actions.filter(function (action) {
    return HANDLED_ACTION_TYPES.indexOf(action.type) === -1;
  }),

  // Fetch and subscribe to repositories and their bookmarks.
  actions.filter(function (action) {
    return action.type === (_ActionType2 || _ActionType()).FETCH_PROJECT_REPOSITORIES;
  }).switchMap(function (action) {
    var _getState = getState();

    var projectDirectories = _getState.projectDirectories;

    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.from(projectDirectories).flatMap(function (directory) {
      var repository = (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).repositoryForPath)(directory.getPath());
      if (repository == null || repository.getType() !== 'hg') {
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.empty();
      }

      var repositoryAsync = repository.async;

      // Type was checked with `getType`. Downcast to safely access members with Flow.
      (0, (_assert2 || _assert()).default)(repositoryAsync instanceof (_nuclideHgRepositoryClient2 || _nuclideHgRepositoryClient()).HgRepositoryClientAsync);

      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.of({
        payload: {
          directory: directory,
          repository: repository
        },
        type: (_ActionType2 || _ActionType()).SET_DIRECTORY_REPOSITORY
      }).concat((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.merge((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(
      // Re-fetch when the list of bookmarks changes.
      repositoryAsync.onDidChangeBookmarks.bind(repositoryAsync)), (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(
      // Re-fetch when the active bookmark changes (called "short head" to match
      // Atom's Git API).
      repositoryAsync.onDidChangeShortHead.bind(repositoryAsync))).startWith(null) // Kick it off the first time
      .switchMap(function () {
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.fromPromise(repositoryAsync.getBookmarks());
      }).map(function (bookmarks) {
        return {
          payload: {
            bookmarks: bookmarks,
            repository: repository
          },
          type: (_ActionType2 || _ActionType()).SET_REPOSITORY_BOOKMARKS
        };
      }));
    });
  }), actions.filter(function (action) {
    return action.type === (_ActionType2 || _ActionType()).UPDATE_TO_BOOKMARK;
  }).switchMap(function (action) {
    // Action was filtered, invariant check to downcast in Flow.
    (0, (_assert2 || _assert()).default)(action.type === (_ActionType2 || _ActionType()).UPDATE_TO_BOOKMARK);

    var _action$payload = action.payload;
    var bookmark = _action$payload.bookmark;
    var repository = _action$payload.repository;

    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.fromPromise(repository.async.checkoutReference(bookmark.bookmark, false)).catch(function (error) {
      atom.notifications.addWarning('Failed Updating to Bookmark', {
        description: 'Revert or commit uncommitted changes before changing bookmarks.',
        detail: error,
        dismissable: true
      });

      // Replace previous, single-use Promise Observable with an empty one because the former
      // will be completed and not re-subscribable (which is the default action for `catch`).
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.empty();
    })
    // Middlware always returns an action. Return a no-op but handled action so the state
    // accumulator is happy.
    .map(function () {
      return {
        type: (_ActionType2 || _ActionType()).SET_PENDING_BOOKMARK
      };
    });
  }));
  return output.share();
}