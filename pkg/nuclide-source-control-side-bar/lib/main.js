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
exports.activate = activate;
exports.consumeNuclideSideBar = consumeNuclideSideBar;
exports.deactivate = deactivate;

var _ActionType;

function _load_ActionType() {
  return _ActionType = _interopRequireWildcard(require('./ActionType'));
}

var _applyActionMiddleware;

function _load_applyActionMiddleware() {
  return _applyActionMiddleware = require('./applyActionMiddleware');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _bookmarkIsEqual;

function _load_bookmarkIsEqual() {
  return _bookmarkIsEqual = _interopRequireDefault(require('./bookmarkIsEqual'));
}

var _Commands;

function _load_Commands() {
  return _Commands = _interopRequireDefault(require('./Commands'));
}

var _atom = require('atom');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _SideBarComponent;

function _load_SideBarComponent() {
  return _SideBarComponent = _interopRequireDefault(require('./SideBarComponent'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function createStateStream(actions, initialState) {
  const states = new _rxjsBundlesRxMinJs.BehaviorSubject(initialState);
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

let commands;
let disposables;
let states;

function activate(rawState) {
  const initialState = getInitialState();
  const actions = new _rxjsBundlesRxMinJs.Subject();
  states = createStateStream((0, (_applyActionMiddleware || _load_applyActionMiddleware()).applyActionMiddleware)(actions, () => states.getValue()), initialState);

  const dispatch = action => {
    actions.next(action);
  };
  commands = new (_Commands || _load_Commands()).default(dispatch, () => states.getValue());

  const subscription = (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.project.onDidChangePaths.bind(atom.project)).startWith(null) // Start with a fake event to fetch initial directories.
  .subscribe(() => {
    commands.fetchProjectDirectories();
  });

  disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(subscription);
}

function consumeNuclideSideBar(sideBar) {
  let serviceDisposable;

  sideBar.registerView({
    getComponent: function () {
      const props = states.map(state => ({
        createBookmark: commands.createBookmark,
        deleteBookmark: commands.deleteBookmark,
        projectBookmarks: state.projectBookmarks,
        projectDirectories: state.projectDirectories,
        projectRepositories: state.projectRepositories,
        renameBookmark: commands.renameBookmark,
        repositoryBookmarksIsLoading: state.repositoryBookmarksIsLoading,
        updateToBookmark: commands.updateToBookmark
      }));

      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('scsidebar-show');
      return (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props, (_SideBarComponent || _load_SideBarComponent()).default);
    },
    onDidShow: function () {},

    title: 'Source Control',
    toggleCommand: 'nuclide-source-control-side-bar:toggle',
    viewId: 'nuclide-source-control-side-bar'
  });

  serviceDisposable = new _atom.Disposable(() => {
    sideBar.destroyView('nuclide-source-control-side-bar');
  });
  disposables.add(serviceDisposable);

  return new _atom.Disposable(() => {
    if (serviceDisposable != null) {
      disposables.remove(serviceDisposable);
      serviceDisposable = null;
    }
  });
}

function accumulateSetBookmarkIsLoading(state, action) {
  var _action$payload = action.payload;
  const bookmark = _action$payload.bookmark,
        repository = _action$payload.repository;

  let repositoryBookmarksIsLoading;
  if (state.repositoryBookmarksIsLoading.has(repository)) {
    repositoryBookmarksIsLoading = state.repositoryBookmarksIsLoading.get(repository);
  } else {
    repositoryBookmarksIsLoading = [];
  }

  const bookmarkIndex = repositoryBookmarksIsLoading.findIndex(loadingBookmark => (0, (_bookmarkIsEqual || _load_bookmarkIsEqual()).default)(loadingBookmark, bookmark));
  if (bookmarkIndex === -1) {
    repositoryBookmarksIsLoading.push(bookmark);
  }

  return Object.assign({}, state, {
    repositoryBookmarksIsLoading: state.repositoryBookmarksIsLoading.set(repository, repositoryBookmarksIsLoading)
  });
}

function accumulateUnsetBookmarkIsLoading(state, action) {
  var _action$payload2 = action.payload;
  const bookmark = _action$payload2.bookmark,
        repository = _action$payload2.repository;

  const repositoryBookmarksIsLoading = state.repositoryBookmarksIsLoading.get(repository);
  if (repositoryBookmarksIsLoading == null) {
    // TODO: Can this happen?
    return state;
  }

  const bookmarkIndex = repositoryBookmarksIsLoading.findIndex(loadingBookmark => (0, (_bookmarkIsEqual || _load_bookmarkIsEqual()).default)(loadingBookmark, bookmark));
  if (bookmarkIndex >= 0) {
    repositoryBookmarksIsLoading.splice(bookmarkIndex, 1);
  }

  return state;
}

function accumulateState(state, action) {
  switch (action.type) {
    case (_ActionType || _load_ActionType()).SET_BOOKMARK_IS_LOADING:
      return accumulateSetBookmarkIsLoading(state, action);
    case (_ActionType || _load_ActionType()).UNSET_BOOKMARK_IS_LOADING:
      return accumulateUnsetBookmarkIsLoading(state, action);
    case (_ActionType || _load_ActionType()).SET_DIRECTORY_REPOSITORY:
      return Object.assign({}, state, {
        projectRepositories: state.projectRepositories.set(action.payload.directory.getPath(), action.payload.repository)
      });
    case (_ActionType || _load_ActionType()).SET_PROJECT_DIRECTORIES:
      // This event is the state of the world coming from Atom. If directories no longer exist,
      // their other stored states should be wiped out to prevent holding references to old data.
      // Copy only the repositories and bookmarks for directories in the next state.
      const nextProjectBookmarks = new Map();
      const nextProjectRepositories = new Map();
      action.payload.projectDirectories.forEach(directory => {
        const directoryPath = directory.getPath();
        const repository = state.projectRepositories.get(directoryPath);
        if (repository != null) {
          const repositoryPath = repository.getPath();
          nextProjectRepositories.set(directoryPath, repository);

          const bookmarks = state.projectBookmarks.get(repositoryPath);
          if (bookmarks != null) {
            nextProjectBookmarks.set(repositoryPath, bookmarks);
          }
        }
      });

      return Object.assign({}, state, {
        projectBookmarks: nextProjectBookmarks,
        projectDirectories: action.payload.projectDirectories,
        projectRepositories: nextProjectRepositories
      });
    case (_ActionType || _load_ActionType()).SET_REPOSITORY_BOOKMARKS:
      var _action$payload3 = action.payload;
      const bookmarks = _action$payload3.bookmarks,
            repository = _action$payload3.repository;


      let nextBookmarksIsLoading;
      const bookmarksIsLoading = state.repositoryBookmarksIsLoading.get(repository);
      if (bookmarksIsLoading == null) {
        nextBookmarksIsLoading = [];
      } else {
        // Transfer only the loading state of bookmarks that are in the next list of bookmarks.
        // Other loading states should be wiped out.
        nextBookmarksIsLoading = bookmarksIsLoading.filter(loadingBookmark => {
          return bookmarks.some(bookmark => (0, (_bookmarkIsEqual || _load_bookmarkIsEqual()).default)(bookmark, loadingBookmark));
        });
      }

      return Object.assign({}, state, {
        projectBookmarks: state.projectBookmarks.set(repository.getPath(), bookmarks),
        repositoryBookmarksIsLoading: state.repositoryBookmarksIsLoading.set(repository, nextBookmarksIsLoading)
      });
  }

  throw new Error(`Unrecognized action type: ${ action.type }`);
}

function deactivate() {
  disposables.dispose();
}