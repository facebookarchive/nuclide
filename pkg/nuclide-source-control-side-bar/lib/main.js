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

exports.activate = activate;
exports.consumeNuclideSideBar = consumeNuclideSideBar;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionType2;

function _ActionType() {
  return _ActionType2 = _interopRequireWildcard(require('./ActionType'));
}

var _applyActionMiddleware2;

function _applyActionMiddleware() {
  return _applyActionMiddleware2 = require('./applyActionMiddleware');
}

var _nuclideUiLibBindObservableAsProps2;

function _nuclideUiLibBindObservableAsProps() {
  return _nuclideUiLibBindObservableAsProps2 = require('../../nuclide-ui/lib/bindObservableAsProps');
}

var _bookmarkIsEqual2;

function _bookmarkIsEqual() {
  return _bookmarkIsEqual2 = _interopRequireDefault(require('./bookmarkIsEqual'));
}

var _Commands2;

function _Commands() {
  return _Commands2 = _interopRequireDefault(require('./Commands'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var _SideBarComponent2;

function _SideBarComponent() {
  return _SideBarComponent2 = _interopRequireDefault(require('./SideBarComponent'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

function createStateStream(actions, initialState) {
  var states = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.BehaviorSubject(initialState);
  actions.scan(accumulateState, initialState).subscribe(states);
  return states;
}

function getInitialState() {
  return {
    projectBookmarks: new Map(),
    projectDirectories: [],
    projectRepositories: new Map(),
    repositoryBookmarksIsLoading: new WeakMap()
  };
}

var commands = undefined;
var disposables = undefined;
var states = undefined;

function activate(rawState) {
  var initialState = getInitialState();
  var actions = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Subject();
  states = createStateStream((0, (_applyActionMiddleware2 || _applyActionMiddleware()).applyActionMiddleware)(actions, function () {
    return states.getValue();
  }), initialState);

  var dispatch = function dispatch(action) {
    actions.next(action);
  };
  commands = new (_Commands2 || _Commands()).default(dispatch, function () {
    return states.getValue();
  });

  var subscription = (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(atom.project.onDidChangePaths.bind(atom.project)).startWith(null) // Start with a fake event to fetch initial directories.
  .subscribe(function () {
    commands.fetchProjectDirectories();
  });

  disposables = new (_atom2 || _atom()).CompositeDisposable(new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(subscription));
}

function consumeNuclideSideBar(sideBar) {
  var serviceDisposable = undefined;

  sideBar.registerView({
    getComponent: function getComponent() {
      var props = states.map(function (state) {
        return {
          createBookmark: commands.createBookmark,
          deleteBookmark: commands.deleteBookmark,
          projectBookmarks: state.projectBookmarks,
          projectDirectories: state.projectDirectories,
          projectRepositories: state.projectRepositories,
          renameBookmark: commands.renameBookmark,
          repositoryBookmarksIsLoading: state.repositoryBookmarksIsLoading,
          updateToBookmark: commands.updateToBookmark
        };
      });

      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('scsidebar-show');
      return (0, (_nuclideUiLibBindObservableAsProps2 || _nuclideUiLibBindObservableAsProps()).bindObservableAsProps)(props, (_SideBarComponent2 || _SideBarComponent()).default);
    },
    onDidShow: function onDidShow() {},
    title: 'Source Control',
    toggleCommand: 'nuclide-source-control-side-bar:toggle',
    viewId: 'nuclide-source-control-side-bar'
  });

  serviceDisposable = new (_atom2 || _atom()).Disposable(function () {
    sideBar.destroyView('nuclide-source-control-side-bar');
  });
  disposables.add(serviceDisposable);

  return new (_atom2 || _atom()).Disposable(function () {
    if (serviceDisposable != null) {
      disposables.remove(serviceDisposable);
      serviceDisposable = null;
    }
  });
}

function accumulateSetBookmarkIsLoading(state, action) {
  var _action$payload = action.payload;
  var bookmark = _action$payload.bookmark;
  var repository = _action$payload.repository;

  var repositoryBookmarksIsLoading = undefined;
  if (state.repositoryBookmarksIsLoading.has(repository)) {
    repositoryBookmarksIsLoading = state.repositoryBookmarksIsLoading.get(repository);
  } else {
    repositoryBookmarksIsLoading = [];
  }

  var bookmarkIndex = repositoryBookmarksIsLoading.findIndex(function (loadingBookmark) {
    return (0, (_bookmarkIsEqual2 || _bookmarkIsEqual()).default)(loadingBookmark, bookmark);
  });
  if (bookmarkIndex === -1) {
    repositoryBookmarksIsLoading.push(bookmark);
  }

  return _extends({}, state, {
    repositoryBookmarksIsLoading: state.repositoryBookmarksIsLoading.set(repository, repositoryBookmarksIsLoading)
  });
}

function accumulateUnsetBookmarkIsLoading(state, action) {
  var _action$payload2 = action.payload;
  var bookmark = _action$payload2.bookmark;
  var repository = _action$payload2.repository;

  var repositoryBookmarksIsLoading = state.repositoryBookmarksIsLoading.get(repository);
  if (repositoryBookmarksIsLoading == null) {
    // TODO: Can this happen?
    return state;
  }

  var bookmarkIndex = repositoryBookmarksIsLoading.findIndex(function (loadingBookmark) {
    return (0, (_bookmarkIsEqual2 || _bookmarkIsEqual()).default)(loadingBookmark, bookmark);
  });
  if (bookmarkIndex >= 0) {
    repositoryBookmarksIsLoading.splice(bookmarkIndex, 1);
  }

  return state;
}

function accumulateState(state, action) {
  switch (action.type) {
    case (_ActionType2 || _ActionType()).SET_BOOKMARK_IS_LOADING:
      return accumulateSetBookmarkIsLoading(state, action);
    case (_ActionType2 || _ActionType()).UNSET_BOOKMARK_IS_LOADING:
      return accumulateUnsetBookmarkIsLoading(state, action);
    case (_ActionType2 || _ActionType()).SET_DIRECTORY_REPOSITORY:
      return _extends({}, state, {
        projectRepositories: state.projectRepositories.set(action.payload.directory.getPath(), action.payload.repository)
      });
    case (_ActionType2 || _ActionType()).SET_PROJECT_DIRECTORIES:
      // This event is the state of the world coming from Atom. If directories no longer exist,
      // their other stored states should be wiped out to prevent holding references to old data.
      // Copy only the repositories and bookmarks for directories in the next state.
      var nextProjectBookmarks = new Map();
      var nextProjectRepositories = new Map();
      action.payload.projectDirectories.forEach(function (directory) {
        var directoryPath = directory.getPath();
        var repository = state.projectRepositories.get(directoryPath);
        if (repository != null) {
          var repositoryPath = repository.getPath();
          nextProjectRepositories.set(directoryPath, repository);

          var _bookmarks = state.projectBookmarks.get(repositoryPath);
          if (_bookmarks != null) {
            nextProjectBookmarks.set(repositoryPath, _bookmarks);
          }
        }
      });

      return _extends({}, state, {
        projectBookmarks: nextProjectBookmarks,
        projectDirectories: action.payload.projectDirectories,
        projectRepositories: nextProjectRepositories
      });
    case (_ActionType2 || _ActionType()).SET_REPOSITORY_BOOKMARKS:
      var _action$payload3 = action.payload,
          bookmarks = _action$payload3.bookmarks,
          repository = _action$payload3.repository;

      var nextBookmarksIsLoading = undefined;
      var bookmarksIsLoading = state.repositoryBookmarksIsLoading.get(repository);
      if (bookmarksIsLoading == null) {
        nextBookmarksIsLoading = [];
      } else {
        // Transfer only the loading state of bookmarks that are in the next list of bookmarks.
        // Other loading states should be wiped out.
        nextBookmarksIsLoading = bookmarksIsLoading.filter(function (loadingBookmark) {
          return bookmarks.some(function (bookmark) {
            return (0, (_bookmarkIsEqual2 || _bookmarkIsEqual()).default)(bookmark, loadingBookmark);
          });
        });
      }

      return _extends({}, state, {
        projectBookmarks: state.projectBookmarks.set(repository.getPath(), bookmarks),
        repositoryBookmarksIsLoading: state.repositoryBookmarksIsLoading.set(repository, nextBookmarksIsLoading)
      });
  }

  throw new Error('Unrecognized action type: ' + action.type);
}

function deactivate() {
  disposables.dispose();
}