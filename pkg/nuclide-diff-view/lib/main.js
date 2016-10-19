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

// Redux store

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _commonsAtomCreatePackage;

function _load_commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _url;

function _load_url() {
  return _url = _interopRequireDefault(require('url'));
}

var _commonsAtomUiTreePath;

function _load_commonsAtomUiTreePath() {
  return _commonsAtomUiTreePath = _interopRequireDefault(require('../../commons-atom/ui-tree-path'));
}

var _nuclideHgGitBridge;

function _load_nuclideHgGitBridge() {
  return _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _DiffViewElement;

function _load_DiffViewElement() {
  return _DiffViewElement = _interopRequireDefault(require('./DiffViewElement'));
}

var _DiffViewComponent;

function _load_DiffViewComponent() {
  return _DiffViewComponent = _interopRequireDefault(require('./DiffViewComponent'));
}

var _DiffViewModel;

function _load_DiffViewModel() {
  return _DiffViewModel = _interopRequireDefault(require('./DiffViewModel'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _diffViewNux;

function _load_diffViewNux() {
  return _diffViewNux = require('./diffViewNux');
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
}

var _reduxCreateEmptyAppState;

function _load_reduxCreateEmptyAppState() {
  return _reduxCreateEmptyAppState = require('./redux/createEmptyAppState');
}

var _reduxActions;

function _load_reduxActions() {
  return _reduxActions = _interopRequireWildcard(require('./redux/Actions'));
}

var _reduxEpics;

function _load_reduxEpics() {
  return _reduxEpics = _interopRequireWildcard(require('./redux/Epics'));
}

var _reduxReducers;

function _load_reduxReducers() {
  return _reduxReducers = _interopRequireWildcard(require('./redux/Reducers'));
}

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _commonsNodeReduxObservable;

function _load_commonsNodeReduxObservable() {
  return _commonsNodeReduxObservable = require('../../commons-node/redux-observable');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

// This url style is the one Atom uses for the welcome and settings pages.
var NUCLIDE_DIFF_VIEW_URI = 'atom://nuclide/diff-view';
var DIFF_VIEW_FILE_TREE_CONTEXT_MENU_PRIORITY = 1000;
var COMMIT_FILE_TREE_CONTEXT_MENU_PRIORITY = 1100;
var AMEND_FILE_TREE_CONTEXT_MENU_PRIORITY = 1200;
var PUBLISH_FILE_TREE_CONTEXT_MENU_PRIORITY = 1300;

function formatDiffViewUrl(diffEntityOptions_) {
  var diffEntityOptions = diffEntityOptions_;
  if (diffEntityOptions == null) {
    diffEntityOptions = { file: '' };
  }
  return (_url || _load_url()).default.format({
    protocol: 'atom',
    host: 'nuclide',
    pathname: 'diff-view',
    slashes: true,
    query: diffEntityOptions
  });
}

function diffActivePath(diffOptions) {
  var editor = atom.workspace.getActiveTextEditor();
  if (editor == null) {
    atom.workspace.open(formatDiffViewUrl(diffOptions));
  } else {
    atom.workspace.open(formatDiffViewUrl(_extends({
      file: editor.getPath() || ''
    }, diffOptions)));
  }
}

function isActiveEditorDiffable() {
  var editor = atom.workspace.getActiveTextEditor();
  if (editor == null) {
    return false;
  }
  return isPathDiffable(editor.getPath());
}

function shouldDisplayDiffTreeItem(contextMenu) {
  var node = contextMenu.getSingleSelectedNode();
  return node != null && isPathDiffable(node.uri);
}

function isPathDiffable(filePath) {
  if (filePath == null || filePath.length === 0) {
    return false;
  }
  var repository = (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(filePath);
  return repository != null && repository.getType() === 'hg';
}

// Listen for file tree context menu file item events to open the diff view.
function addFileTreeCommands(commandName, diffOptions) {
  return new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(atom.commands.add('.tree-view .entry.file.list-item', commandName, function (event) {
    var filePath = (0, (_commonsAtomUiTreePath || _load_commonsAtomUiTreePath()).default)(event);
    atom.workspace.open(formatDiffViewUrl(_extends({
      file: filePath || ''
    }, diffOptions)));
  }), atom.commands.add('.tree-view .entry.directory.list-nested-item > .list-item', commandName, function (event) {
    var directoryPath = (0, (_commonsAtomUiTreePath || _load_commonsAtomUiTreePath()).default)(event);
    atom.workspace.open(formatDiffViewUrl(_extends({
      directory: directoryPath || ''
    }, diffOptions)));
  }));
}

function addActivePathCommands(commandName, diffOptions) {
  function onTargetCommand(event) {
    event.preventDefault();
    event.stopPropagation();
    diffActivePath(diffOptions);
  }

  return new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(atom.commands.add('atom-workspace', commandName, onTargetCommand),
  // Listen for in-editor context menu item diff view open command.
  atom.commands.add('atom-text-editor', commandName, onTargetCommand));
}

var Activation = (function () {
  function Activation(rawState) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._subscriptions = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default();

    var initialState = (0, (_reduxCreateEmptyAppState || _load_reduxCreateEmptyAppState()).createEmptyAppState)();

    var epics = Object.keys(_reduxEpics || _load_reduxEpics()).map(function (k) {
      return (_reduxEpics || _load_reduxEpics())[k];
    }).filter(function (epic) {
      return typeof epic === 'function';
    });
    var rootEpic = function rootEpic(actions, store) {
      return (0, (_commonsNodeReduxObservable || _load_commonsNodeReduxObservable()).combineEpics).apply(undefined, _toConsumableArray(epics))(actions, store)
      // Log errors and continue.
      .catch(function (error, stream) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Diff View Epics Error:', error);
        return stream;
      });
    };

    var rootReducer = (0, (_redux || _load_redux()).combineReducers)(_reduxReducers || _load_reduxReducers());
    this._store = (0, (_redux || _load_redux()).createStore)(rootReducer, initialState, (0, (_redux || _load_redux()).applyMiddleware)((0, (_commonsNodeReduxObservable || _load_commonsNodeReduxObservable()).createEpicMiddleware)(rootEpic)));
    var states = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.from(this._store);
    this._actionCreators = (0, (_redux || _load_redux()).bindActionCreators)(_reduxActions || _load_reduxActions(), this._store.dispatch);

    this._subscriptions.add(
    // TODO(most): Remove Diff View model and use stream of props for the views instead.
    states.subscribe(function (_state) {
      var state = _state;
      var commit = state.commit;
      var fileDiff = state.fileDiff;
      var publish = state.publish;

      var activeRepositoryState = undefined;
      if (state.activeRepository != null) {
        activeRepositoryState = state.repositories.get(state.activeRepository);
      }
      activeRepositoryState = activeRepositoryState || (0, (_reduxCreateEmptyAppState || _load_reduxCreateEmptyAppState()).getEmptyRepositoryState)();

      var headRevision = (0, (_utils || _load_utils()).getHeadRevision)(activeRepositoryState.headToForkBaseRevisions);
      var headCommitMessage = headRevision == null ? null : headRevision.description;

      _this._getDiffViewModel().injectState({
        activeRepository: state.activeRepository,
        fromRevisionTitle: fileDiff.fromRevisionTitle,
        toRevisionTitle: fileDiff.toRevisionTitle,
        filePath: fileDiff.filePath,
        oldContents: fileDiff.oldContents,
        newContents: fileDiff.newContents,
        inlineComponents: fileDiff.uiElements || [],
        compareRevisionInfo: null,
        viewMode: state.viewMode,
        commitMessage: commit.message,
        commitMode: commit.mode,
        commitModeState: commit.state,
        shouldRebaseOnAmend: state.shouldRebaseOnAmend,
        publishMessage: publish.message,
        publishMode: publish.mode,
        publishModeState: publish.state,
        headCommitMessage: headCommitMessage,
        dirtyFileChanges: activeRepositoryState.dirtyFiles,
        selectedFileChanges: activeRepositoryState.selectedFiles,
        isLoadingFileDiff: state.isLoadingFileDiff,
        isLoadingSelectedFiles: activeRepositoryState.isLoadingSelectedFiles,
        showNonHgRepos: true,
        revisionsState: headRevision == null ? null : {
          compareCommitId: activeRepositoryState.compareRevisionId,
          revisionStatuses: activeRepositoryState.revisionStatuses,
          headCommitId: headRevision.id,
          headToForkBaseRevisions: activeRepositoryState.headToForkBaseRevisions,
          revisions: []
        }
      });
    }), (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).getHgRepositoryStream)().subscribe(function (repository) {
      _this._actionCreators.addRepository(repository);
    }),

    // Listen for menu item workspace diff view open command.
    addActivePathCommands('nuclide-diff-view:open'), addActivePathCommands('nuclide-diff-view:commit', {
      viewMode: (_constants || _load_constants()).DiffMode.COMMIT_MODE,
      commitMode: (_constants || _load_constants()).CommitMode.COMMIT
    }), addActivePathCommands('nuclide-diff-view:amend', {
      viewMode: (_constants || _load_constants()).DiffMode.COMMIT_MODE,
      commitMode: (_constants || _load_constants()).CommitMode.AMEND
    }), addActivePathCommands('nuclide-diff-view:publish', {
      viewMode: (_constants || _load_constants()).DiffMode.PUBLISH_MODE
    }),

    // Context Menu Items.
    atom.contextMenu.add({
      'atom-text-editor': [{ type: 'separator' }, {
        label: 'Source Control',
        submenu: [{
          label: 'Open in Diff View',
          command: 'nuclide-diff-view:open'
        }, {
          label: 'Commit',
          command: 'nuclide-diff-view:commit'
        }, {
          label: 'Amend',
          command: 'nuclide-diff-view:amend'
        }, {
          label: 'Publish to Phabricator',
          command: 'nuclide-diff-view:publish'
        }],
        shouldDisplay: function shouldDisplay() {
          return isActiveEditorDiffable();
        }
      }, { type: 'separator' }]
    }),

    // Listen for switching to editor mode for the active file.
    atom.commands.add('nuclide-diff-view', 'nuclide-diff-view:switch-to-editor', function () {
      var _getDiffViewModel$getState = _this._getDiffViewModel().getState();

      var filePath = _getDiffViewModel$getState.filePath;

      if (filePath != null && filePath.length) {
        atom.workspace.open(filePath);
      }
    }), addFileTreeCommands('nuclide-diff-view:open-context'), addFileTreeCommands('nuclide-diff-view:commit-context', {
      viewMode: (_constants || _load_constants()).DiffMode.COMMIT_MODE,
      commitMode: (_constants || _load_constants()).CommitMode.COMMIT
    }), addFileTreeCommands('nuclide-diff-view:amend-context', {
      viewMode: (_constants || _load_constants()).DiffMode.COMMIT_MODE,
      commitMode: (_constants || _load_constants()).CommitMode.AMEND
    }), addFileTreeCommands('nuclide-diff-view:publish-context', {
      viewMode: (_constants || _load_constants()).DiffMode.PUBLISH_MODE
    }),

    // The Diff View will open its main UI in a tab, like Atom's preferences and welcome pages.
    atom.workspace.addOpener(function (uri) {
      if (uri.startsWith(NUCLIDE_DIFF_VIEW_URI)) {
        var _default$parse = (_url || _load_url()).default.parse(uri, true);

        var diffEntityOptions = _default$parse.query;

        return _this._getDiffViewElement(diffEntityOptions);
      }
    }));

    if (rawState == null || !rawState.visible) {
      return;
    }

    var activeFilePath = rawState.activeFilePath;
    var viewMode = rawState.viewMode;
    var commitMode = rawState.commitMode;

    // Wait for the source control providers to be ready:
    var serviceHub = atom.packages.serviceHub;

    var restorationSubscription = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge(
    // If it's a local directory, or if "nuclide-hg-repository" was activated
    // after "nuclide-diff-view":
    (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(serviceHub.consume.bind(serviceHub, 'atom.repository-provider', '^0.1.0')),

    // If it's a remote directory, it should come on a path change event:
    (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(atom.project.onDidChangePaths.bind(atom.project))).debounceTime(50) // Delay to avoid rushing CPU at startup time.
    .subscribe(function () {
      return tryRestoreActiveDiffView();
    });

    this._subscriptions.add(restorationSubscription);

    var tryRestoreActiveDiffView = function tryRestoreActiveDiffView() {
      // If there is no repository ready, it may be because it's a remote file,
      // or because "nuclide-hg-repository" hasn't loaded yet.
      var canRestoreActiveDiffView = activeFilePath ? isPathDiffable(activeFilePath) : atom.project.getDirectories().some(function (directory) {
        return isPathDiffable(directory.getPath());
      });
      if (canRestoreActiveDiffView) {
        restorationSubscription.unsubscribe();
        _this._subscriptions.remove(restorationSubscription);
        atom.workspace.open(formatDiffViewUrl({
          file: activeFilePath,
          viewMode: viewMode,
          commitMode: commitMode
        }));
      }
    };
  }

  _createClass(Activation, [{
    key: '_getDiffViewModel',
    value: function _getDiffViewModel() {
      var diffViewModel = this._diffViewModel;
      if (diffViewModel == null) {
        diffViewModel = new (_DiffViewModel || _load_DiffViewModel()).default(this._actionCreators);
        this._subscriptions.add(diffViewModel);
        this._diffViewModel = diffViewModel;
      }
      return diffViewModel;
    }

    // To add a View as an Atom workspace pane, we return `DiffViewElement` extending `HTMLElement`.
    // This pattern is also followed with atom's TextEditor.
  }, {
    key: '_getDiffViewElement',
    value: function _getDiffViewElement(diffEntityOptions) {
      var _this2 = this;

      if (this._diffViewElement != null) {
        var diffViewElement = this._diffViewElement;
        this._activateDiffPath(diffEntityOptions);
        return diffViewElement;
      }

      var diffModel = this._getDiffViewModel();
      diffModel.activate();
      var hostElement = this._diffViewElement = new (_DiffViewElement || _load_DiffViewElement()).default().initialize(diffModel, NUCLIDE_DIFF_VIEW_URI);
      this._diffViewComponent = (_reactForAtom || _load_reactForAtom()).ReactDOM.render((_reactForAtom || _load_reactForAtom()).React.createElement((_DiffViewComponent || _load_DiffViewComponent()).default, {
        diffModel: diffModel,
        tryTriggerNux: this.tryTriggerNux.bind(this, (_diffViewNux || _load_diffViewNux()).NUX_DIFF_VIEW_ID)
      }), hostElement);
      this._activateDiffPath(diffEntityOptions);

      var destroySubscription = hostElement.onDidDestroy(function () {
        (_reactForAtom || _load_reactForAtom()).ReactDOM.unmountComponentAtNode(hostElement);
        diffModel.deactivate();
        destroySubscription.dispose();
        _this2._subscriptions.remove(destroySubscription);
        _this2._diffViewElement = null;
        _this2._diffViewComponent = null;
      });

      this._subscriptions.add(new (_atom || _load_atom()).Disposable(function () {
        hostElement.destroy();
      }), destroySubscription);

      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-open');
      return hostElement;
    }
  }, {
    key: '_activateDiffPath',
    value: function _activateDiffPath(diffEntityOptions) {
      if (this._diffViewModel == null) {
        return;
      }
      if (diffEntityOptions.file) {
        this._diffViewModel.diffFile(diffEntityOptions.file);
      }

      var _store$getState = this._store.getState();

      var viewMode = _store$getState.viewMode;
      var commitMode = _store$getState.commit.mode;

      if (diffEntityOptions.viewMode != null && diffEntityOptions.viewMode !== viewMode) {
        this._actionCreators.setViewMode(diffEntityOptions.viewMode);
      }
      if (diffEntityOptions.commitMode != null && diffEntityOptions.commitMode !== commitMode) {
        this._actionCreators.setCommitMode(diffEntityOptions.commitMode);
      }
    }
  }, {
    key: 'consumeToolBar',
    value: function consumeToolBar(getToolBar) {
      var toolBar = getToolBar('nuclide-diff-view');
      toolBar.addSpacer({
        priority: 800
      });
      var button = toolBar.addButton({
        icon: 'git-branch',
        callback: 'nuclide-diff-view:open',
        tooltip: 'Open Diff View',
        priority: 801
      }).element;
      button.classList.add('diff-view-count');

      var diffModel = this._getDiffViewModel();
      var lastCount = null;
      var updateToolbarCount = function updateToolbarCount() {
        var count = diffModel.getState().dirtyFileChanges.size;
        if (count !== lastCount) {
          button.classList.toggle('positive-count', count > 0);
          button.classList.toggle('max-count', count > 99);
          button.dataset.count = count === 0 ? '' : count > 99 ? '99+' : String(count);
          lastCount = count;
        }
      };
      updateToolbarCount();

      var toolBarSubscriptions = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(diffModel.onDidUpdateState(function () {
        updateToolbarCount();
      }), function () {
        toolBar.removeItems();
      });
      this._subscriptions.add(toolBarSubscriptions);
      return toolBarSubscriptions;
    }
  }, {
    key: 'getHomeFragments',
    value: function getHomeFragments() {
      return {
        feature: {
          title: 'Diff View',
          icon: 'git-branch',
          description: (_reactForAtom || _load_reactForAtom()).React.createElement(
            'span',
            null,
            'Launches an editable side-by-side compare view across mercurial dirty and commits changes, allowing committing and pushing changes to phabricator.'
          ),
          command: 'nuclide-diff-view:open'
        },
        priority: 3
      };
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      if (this._diffViewElement == null || this._diffViewModel == null) {
        return {
          visible: false
        };
      }

      var _diffViewModel$getState = this._diffViewModel.getState();

      var commitMode = _diffViewModel$getState.commitMode;
      var filePath = _diffViewModel$getState.filePath;
      var viewMode = _diffViewModel$getState.viewMode;

      return {
        visible: true,
        activeFilePath: filePath,
        viewMode: viewMode,
        commitMode: commitMode
      };
    }

    /**
     * The diff-view package can consume providers that return React components to
     * be rendered inline.
     * A uiProvider must have a method composeUiElements with the following spec:
     * @param filePath The path of the file the diff view is opened for
     * @param oldContents the contents of the compare-to text editor.
     * @param newContents the current filesystem status / edited contents.
     * @return An Observable of array of inline elements (defined above) to be rendered
     *         into the diff view
     */
  }, {
    key: 'consumeUIProvider',
    value: function consumeUIProvider(provider) {
      this._actionCreators.addUiProvider(provider);
      var pkg = this;
      this._subscriptions.add(new (_atom || _load_atom()).Disposable(function () {
        pkg = null;
      }));
      return new (_atom || _load_atom()).Disposable(function () {
        if (pkg != null) {
          pkg._actionCreators.removeUiProvider(provider);
        }
      });
    }
  }, {
    key: 'consumeCwdApi',
    value: function consumeCwdApi(api) {
      this._actionCreators.setCwdApi(api);
      var pkg = this;
      this._subscriptions.add(function () {
        pkg = null;
      });
      return new (_atom || _load_atom()).Disposable(function () {
        if (pkg != null) {
          pkg._actionCreators.setCwdApi(null);
        }
      });
    }
  }, {
    key: 'addItemsToFileTreeContextMenu',
    value: function addItemsToFileTreeContextMenu(contextMenu) {
      var _this3 = this;

      var menuItemDescriptions = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(contextMenu.addItemToSourceControlMenu({
        label: 'Open in Diff View',
        command: 'nuclide-diff-view:open-context',
        shouldDisplay: function shouldDisplay() {
          return shouldDisplayDiffTreeItem(contextMenu);
        }
      }, DIFF_VIEW_FILE_TREE_CONTEXT_MENU_PRIORITY), contextMenu.addItemToSourceControlMenu({
        label: 'Commit',
        command: 'nuclide-diff-view:commit-context',
        shouldDisplay: function shouldDisplay() {
          return shouldDisplayDiffTreeItem(contextMenu);
        }
      }, COMMIT_FILE_TREE_CONTEXT_MENU_PRIORITY), contextMenu.addItemToSourceControlMenu({
        label: 'Amend',
        command: 'nuclide-diff-view:amend-context',
        shouldDisplay: function shouldDisplay() {
          return shouldDisplayDiffTreeItem(contextMenu);
        }
      }, AMEND_FILE_TREE_CONTEXT_MENU_PRIORITY), contextMenu.addItemToSourceControlMenu({
        label: 'Publish to Phabricator',
        command: 'nuclide-diff-view:publish-context',
        shouldDisplay: function shouldDisplay() {
          return shouldDisplayDiffTreeItem(contextMenu);
        }
      }, PUBLISH_FILE_TREE_CONTEXT_MENU_PRIORITY));

      this._subscriptions.add(menuItemDescriptions);

      // We don't need to dispose of the menuItemDescriptions when the provider is disabled -
      // it needs to be handled by the provider itself. We only should remove it from the list
      // of the disposables we maintain.
      return new (_atom || _load_atom()).Disposable(function () {
        _this3._subscriptions.remove(menuItemDescriptions);
      });
    }
  }, {
    key: '__getDiffViewComponent',
    value: function __getDiffViewComponent() {
      return this._diffViewComponent;
    }
  }, {
    key: 'tryTriggerNux',
    value: function tryTriggerNux(nuxID) {
      if (this._tryTriggerNuxService != null) {
        this._tryTriggerNuxService(nuxID);
      }
    }
  }, {
    key: 'consumeRegisterNuxService',
    value: function consumeRegisterNuxService(addNewNux) {
      var disposable = addNewNux((0, (_diffViewNux || _load_diffViewNux()).createDiffViewNux)());
      this._subscriptions.add(disposable);
      return disposable;
    }
  }, {
    key: 'consumeTriggerNuxService',
    value: function consumeTriggerNuxService(triggerNuxService) {
      this._tryTriggerNuxService = triggerNuxService;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return Activation;
})();

exports.default = (0, (_commonsAtomCreatePackage || _load_commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;