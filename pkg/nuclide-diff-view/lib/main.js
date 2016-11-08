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

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _reactForAtom = require('react-for-atom');

var _url = _interopRequireDefault(require('url'));

var _uiTreePath;

function _load_uiTreePath() {
  return _uiTreePath = _interopRequireDefault(require('../../commons-atom/ui-tree-path'));
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

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _diffViewNux;

function _load_diffViewNux() {
  return _diffViewNux = require('./diffViewNux');
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _SplitDiffView;

function _load_SplitDiffView() {
  return _SplitDiffView = _interopRequireDefault(require('./new-ui/SplitDiffView'));
}

var _DiffViewNavigatorGadget;

function _load_DiffViewNavigatorGadget() {
  return _DiffViewNavigatorGadget = _interopRequireDefault(require('./new-ui/DiffViewNavigatorGadget'));
}

var _DiffViewNavigatorComponent;

function _load_DiffViewNavigatorComponent() {
  return _DiffViewNavigatorComponent = _interopRequireDefault(require('./new-ui/DiffViewNavigatorComponent'));
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _createEmptyAppState;

function _load_createEmptyAppState() {
  return _createEmptyAppState = require('./redux/createEmptyAppState');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./redux/Actions'));
}

var _Epics;

function _load_Epics() {
  return _Epics = _interopRequireWildcard(require('./redux/Epics'));
}

var _Reducers;

function _load_Reducers() {
  return _Reducers = require('./redux/Reducers');
}

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('../../commons-node/redux-observable');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This url style is the one Atom uses for the welcome and settings pages.
const NUCLIDE_DIFF_VIEW_URI = 'atom://nuclide/diff-view';

// Redux store

const DIFF_VIEW_FILE_TREE_CONTEXT_MENU_PRIORITY = 1000;
const COMMIT_FILE_TREE_CONTEXT_MENU_PRIORITY = 1100;
const AMEND_FILE_TREE_CONTEXT_MENU_PRIORITY = 1200;
const PUBLISH_FILE_TREE_CONTEXT_MENU_PRIORITY = 1300;

function dispatchDiffNavigatorToggle(visible) {
  atom.commands.dispatch(atom.views.getView(atom.workspace), (_constants || _load_constants()).DIFF_VIEW_NAVIGATOR_TOGGLE_COMMAND, { visible: visible });
}

function diffActivePath(diffOptions) {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor == null) {
    atom.workspace.open((0, (_utils || _load_utils()).formatDiffViewUrl)(diffOptions));
  } else {
    atom.workspace.open((0, (_utils || _load_utils()).formatDiffViewUrl)(Object.assign({
      file: editor.getPath() || ''
    }, diffOptions)));
  }
}

function isActiveEditorDiffable() {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor == null) {
    return false;
  }
  return isPathDiffable(editor.getPath());
}

function shouldDisplayDiffTreeItem(contextMenu) {
  const node = contextMenu.getSingleSelectedNode();
  return node != null && isPathDiffable(node.uri);
}

function isPathDiffable(filePath) {
  if (filePath == null || filePath.length === 0) {
    return false;
  }
  const repository = (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(filePath);
  return repository != null && repository.getType() === 'hg';
}

// Listen for file tree context menu file item events to open the diff view.
function addFileTreeCommands(commandName, diffOptions) {
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('.tree-view .entry.file.list-item', commandName, event => {
    const filePath = (0, (_uiTreePath || _load_uiTreePath()).default)(event);
    atom.workspace.open((0, (_utils || _load_utils()).formatDiffViewUrl)(Object.assign({
      file: filePath || ''
    }, diffOptions)));
  }), atom.commands.add('.tree-view .entry.directory.list-nested-item > .list-item', commandName, event => {
    const directoryPath = (0, (_uiTreePath || _load_uiTreePath()).default)(event);
    atom.workspace.open((0, (_utils || _load_utils()).formatDiffViewUrl)(Object.assign({
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

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('atom-workspace', commandName, onTargetCommand),
  // Listen for in-editor context menu item diff view open command.
  atom.commands.add('atom-text-editor', commandName, onTargetCommand));
}

let Activation = class Activation {

  constructor(rawState) {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._progressUpdates = new _rxjsBundlesRxMinJs.Subject();

    const initialState = (0, (_createEmptyAppState || _load_createEmptyAppState()).createEmptyAppState)();

    const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
    const rootEpic = (actions, store) => (0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics)(actions, store)
    // Log errors and continue.
    .catch((error, stream) => {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Diff View Epics Error:', error);
      return stream;
    });

    this._store = (0, (_redux || _load_redux()).createStore)((_Reducers || _load_Reducers()).rootReducer, initialState, (0, (_redux || _load_redux()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)(rootEpic)));
    const states = _rxjsBundlesRxMinJs.Observable.from(this._store).share();
    this._appState = new _rxjsBundlesRxMinJs.BehaviorSubject(initialState);
    this._actionCreators = (0, (_redux || _load_redux()).bindActionCreators)(_Actions || _load_Actions(), this._store.dispatch);

    this._subscriptions.add(
    // TODO(most): Remove Diff View model and use stream of props for the views instead.
    states.subscribe(_state => {
      const state = _state;
      this._getDiffViewModel().injectState(state);
      this._appState.next(state);
    }), (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).getHgRepositoryStream)().subscribe(repository => {
      this._actionCreators.addRepository(repository);
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
        shouldDisplay: function () {
          return isActiveEditorDiffable();
        }
      }, { type: 'separator' }]
    }),

    // Listen for switching to editor mode for the active file.
    atom.commands.add('nuclide-diff-view', 'nuclide-diff-view:switch-to-editor', () => {
      const filePath = this._getDiffViewModel().getState().fileDiff.filePath;

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
    atom.workspace.addOpener(uri => {
      if (uri.startsWith(NUCLIDE_DIFF_VIEW_URI)) {
        var _url$parse = _url.default.parse(uri, true);

        const diffEntityOptions = _url$parse.query;

        return (0, (_passesGK || _load_passesGK()).default)('nuclide_diff_view_new_ui').then(useNewUi => {
          if (useNewUi) {
            return this._openNewSplitView(diffEntityOptions);
          } else {
            return this._getDiffViewElement(diffEntityOptions);
          }
        });
      }
    }));

    if (rawState == null || !rawState.visible) {
      return;
    }

    const activeFilePath = rawState.activeFilePath,
          viewMode = rawState.viewMode,
          commitMode = rawState.commitMode;

    // Wait for the source control providers to be ready:

    const serviceHub = atom.packages.serviceHub;

    const restorationSubscription = _rxjsBundlesRxMinJs.Observable.merge(
    // If it's a local directory, or if "nuclide-hg-repository" was activated
    // after "nuclide-diff-view":
    (0, (_event || _load_event()).observableFromSubscribeFunction)(serviceHub.consume.bind(serviceHub, 'atom.repository-provider', '^0.1.0')),

    // If it's a remote directory, it should come on a path change event:
    (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.project.onDidChangePaths.bind(atom.project))).debounceTime(50) // Delay to avoid rushing CPU at startup time.
    .subscribe(() => tryRestoreActiveDiffView());

    this._subscriptions.add(restorationSubscription);

    const tryRestoreActiveDiffView = () => {
      // If there is no repository ready, it may be because it's a remote file,
      // or because "nuclide-hg-repository" hasn't loaded yet.
      const canRestoreActiveDiffView = activeFilePath ? isPathDiffable(activeFilePath) : atom.project.getDirectories().some(directory => {
        return isPathDiffable(directory.getPath());
      });
      if (canRestoreActiveDiffView) {
        restorationSubscription.unsubscribe();
        this._subscriptions.remove(restorationSubscription);
        atom.workspace.open((0, (_utils || _load_utils()).formatDiffViewUrl)({
          file: activeFilePath,
          viewMode: viewMode,
          commitMode: commitMode
        }));
      }
    };
  }

  _openNewSplitView(diffEntityOptions) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-open');
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-split-open');

      if (_this._splitDiffView == null) {
        _this._splitDiffView = new (_SplitDiffView || _load_SplitDiffView()).default(_this._appState.asObservable(), _this._actionCreators);
        _this._subscriptions.add(_this._splitDiffView);
      }

      _this._actionCreators.updateDiffEditorsVisibility(true);
      // Show the Diff Navigator section.
      dispatchDiffNavigatorToggle(true);

      if (!diffEntityOptions.file) {
        atom.notifications.addError('Split Diff View can only diff files');
        throw new Error('Split Diff View can only diff files');
      }
      const filePath = diffEntityOptions.file;
      // Activate the text editor of the file to be diffed.
      const textEditor = yield atom.workspace.open(filePath, { searchAllPanes: true });
      _this._activateDiffPath(diffEntityOptions);
      return textEditor;
    })();
  }

  _getDiffViewModel() {
    let diffViewModel = this._diffViewModel;
    if (diffViewModel == null) {
      diffViewModel = new (_DiffViewModel || _load_DiffViewModel()).default(this._actionCreators, this._progressUpdates);
      this._diffViewModel = diffViewModel;
    }
    return diffViewModel;
  }

  // To add a View as an Atom workspace pane, we return `DiffViewElement` extending `HTMLElement`.
  // This pattern is also followed with atom's TextEditor.
  _getDiffViewElement(diffEntityOptions) {
    if (this._diffViewElement != null) {
      const diffViewElement = this._diffViewElement;
      this._activateDiffPath(diffEntityOptions);
      return diffViewElement;
    }

    const diffModel = this._getDiffViewModel();
    this._actionCreators.updateDiffEditorsVisibility(true);
    this._actionCreators.updateDiffNavigatorVisibility(true);
    const hostElement = this._diffViewElement = new (_DiffViewElement || _load_DiffViewElement()).default().initialize(diffModel, NUCLIDE_DIFF_VIEW_URI);
    this._diffViewComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_DiffViewComponent || _load_DiffViewComponent()).default, {
      actionCreators: this._actionCreators,
      diffModel: diffModel,
      tryTriggerNux: this.tryTriggerNux.bind(this, (_diffViewNux || _load_diffViewNux()).NUX_DIFF_VIEW_ID)
    }), hostElement);
    this._activateDiffPath(diffEntityOptions);

    const destroySubscription = hostElement.onDidDestroy(() => {
      _reactForAtom.ReactDOM.unmountComponentAtNode(hostElement);
      this._actionCreators.updateDiffEditorsVisibility(false);
      this._actionCreators.updateDiffNavigatorVisibility(false);
      this._actionCreators.updateDiffEditors(null);
      destroySubscription.dispose();
      this._subscriptions.remove(destroySubscription);
      this._diffViewElement = null;
      this._diffViewComponent = null;
    });

    this._subscriptions.add(new _atom.Disposable(() => {
      hostElement.destroy();
    }), destroySubscription);

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-open');
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-old-open');
    return hostElement;
  }

  _activateDiffPath(diffEntityOptions) {
    if (diffEntityOptions.file && this._diffViewModel != null) {
      this._diffViewModel.diffFile(diffEntityOptions.file);
    }

    var _store$getState = this._store.getState();

    const viewMode = _store$getState.viewMode,
          commitMode = _store$getState.commit.mode;

    if (diffEntityOptions.viewMode != null && diffEntityOptions.viewMode !== viewMode) {
      this._actionCreators.setViewMode(diffEntityOptions.viewMode);
    }
    if (diffEntityOptions.commitMode != null && diffEntityOptions.commitMode !== commitMode) {
      this._actionCreators.setCommitMode(diffEntityOptions.commitMode);
    }
  }

  consumeOutputService(api) {
    this._subscriptions.add(api.registerOutputProvider({
      id: 'diff-view',
      messages: this._progressUpdates.asObservable()
    }));
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-diff-view');
    toolBar.addSpacer({
      priority: 800
    });
    const button = toolBar.addButton({
      icon: 'git-branch',
      callback: 'nuclide-diff-view:open',
      tooltip: 'Open Diff View',
      priority: 801
    }).element;
    button.classList.add('diff-view-count');

    const diffModel = this._getDiffViewModel();
    let lastCount = null;
    const updateToolbarCount = () => {
      const count = diffModel.getDirtyFileChangesCount();
      if (count !== lastCount) {
        button.classList.toggle('positive-count', count > 0);
        button.classList.toggle('max-count', count > 99);
        button.dataset.count = count === 0 ? '' : count > 99 ? '99+' : String(count);
        lastCount = count;
      }
    };
    updateToolbarCount();

    const toolBarSubscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(diffModel.onDidUpdateState(() => {
      updateToolbarCount();
    }), () => {
      toolBar.removeItems();
    });
    this._subscriptions.add(toolBarSubscriptions);
    return toolBarSubscriptions;
  }

  getHomeFragments() {
    return {
      feature: {
        title: 'Diff View',
        icon: 'git-branch',
        description: _reactForAtom.React.createElement(
          'span',
          null,
          'Launches an editable side-by-side compare view across mercurial dirty and commits changes, allowing committing and pushing changes to phabricator.'
        ),
        command: 'nuclide-diff-view:open'
      },
      priority: 3
    };
  }

  serialize() {
    var _appState$getValue = this._appState.getValue();

    const commitMode = _appState$getValue.commit.mode,
          diffEditorsVisible = _appState$getValue.diffEditorsVisible,
          fileDiff = _appState$getValue.fileDiff,
          viewMode = _appState$getValue.viewMode;

    if (!diffEditorsVisible) {
      return {
        visible: false
      };
    }
    return {
      visible: true,
      activeFilePath: fileDiff.filePath,
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
  consumeUIProvider(provider) {
    this._actionCreators.addUiProvider(provider);
    let pkg = this;
    this._subscriptions.add(new _atom.Disposable(() => {
      pkg = null;
    }));
    return new _atom.Disposable(() => {
      if (pkg != null) {
        pkg._actionCreators.removeUiProvider(provider);
      }
    });
  }

  consumeCwdApi(api) {
    this._actionCreators.setCwdApi(api);
    let pkg = this;
    this._subscriptions.add(() => {
      pkg = null;
    });
    return new _atom.Disposable(() => {
      if (pkg != null) {
        pkg._actionCreators.setCwdApi(null);
      }
    });
  }

  addItemsToFileTreeContextMenu(contextMenu) {
    const menuItemDescriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(contextMenu.addItemToSourceControlMenu({
      label: 'Open in Diff View',
      command: 'nuclide-diff-view:open-context',
      shouldDisplay: function () {
        return shouldDisplayDiffTreeItem(contextMenu);
      }
    }, DIFF_VIEW_FILE_TREE_CONTEXT_MENU_PRIORITY), contextMenu.addItemToSourceControlMenu({
      label: 'Commit',
      command: 'nuclide-diff-view:commit-context',
      shouldDisplay: function () {
        return shouldDisplayDiffTreeItem(contextMenu);
      }
    }, COMMIT_FILE_TREE_CONTEXT_MENU_PRIORITY), contextMenu.addItemToSourceControlMenu({
      label: 'Amend',
      command: 'nuclide-diff-view:amend-context',
      shouldDisplay: function () {
        return shouldDisplayDiffTreeItem(contextMenu);
      }
    }, AMEND_FILE_TREE_CONTEXT_MENU_PRIORITY), contextMenu.addItemToSourceControlMenu({
      label: 'Publish to Phabricator',
      command: 'nuclide-diff-view:publish-context',
      shouldDisplay: function () {
        return shouldDisplayDiffTreeItem(contextMenu);
      }
    }, PUBLISH_FILE_TREE_CONTEXT_MENU_PRIORITY));

    this._subscriptions.add(menuItemDescriptions);

    // We don't need to dispose of the menuItemDescriptions when the provider is disabled -
    // it needs to be handled by the provider itself. We only should remove it from the list
    // of the disposables we maintain.
    return new _atom.Disposable(() => {
      this._subscriptions.remove(menuItemDescriptions);
    });
  }

  __getDiffViewComponent() {
    return this._diffViewComponent;
  }

  tryTriggerNux(nuxID) {
    if (this._tryTriggerNuxService != null) {
      this._tryTriggerNuxService(nuxID);
    }
  }

  consumeRegisterNuxService(addNewNux) {
    const disposable = addNewNux((0, (_diffViewNux || _load_diffViewNux()).createDiffViewNux)());
    this._subscriptions.add(disposable);
    return disposable;
  }

  consumeTriggerNuxService(triggerNuxService) {
    this._tryTriggerNuxService = triggerNuxService;
  }

  consumeWorkspaceViewsService(api) {
    this._subscriptions.add(api.registerFactory({
      id: 'nuclide-diff-view-navigator',
      name: 'Source Control Navigator',
      toggleCommand: (_constants || _load_constants()).DIFF_VIEW_NAVIGATOR_TOGGLE_COMMAND,
      defaultLocation: 'bottom-panel',
      create: () => this._createDiffViewNavigatorElement(),
      isInstance: item => item instanceof (_DiffViewNavigatorGadget || _load_DiffViewNavigatorGadget()).default
    }));
  }

  _createDiffViewNavigatorElement() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-navigator-open');
    const diffModel = this._getDiffViewModel();
    const actionCreators = this._actionCreators;

    const boundComponent = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(this._appState.map(state => Object.assign({}, state, {
      actionCreators: actionCreators,
      diffModel: diffModel
    })), (_DiffViewNavigatorComponent || _load_DiffViewNavigatorComponent()).default);

    return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_reactForAtom.React.createElement((_DiffViewNavigatorGadget || _load_DiffViewNavigatorGadget()).default, {
      actionCreators: actionCreators,
      component: boundComponent
    }));
  }

  deserializeDiffViewNavigator() {
    return this._createDiffViewNavigatorElement();
  }

  dispose() {
    this._subscriptions.dispose();
  }
};
exports.default = (0, (_createPackage || _load_createPackage()).default)(Activation);
module.exports = exports['default'];