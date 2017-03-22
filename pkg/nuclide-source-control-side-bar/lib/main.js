'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deserializeSourceControlSideBar = deserializeSourceControlSideBar;
exports.consumeWorkspaceViewsService = consumeWorkspaceViewsService;
exports.deactivate = deactivate;
exports.serialize = serialize;

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

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('../../commons-atom/renderReactRoot');
}

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

var _vcs;

function _load_vcs() {
  return _vcs = require('../../commons-atom/vcs');
}

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function createStateStream(actions, initialState) {
  const states = new _rxjsBundlesRxMinJs.BehaviorSubject(initialState);
  actions.scan(accumulateState, initialState).subscribe(states);
  return states;
}

function getInitialState() {
  return {
    uncommittedChanges: new Map(),
    projectBookmarks: new Map(),
    projectDirectories: [],
    projectRepositories: new Map(),
    repositoryBookmarksIsLoading: new WeakMap()
  };
}

let commands;
let disposables;
let states;
let activated = false;
let restored;

const WORKSPACE_VIEW_URI = 'atom://nuclide/source-control';

function activate(rawState) {
  activated = true;
  restored = rawState != null && rawState.restored === true;
  const initialState = getInitialState();
  const actions = new _rxjsBundlesRxMinJs.Subject();
  states = createStateStream((0, (_applyActionMiddleware || _load_applyActionMiddleware()).applyActionMiddleware)(actions, () => states.getValue()), initialState);

  const dispatch = action => {
    actions.next(action);
  };
  commands = new (_Commands || _load_Commands()).default(dispatch, () => states.getValue());

  disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    activated = false;
  }, (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.project.onDidChangePaths.bind(atom.project)).startWith(null) // Start with a fake event to fetch initial directories.
  .subscribe(() => {
    commands.fetchProjectDirectories();
  }));
}

class SourceControlSideBar {
  constructor() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('scsidebar-show');
  }

  getElement() {
    const props = states.map(state => ({
      createBookmark: commands.createBookmark,
      deleteBookmark: commands.deleteBookmark,
      projectBookmarks: state.projectBookmarks,
      projectDirectories: state.projectDirectories,
      projectRepositories: state.projectRepositories,
      renameBookmark: commands.renameBookmark,
      repositoryBookmarksIsLoading: state.repositoryBookmarksIsLoading,
      updateToBookmark: commands.updateToBookmark,
      uncommittedChanges: state.uncommittedChanges
    }));
    const BoundSideBarComponent = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props, (_SideBarComponent || _load_SideBarComponent()).default);
    return (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.default.createElement(BoundSideBarComponent, null));
  }

  getDefaultLocation() {
    return 'left-panel';
  }

  getTitle() {
    return 'Source Control';
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  serialize() {
    return {
      deserializer: 'nuclide.SourceControlSideBar'
    };
  }
}

function deserializeSourceControlSideBar(state) {
  // It's possible for this method to be called before the package has been activated (if this was
  // serialized as part of the workspace instead of nuclide-workspace-views).
  // TODO: Once atom/atom#13358 makes it into stable, we can switch from using 'activate()' to
  // `initialize()` and avoid that.
  if (!activated) {
    return;
  }
  return new SourceControlSideBar();
}

function consumeWorkspaceViewsService(api) {
  disposables.add(api.addOpener(uri => {
    if (uri === WORKSPACE_VIEW_URI) {
      return new SourceControlSideBar();
    }
  }), () => api.destroyWhere(item => item instanceof SourceControlSideBar), atom.commands.add('atom-workspace', 'nuclide-source-control-side-bar:toggle', event => {
    api.toggle(WORKSPACE_VIEW_URI, event.detail);
  }));
  // If this is the first time we're opening this workspace, open the source control side bar.
  if (!restored) {
    api.open(WORKSPACE_VIEW_URI, { searchAllPanes: true, activatePane: false, activateItem: false });
  }
}

function accumulateSetBookmarkIsLoading(state, action) {
  const {
    bookmark,
    repository
  } = action.payload;
  let repositoryBookmarksIsLoading;
  if (state.repositoryBookmarksIsLoading.has(repository)) {
    repositoryBookmarksIsLoading = state.repositoryBookmarksIsLoading.get(repository);

    if (!(repositoryBookmarksIsLoading != null)) {
      throw new Error('Invariant violation: "repositoryBookmarksIsLoading != null"');
    }
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

function accumulateRepositoriesUncommittedChanges(state, action) {
  const {
    directory,
    repository
  } = action.payload;

  if (repository.getType() === 'hg') {
    const uncommittedChanges = (0, (_vcs || _load_vcs()).getDirtyFileChanges)(repository);
    const filteredUncommitedChangesMap = new Map();
    // The get dirty file changes gets changes for the whole repository and
    // for most part only a directory in the repository is imported. This filter
    // will show only the related files under each directory.
    for (const [filePath, fileStatus] of uncommittedChanges.entries()) {
      if (filePath.startsWith(directory.getPath())) {
        filteredUncommitedChangesMap.set(filePath, fileStatus);
      }
    }
    return Object.assign({}, state, {
      uncommittedChanges: new Map(state.uncommittedChanges).set(directory.getPath(), filteredUncommitedChangesMap)
    });
  }

  return state;
}

function accumulateUnsetBookmarkIsLoading(state, action) {
  const {
    bookmark,
    repository
  } = action.payload;
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
    case (_ActionType || _load_ActionType()).UPDATE_UNCOMMITTED_CHANGES:
      return accumulateRepositoriesUncommittedChanges(state, action);
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
      const {
        bookmarks,
        repository
      } = action.payload;

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

  throw new Error(`Unrecognized action type: ${action.type}`);
}

function deactivate() {
  disposables.dispose();
}

function serialize() {
  return {
    restored: true
  };
}