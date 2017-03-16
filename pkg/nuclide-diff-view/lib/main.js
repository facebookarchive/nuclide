'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _react = _interopRequireDefault(require('react'));

var _url = _interopRequireDefault(require('url'));

var _uiTreePath;

function _load_uiTreePath() {
  return _uiTreePath = _interopRequireDefault(require('../../commons-atom/ui-tree-path'));
}

var _vcs;

function _load_vcs() {
  return _vcs = require('../../commons-atom/vcs');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
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

var _SplitDiffView2;

function _load_SplitDiffView2() {
  return _SplitDiffView2 = require('./new-ui/SplitDiffView');
}

var _DiffViewNavigatorGadget;

function _load_DiffViewNavigatorGadget() {
  return _DiffViewNavigatorGadget = _interopRequireDefault(require('./new-ui/DiffViewNavigatorGadget'));
}

var _DiffViewNavigatorGadget2;

function _load_DiffViewNavigatorGadget2() {
  return _DiffViewNavigatorGadget2 = require('./new-ui/DiffViewNavigatorGadget');
}

var _DiffViewNavigatorComponent;

function _load_DiffViewNavigatorComponent() {
  return _DiffViewNavigatorComponent = _interopRequireDefault(require('./new-ui/DiffViewNavigatorComponent'));
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../commons-atom/go-to-location');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
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

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
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


// Redux store
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const NUCLIDE_DIFF_VIEW_URI = 'atom://nuclide/diff-view';
const DIFF_VIEW_FILE_TREE_CONTEXT_MENU_PRIORITY = 1000;
const COMMIT_FILE_TREE_CONTEXT_MENU_PRIORITY = 1100;
const AMEND_FILE_TREE_CONTEXT_MENU_PRIORITY = 1200;
const PUBLISH_FILE_TREE_CONTEXT_MENU_PRIORITY = 1300;

function dispatchDiffNavigatorToggle(visible) {
  atom.commands.dispatch(atom.views.getView(atom.workspace), (_constants || _load_constants()).DIFF_VIEW_NAVIGATOR_TOGGLE_COMMAND, { visible });
}

function diffActivePath(diffOptions) {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor == null) {
    // Not a file URI
    // eslint-disable-next-line nuclide-internal/atom-apis
    atom.workspace.open((0, (_utils || _load_utils()).formatDiffViewUrl)(diffOptions));
  } else {
    // Not a file URI
    // eslint-disable-next-line nuclide-internal/atom-apis
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
  const repository = (0, (_vcs || _load_vcs()).repositoryForPath)(filePath);
  return repository != null && repository.getType() === 'hg';
}

// Listen for file tree context menu file item events to open the diff view.
function addFileTreeCommands(commandName, diffOptions) {
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('.tree-view .entry.file.list-item', commandName, event => {
    const filePath = (0, (_uiTreePath || _load_uiTreePath()).default)(event);
    // Not a file URI
    // eslint-disable-next-line nuclide-internal/atom-apis
    atom.workspace.open((0, (_utils || _load_utils()).formatDiffViewUrl)(Object.assign({
      file: filePath || ''
    }, diffOptions)));
  }), atom.commands.add('.tree-view .entry.directory.list-nested-item > .list-item', commandName, event => {
    const directoryPath = (0, (_uiTreePath || _load_uiTreePath()).default)(event);
    // Not a file URI
    // eslint-disable-next-line nuclide-internal/atom-apis
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

class Activation {

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

    Promise.all((_constants || _load_constants()).GatedFeatureList.map(feature => (0, (_passesGK || _load_passesGK()).default)(feature))).then(isFeaturesEnabled => {
      const enabledFeatures = new Set();
      for (let i = 0; i < (_constants || _load_constants()).GatedFeatureList.length; i++) {
        if (isFeaturesEnabled[i]) {
          enabledFeatures.add((_constants || _load_constants()).GatedFeatureList[i]);
        }
      }
      this._actionCreators.setEnabledFeatures(enabledFeatures);
    });

    this._store = (0, (_redux || _load_redux()).createStore)((_Reducers || _load_Reducers()).rootReducer, initialState, (0, (_redux || _load_redux()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)(rootEpic)));
    const states = _rxjsBundlesRxMinJs.Observable.from(this._store).share();
    this._appState = new _rxjsBundlesRxMinJs.BehaviorSubject(initialState);
    this._actionCreators = (0, (_redux || _load_redux()).bindActionCreators)(_Actions || _load_Actions(), this._store.dispatch);

    const configUpdates = (_featureConfig || _load_featureConfig()).default.observeAsStream((_constants || _load_constants()).SHOULD_DOCK_PUBLISH_VIEW_CONFIG_KEY);

    const useDiffViewTextForm = (_featureConfig || _load_featureConfig()).default.observeAsStream((_constants || _load_constants()).DIFF_VIEW_TEXT_BASED_FORM_CONFIG_KEY);

    this._subscriptions.add(
    // TODO(most): Remove Diff View model and use stream of props for the views instead.
    states.subscribe(_state => {
      const state = _state;
      this._getDiffViewModel().injectState(state);
      this._appState.next(state);
    }), (0, (_vcs || _load_vcs()).getHgRepositoryStream)().subscribe(repository => {
      this._actionCreators.addRepository(repository);
    }), configUpdates.subscribe(shouldDockPublishView => {
      this._actionCreators.updateDockConfig(shouldDockPublishView);
    }), useDiffViewTextForm.subscribe(useTextBasedForm => {
      this._actionCreators.updateShouldUseTextBasedForm(useTextBasedForm);
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
    }), atom.commands.add('atom-workspace', 'nuclide-diff-view:toggle', () => {
      const readOnlyEditor = atom.workspace.getTextEditors().find(editor => {
        return editor != null && editor.getURI != null && editor.getURI() === (_SplitDiffView2 || _load_SplitDiffView2()).READ_ONLY_EDITOR_PATH;
      });
      if (readOnlyEditor != null) {
        dispatchDiffNavigatorToggle(false);
        readOnlyEditor.destroy();
      } else {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-diff-view:open');
      }
    }), atom.commands.add('atom-workspace', 'nuclide-diff-view:split', () => {
      const { activeRepository } = this._store.getState();
      if (activeRepository) {
        this._actionCreators.splitRevision(this._progressUpdates, activeRepository);
      }
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
        shouldDisplay() {
          return isActiveEditorDiffable();
        }
      }, { type: 'separator' }]
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
        const { query: diffEntityOptions } = _url.default.parse(uri, true);
        return this._openNewSplitView(diffEntityOptions);
      }
    }));

    if (rawState == null || !rawState.visible) {
      return;
    }

    const { activeFilePath, viewMode, commitMode } = rawState;

    // Wait for the source control providers to be ready:
    const { serviceHub } = atom.packages;
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
        // Not a file URI
        // eslint-disable-next-line nuclide-internal/atom-apis
        atom.workspace.open((0, (_utils || _load_utils()).formatDiffViewUrl)({
          file: activeFilePath,
          viewMode,
          commitMode
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
      if (!diffEntityOptions.onlyDiff) {
        // Show the Diff Navigator section.
        dispatchDiffNavigatorToggle(true);
      }

      _this._activateDiffPath(diffEntityOptions);

      let textEditor;
      if (diffEntityOptions.file) {
        const filePath = diffEntityOptions.file;
        // Activate the text editor of the file to be diffed.
        textEditor = yield (0, (_goToLocation || _load_goToLocation()).goToLocation)(filePath);
      } else {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().warn('Split Diff View can only diff files');
      }

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

  _activateDiffPath(diffEntityOptions) {
    if (diffEntityOptions.file && this._diffViewModel != null) {
      this._diffViewModel.diffFile(diffEntityOptions.file);
    }
    const { viewMode, commit: { mode: commitMode } } = this._store.getState();
    if (diffEntityOptions.viewMode != null && diffEntityOptions.viewMode !== viewMode) {
      this._actionCreators.setViewMode(diffEntityOptions.viewMode);
    }
    if (diffEntityOptions.commitMode != null && diffEntityOptions.commitMode !== commitMode) {
      this._actionCreators.setCommitMode(diffEntityOptions.commitMode);
    }
  }

  consumeOutputService(api) {
    this._subscriptions.add(api.registerOutputProvider({
      id: 'Diff View',
      messages: this._progressUpdates.asObservable()
    }));
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-diff-view');
    toolBar.addSpacer({
      priority: 800
    });
    const button = toolBar.addButton({
      icon: 'diff',
      callback: 'nuclide-diff-view:toggle',
      tooltip: 'Toggle Diff View',
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
        icon: 'diff',
        description: _react.default.createElement(
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
    const {
      commit: { mode: commitMode },
      diffEditorsVisible,
      fileDiff,
      viewMode
    } = this._appState.getValue();
    if (!diffEditorsVisible) {
      return {
        visible: false
      };
    }
    return {
      visible: true,
      activeFilePath: fileDiff.filePath,
      viewMode,
      commitMode
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
    this._subscriptions.add(() => {
      pkg = null;
    });
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
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
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      if (pkg != null) {
        pkg._actionCreators.setCwdApi(null);
      }
    });
  }

  addItemsToFileTreeContextMenu(contextMenu) {
    const menuItemDescriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(contextMenu.addItemToSourceControlMenu({
      label: 'Open in Diff View',
      command: 'nuclide-diff-view:open-context',
      shouldDisplay() {
        return shouldDisplayDiffTreeItem(contextMenu);
      }
    }, DIFF_VIEW_FILE_TREE_CONTEXT_MENU_PRIORITY), contextMenu.addItemToSourceControlMenu({
      label: 'Commit',
      command: 'nuclide-diff-view:commit-context',
      shouldDisplay() {
        return shouldDisplayDiffTreeItem(contextMenu);
      }
    }, COMMIT_FILE_TREE_CONTEXT_MENU_PRIORITY), contextMenu.addItemToSourceControlMenu({
      label: 'Amend',
      command: 'nuclide-diff-view:amend-context',
      shouldDisplay() {
        return shouldDisplayDiffTreeItem(contextMenu);
      }
    }, AMEND_FILE_TREE_CONTEXT_MENU_PRIORITY), contextMenu.addItemToSourceControlMenu({
      label: 'Publish to Phabricator',
      command: 'nuclide-diff-view:publish-context',
      shouldDisplay() {
        return shouldDisplayDiffTreeItem(contextMenu);
      }
    }, PUBLISH_FILE_TREE_CONTEXT_MENU_PRIORITY));

    this._subscriptions.add(menuItemDescriptions);

    // We don't need to dispose of the menuItemDescriptions when the provider is disabled -
    // it needs to be handled by the provider itself. We only should remove it from the list
    // of the disposables we maintain.
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._subscriptions.remove(menuItemDescriptions);
    });
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
    this._subscriptions.add(api.addOpener(uri => {
      if (uri === (_DiffViewNavigatorGadget2 || _load_DiffViewNavigatorGadget2()).WORKSPACE_VIEW_URI) {
        return this._createDiffViewNavigatorElement();
      }
    }), () => api.destroyWhere(item => item instanceof (_DiffViewNavigatorGadget || _load_DiffViewNavigatorGadget()).default), atom.commands.add('atom-workspace', (_constants || _load_constants()).DIFF_VIEW_NAVIGATOR_TOGGLE_COMMAND, event => {
      api.toggle((_DiffViewNavigatorGadget2 || _load_DiffViewNavigatorGadget2()).WORKSPACE_VIEW_URI, event.detail);
    }));
  }

  _createDiffViewNavigatorElement() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-navigator-open');
    const diffModel = this._getDiffViewModel();
    const actionCreators = this._actionCreators;

    const boundComponent = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(this._appState.map(state => Object.assign({}, state, {
      actionCreators,
      diffModel,
      tryTriggerNux: this.tryTriggerNux.bind(this, (_diffViewNux || _load_diffViewNux()).NUX_DIFF_VIEW_ID)
    })), (_DiffViewNavigatorComponent || _load_DiffViewNavigatorComponent()).default);

    return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.default.createElement((_DiffViewNavigatorGadget || _load_DiffViewNavigatorGadget()).default, {
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

  _getAppState() {
    return this._appState;
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);