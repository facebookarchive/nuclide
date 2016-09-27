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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsAtomCreatePackage2;

function _commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage2 = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _url2;

function _url() {
  return _url2 = _interopRequireDefault(require('url'));
}

var _commonsAtomUiTreePath2;

function _commonsAtomUiTreePath() {
  return _commonsAtomUiTreePath2 = _interopRequireDefault(require('../../commons-atom/ui-tree-path'));
}

var _nuclideHgGitBridge2;

function _nuclideHgGitBridge() {
  return _nuclideHgGitBridge2 = require('../../nuclide-hg-git-bridge');
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _DiffViewElement2;

function _DiffViewElement() {
  return _DiffViewElement2 = _interopRequireDefault(require('./DiffViewElement'));
}

var _DiffViewComponent2;

function _DiffViewComponent() {
  return _DiffViewComponent2 = _interopRequireDefault(require('./DiffViewComponent'));
}

var _DiffViewModel2;

function _DiffViewModel() {
  return _DiffViewModel2 = _interopRequireDefault(require('./DiffViewModel'));
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _diffViewNux2;

function _diffViewNux() {
  return _diffViewNux2 = require('./diffViewNux');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _reduxCreateEmptyAppState2;

function _reduxCreateEmptyAppState() {
  return _reduxCreateEmptyAppState2 = require('./redux/createEmptyAppState');
}

var _reduxActions2;

function _reduxActions() {
  return _reduxActions2 = _interopRequireWildcard(require('./redux/Actions'));
}

var _reduxEpics2;

function _reduxEpics() {
  return _reduxEpics2 = _interopRequireWildcard(require('./redux/Epics'));
}

var _reduxReducers2;

function _reduxReducers() {
  return _reduxReducers2 = _interopRequireWildcard(require('./redux/Reducers'));
}

var _redux2;

function _redux() {
  return _redux2 = require('redux');
}

var _commonsNodeReduxObservable2;

function _commonsNodeReduxObservable() {
  return _commonsNodeReduxObservable2 = require('../../commons-node/redux-observable');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
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
  return (_url2 || _url()).default.format({
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
  var repository = (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).repositoryForPath)(filePath);
  return repository != null && repository.getType() === 'hg';
}

// Listen for file tree context menu file item events to open the diff view.
function addFileTreeCommands(commandName, diffOptions) {
  var subscriptions = new (_atom2 || _atom()).CompositeDisposable();
  subscriptions.add(atom.commands.add('.tree-view .entry.file.list-item', commandName, function (event) {
    var filePath = (0, (_commonsAtomUiTreePath2 || _commonsAtomUiTreePath()).default)(event);
    atom.workspace.open(formatDiffViewUrl(_extends({
      file: filePath || ''
    }, diffOptions)));
  }));

  subscriptions.add(atom.commands.add('.tree-view .entry.directory.list-nested-item > .list-item', commandName, function (event) {
    var directoryPath = (0, (_commonsAtomUiTreePath2 || _commonsAtomUiTreePath()).default)(event);
    atom.workspace.open(formatDiffViewUrl(_extends({
      directory: directoryPath || ''
    }, diffOptions)));
  }));
  return subscriptions;
}

function addActivePathCommands(commandName, diffOptions) {
  var subscriptions = new (_atom2 || _atom()).CompositeDisposable();

  function onTargetCommand(event) {
    event.preventDefault();
    event.stopPropagation();
    diffActivePath(diffOptions);
  }

  subscriptions.add(atom.commands.add('atom-workspace', commandName, onTargetCommand));
  // Listen for in-editor context menu item diff view open command.
  subscriptions.add(atom.commands.add('atom-text-editor', commandName, onTargetCommand));
  return subscriptions;
}

var Activation = (function () {
  function Activation(rawState) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._uiProviders = [];
    this._subscriptions = new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default();

    var initialState = (0, (_reduxCreateEmptyAppState2 || _reduxCreateEmptyAppState()).createEmptyAppState)();

    var epics = Object.keys(_reduxEpics2 || _reduxEpics()).map(function (k) {
      return (_reduxEpics2 || _reduxEpics())[k];
    }).filter(function (epic) {
      return typeof epic === 'function';
    });
    var rootEpic = function rootEpic(actions, store) {
      return (0, (_commonsNodeReduxObservable2 || _commonsNodeReduxObservable()).combineEpics).apply(undefined, _toConsumableArray(epics))(actions, store)
      // Log errors and continue.
      .catch(function (err, stream) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error(err);
        return stream;
      });
    };

    var rootReducer = (0, (_redux2 || _redux()).combineReducers)(_reduxReducers2 || _reduxReducers());
    this._store = (0, (_redux2 || _redux()).createStore)(rootReducer, initialState, (0, (_redux2 || _redux()).applyMiddleware)((0, (_commonsNodeReduxObservable2 || _commonsNodeReduxObservable()).createEpicMiddleware)(rootEpic)));
    var states = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(this._store);
    this._actionCreators = (0, (_redux2 || _redux()).bindActionCreators)(_reduxActions2 || _reduxActions(), this._store.dispatch);

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
      activeRepositoryState = activeRepositoryState || (0, (_reduxCreateEmptyAppState2 || _reduxCreateEmptyAppState()).getEmptyRepositoryState)();

      var headRevision = (0, (_utils2 || _utils()).getHeadRevision)(activeRepositoryState.headToForkBaseRevisions);
      var headCommitMessage = headRevision == null ? null : headRevision.description;

      _this._getDiffViewModel().injectState({
        activeRepository: state.activeRepository,
        fromRevisionTitle: fileDiff.fromRevisionTitle,
        toRevisionTitle: fileDiff.toRevisionTitle,
        filePath: fileDiff.filePath,
        oldContents: fileDiff.oldContents,
        newContents: fileDiff.newContents,
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
        showNonHgRepos: true,
        revisionsState: headRevision == null ? null : {
          compareCommitId: activeRepositoryState.compareRevisionId,
          revisionStatuses: activeRepositoryState.revisionStatuses,
          headCommitId: headRevision.id,
          headToForkBaseRevisions: activeRepositoryState.headToForkBaseRevisions,
          revisions: []
        }
      });
    }), (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).getHgRepositoryStream)().subscribe(function (repository) {
      _this._actionCreators.addRepository(repository);
    }),

    // Listen for menu item workspace diff view open command.
    addActivePathCommands('nuclide-diff-view:open'), addActivePathCommands('nuclide-diff-view:commit', {
      viewMode: (_constants2 || _constants()).DiffMode.COMMIT_MODE,
      commitMode: (_constants2 || _constants()).CommitMode.COMMIT
    }), addActivePathCommands('nuclide-diff-view:amend', {
      viewMode: (_constants2 || _constants()).DiffMode.COMMIT_MODE,
      commitMode: (_constants2 || _constants()).CommitMode.AMEND
    }), addActivePathCommands('nuclide-diff-view:publish', {
      viewMode: (_constants2 || _constants()).DiffMode.PUBLISH_MODE
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
      viewMode: (_constants2 || _constants()).DiffMode.COMMIT_MODE,
      commitMode: (_constants2 || _constants()).CommitMode.COMMIT
    }), addFileTreeCommands('nuclide-diff-view:amend-context', {
      viewMode: (_constants2 || _constants()).DiffMode.COMMIT_MODE,
      commitMode: (_constants2 || _constants()).CommitMode.AMEND
    }), addFileTreeCommands('nuclide-diff-view:publish-context', {
      viewMode: (_constants2 || _constants()).DiffMode.PUBLISH_MODE
    }),

    // The Diff View will open its main UI in a tab, like Atom's preferences and welcome pages.
    atom.workspace.addOpener(function (uri) {
      if (uri.startsWith(NUCLIDE_DIFF_VIEW_URI)) {
        if (!require('semver').gte(atom.getVersion(), '1.6.1')) {
          throw new Error('Outdated Atom version<br/>\n' + '**Nuclide\'s Diff View require Atom 1.6.1 or later**');
        }

        var _default$parse = (_url2 || _url()).default.parse(uri, true);

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

    var restorationSubscription = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge(
    // If it's a local directory, or if "nuclide-hg-repository" was activated
    // after "nuclide-diff-view":
    (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(serviceHub.consume.bind(serviceHub, 'atom.repository-provider', '^0.1.0')),

    // If it's a remote directory, it should come on a path change event:
    (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(atom.project.onDidChangePaths.bind(atom.project))).debounceTime(50) // Delay to avoid rushing CPU at startup time.
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
        diffViewModel = new (_DiffViewModel2 || _DiffViewModel()).default(this._actionCreators);
        diffViewModel.setUiProviders(this._uiProviders);
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
      var hostElement = this._diffViewElement = new (_DiffViewElement2 || _DiffViewElement()).default().initialize(diffModel, NUCLIDE_DIFF_VIEW_URI);
      this._diffViewComponent = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_DiffViewComponent2 || _DiffViewComponent()).default, {
        diffModel: diffModel,
        tryTriggerNux: this.tryTriggerNux.bind(this, (_diffViewNux2 || _diffViewNux()).NUX_DIFF_VIEW_ID)
      }), hostElement);
      this._activateDiffPath(diffEntityOptions);

      var destroySubscription = hostElement.onDidDestroy(function () {
        (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(hostElement);
        diffModel.deactivate();
        destroySubscription.dispose();
        _this2._subscriptions.remove(destroySubscription);
        _this2._diffViewElement = null;
        _this2._diffViewComponent = null;
      });

      this._subscriptions.add(new (_atom2 || _atom()).Disposable(function () {
        hostElement.destroy();
      }), destroySubscription);

      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-open');
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
      var button = toolBar.addButton({
        icon: 'git-branch',
        callback: 'nuclide-diff-view:open',
        tooltip: 'Open Diff View',
        priority: 300
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

      var toolBarSubscriptions = new (_atom2 || _atom()).CompositeDisposable(diffModel.onDidUpdateState(function () {
        updateToolbarCount();
      }), new (_atom2 || _atom()).Disposable(function () {
        toolBar.removeItems();
      }));
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
          description: (_reactForAtom2 || _reactForAtom()).React.createElement(
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
     * @return An array of InlineComments (defined above) to be rendered into the
     *         diff view
     */
  }, {
    key: 'consumeUIProvider',
    value: function consumeUIProvider(provider) {
      this._uiProviders.push(provider);
      if (this._diffViewModel != null) {
        this._diffViewModel.setUiProviders(this._uiProviders);
      }
      return;
    }
  }, {
    key: 'consumeCwdApi',
    value: function consumeCwdApi(api) {
      this._cwdApi = api;
      this._actionCreators.setCwdApi(api);
      var pkg = this;
      this._subscriptions.add(new (_atom2 || _atom()).Disposable(function () {
        pkg = null;
      }));
      return new (_atom2 || _atom()).Disposable(function () {
        if (pkg != null) {
          pkg._actionCreators.setCwdApi(null);
        }
      });
    }
  }, {
    key: 'addItemsToFileTreeContextMenu',
    value: function addItemsToFileTreeContextMenu(contextMenu) {
      var _this3 = this;

      var menuItemDescriptions = new (_atom2 || _atom()).CompositeDisposable();
      menuItemDescriptions.add(contextMenu.addItemToSourceControlMenu({
        label: 'Open in Diff View',
        command: 'nuclide-diff-view:open-context',
        shouldDisplay: function shouldDisplay() {
          return shouldDisplayDiffTreeItem(contextMenu);
        }
      }, DIFF_VIEW_FILE_TREE_CONTEXT_MENU_PRIORITY));
      menuItemDescriptions.add(contextMenu.addItemToSourceControlMenu({
        label: 'Commit',
        command: 'nuclide-diff-view:commit-context',
        shouldDisplay: function shouldDisplay() {
          return shouldDisplayDiffTreeItem(contextMenu);
        }
      }, COMMIT_FILE_TREE_CONTEXT_MENU_PRIORITY));
      menuItemDescriptions.add(contextMenu.addItemToSourceControlMenu({
        label: 'Amend',
        command: 'nuclide-diff-view:amend-context',
        shouldDisplay: function shouldDisplay() {
          return shouldDisplayDiffTreeItem(contextMenu);
        }
      }, AMEND_FILE_TREE_CONTEXT_MENU_PRIORITY));
      menuItemDescriptions.add(contextMenu.addItemToSourceControlMenu({
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
      return new (_atom2 || _atom()).Disposable(function () {
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
      var disposable = addNewNux((0, (_diffViewNux2 || _diffViewNux()).createDiffViewNux)());
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

exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;