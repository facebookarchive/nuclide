var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
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

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var diffViewModel = null;
var activeDiffView = null;

var tryTriggerNux = undefined;

// This url style is the one Atom uses for the welcome and settings pages.
var NUCLIDE_DIFF_VIEW_URI = 'atom://nuclide/diff-view';
var DIFF_VIEW_FILE_TREE_CONTEXT_MENU_PRIORITY = 1000;
var COMMIT_FILE_TREE_CONTEXT_MENU_PRIORITY = 1100;
var AMEND_FILE_TREE_CONTEXT_MENU_PRIORITY = 1200;
var PUBLISH_FILE_TREE_CONTEXT_MENU_PRIORITY = 1300;

// Diff View NUX constants.
var NUX_DIFF_VIEW_ID = 4368;
var NUX_DIFF_VIEW_NAME = 'nuclide_diff_view_nux';
var NUX_DIFF_VIEW_GK = 'mp_nuclide_diff_view_nux';

var uiProviders = [];

var subscriptions = null;
var cwdApi = null;

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

// To add a View as an Atom workspace pane, we return `DiffViewElement` which extends `HTMLElement`.
// This pattern is also followed with atom's TextEditor.
function createView(diffEntityOptions,
// A bound instance of the triggerNuxService that will try to trigger the Diff View NUX
triggerNuxService) {
  if (activeDiffView) {
    activateDiffPath(diffEntityOptions);
    return activeDiffView.element;
  }

  var diffModel = getDiffViewModel();
  diffModel.activate();
  var hostElement = new (_DiffViewElement2 || _DiffViewElement()).default().initialize(diffModel, NUCLIDE_DIFF_VIEW_URI);
  var component = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_DiffViewComponent2 || _DiffViewComponent()).default, {
    diffModel: diffModel,
    tryTriggerNux: triggerNuxService
  }), hostElement);
  activeDiffView = {
    component: component,
    element: hostElement
  };
  activateDiffPath(diffEntityOptions);

  var destroySubscription = hostElement.onDidDestroy(function () {
    (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(hostElement);
    diffModel.deactivate();
    destroySubscription.dispose();
    (0, (_assert2 || _assert()).default)(subscriptions);
    subscriptions.remove(destroySubscription);
    activeDiffView = null;
  });

  (0, (_assert2 || _assert()).default)(subscriptions);
  subscriptions.add(new (_atom2 || _atom()).Disposable(function () {
    hostElement.destroy();
  }), destroySubscription);

  (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-open');

  return hostElement;
}

function getDiffViewModel() {
  if (diffViewModel == null) {
    diffViewModel = new (_DiffViewModel2 || _DiffViewModel()).default();
    diffViewModel.setUiProviders(uiProviders);
    (0, (_assert2 || _assert()).default)(subscriptions);
    subscriptions.add(diffViewModel);
  }
  return diffViewModel;
}

function activateDiffPath(diffEntityOptions) {
  if (diffViewModel == null) {
    return;
  }
  if (!diffEntityOptions.file && !diffEntityOptions.directory && cwdApi != null) {
    var directory = cwdApi.getCwd();
    if (directory != null) {
      diffEntityOptions.directory = directory.getPath();
    }
  }
  diffViewModel.diffEntity(diffEntityOptions);
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
  (0, (_assert2 || _assert()).default)(subscriptions);
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
}

function addActivePathCommands(commandName, diffOptions) {
  (0, (_assert2 || _assert()).default)(subscriptions);

  function onTargetCommand(event) {
    event.preventDefault();
    event.stopPropagation();
    diffActivePath(diffOptions);
  }

  subscriptions.add(atom.commands.add('atom-workspace', commandName, onTargetCommand));
  // Listen for in-editor context menu item diff view open command.
  subscriptions.add(atom.commands.add('atom-text-editor', commandName, onTargetCommand));
}

module.exports = Object.defineProperties({

  activate: function activate(state) {
    var _this = this;

    subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    // Listen for menu item workspace diff view open command.
    addActivePathCommands('nuclide-diff-view:open');
    addActivePathCommands('nuclide-diff-view:commit', {
      viewMode: (_constants2 || _constants()).DiffMode.COMMIT_MODE,
      commitMode: (_constants2 || _constants()).CommitMode.COMMIT
    });
    addActivePathCommands('nuclide-diff-view:amend', {
      viewMode: (_constants2 || _constants()).DiffMode.COMMIT_MODE,
      commitMode: (_constants2 || _constants()).CommitMode.AMEND
    });
    addActivePathCommands('nuclide-diff-view:publish', {
      viewMode: (_constants2 || _constants()).DiffMode.PUBLISH_MODE
    });

    // Context Menu Items.
    subscriptions.add(atom.contextMenu.add({
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
    }));

    // Listen for switching to editor mode for the active file.
    subscriptions.add(atom.commands.add('nuclide-diff-view', 'nuclide-diff-view:switch-to-editor', function () {
      var diffModel = getDiffViewModel();

      var _diffModel$getActiveFileState = diffModel.getActiveFileState();

      var filePath = _diffModel$getActiveFileState.filePath;

      if (filePath != null && filePath.length) {
        atom.workspace.open(filePath);
      }
    }));

    addFileTreeCommands('nuclide-diff-view:open-context');
    addFileTreeCommands('nuclide-diff-view:commit-context', {
      viewMode: (_constants2 || _constants()).DiffMode.COMMIT_MODE,
      commitMode: (_constants2 || _constants()).CommitMode.COMMIT
    });
    addFileTreeCommands('nuclide-diff-view:amend-context', {
      viewMode: (_constants2 || _constants()).DiffMode.COMMIT_MODE,
      commitMode: (_constants2 || _constants()).CommitMode.AMEND
    });
    addFileTreeCommands('nuclide-diff-view:publish-context', {
      viewMode: (_constants2 || _constants()).DiffMode.PUBLISH_MODE
    });

    // The Diff View will open its main UI in a tab, like Atom's preferences and welcome pages.
    subscriptions.add(atom.workspace.addOpener(function (uri) {
      if (uri.startsWith(NUCLIDE_DIFF_VIEW_URI)) {
        if (!require('semver').gte(atom.getVersion(), '1.6.1')) {
          throw new Error('Outdated Atom version<br/>\n' + '**Nuclide\'s Diff View require Atom 1.6.1 or later**');
        }

        var _default$parse = (_url2 || _url()).default.parse(uri, true);

        var diffEntityOptions = _default$parse.query;

        return createView(diffEntityOptions, _this.triggerNux.bind(_this, NUX_DIFF_VIEW_ID));
      }
    }));

    if (state == null || !state.visible) {
      return;
    }

    var activeFilePath = state.activeFilePath;
    var viewMode = state.viewMode;
    var commitMode = state.commitMode;

    // Wait for the source control providers to be ready:
    var restorationSubscriptions = new (_atom2 || _atom()).CompositeDisposable(
    // If it's a local directory, or if "nuclide-hg-repository" was activated
    // after "nuclide-diff-view":
    atom.packages.serviceHub.consume('atom.repository-provider', '^0.1.0', function () {
      tryRestoreActiveDiffView();
    }),
    // If it's a remote directory, it should come on a path change event:
    atom.project.onDidChangePaths(function () {
      tryRestoreActiveDiffView();
    }));
    subscriptions.add(restorationSubscriptions);

    function tryRestoreActiveDiffView() {
      // If there is no repository ready, it may be because it's a remote file,
      // or because "nuclide-hg-repository" hasn't loaded yet.
      var canRestoreActiveDiffView = activeFilePath ? isPathDiffable(activeFilePath) : atom.project.getDirectories().some(function (directory) {
        return isPathDiffable(directory.getPath());
      });
      if (canRestoreActiveDiffView) {
        restorationSubscriptions.dispose();
        (0, (_assert2 || _assert()).default)(subscriptions);
        subscriptions.remove(restorationSubscriptions);
        atom.workspace.open(formatDiffViewUrl({
          file: activeFilePath,
          viewMode: viewMode,
          commitMode: commitMode
        }));
      }
    }
  },

  consumeToolBar: function consumeToolBar(getToolBar) {
    var toolBar = getToolBar('nuclide-diff-view');
    var button = toolBar.addButton({
      icon: 'git-branch',
      callback: 'nuclide-diff-view:open',
      tooltip: 'Open Diff View',
      priority: 300
    }).element;
    button.classList.add('diff-view-count');

    var diffModel = getDiffViewModel();
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
    (0, (_assert2 || _assert()).default)(subscriptions);
    subscriptions.add(toolBarSubscriptions);
    return toolBarSubscriptions;
  },

  getHomeFragments: function getHomeFragments() {
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
  },

  serialize: function serialize() {
    if (!activeDiffView || !diffViewModel) {
      return {
        visible: false
      };
    }

    var _diffViewModel$getActiveFileState = diffViewModel.getActiveFileState();

    var filePath = _diffViewModel$getActiveFileState.filePath;

    var _diffViewModel$getState = diffViewModel.getState();

    var viewMode = _diffViewModel$getState.viewMode;
    var commitMode = _diffViewModel$getState.commitMode;

    return {
      visible: true,
      activeFilePath: filePath,
      viewMode: viewMode,
      commitMode: commitMode
    };
  },

  deactivate: function deactivate() {
    uiProviders.splice(0);
    if (subscriptions != null) {
      subscriptions.dispose();
      subscriptions = null;
    }
    if (diffViewModel != null) {
      diffViewModel.dispose();
      diffViewModel = null;
    }
    activeDiffView = null;
  },

  /**
   * The diff-view package can consume providers that return React components to
   * be rendered inline.
   * A uiProvider must have a method composeUiElements with the following spec:
   * @param filePath The path of the file the diff view is opened for
   * @return An array of InlineComments (defined above) to be rendered into the
   *         diff view
   */
  consumeUIProvider: function consumeUIProvider(provider) {
    uiProviders.push(provider);
    if (diffViewModel != null) {
      diffViewModel.setUiProviders(uiProviders);
    }
    return;
  },

  consumeCwdApi: function consumeCwdApi(api) {
    cwdApi = api;
  },

  addItemsToFileTreeContextMenu: function addItemsToFileTreeContextMenu(contextMenu) {
    (0, (_assert2 || _assert()).default)(subscriptions);
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

    subscriptions.add(menuItemDescriptions);

    // We don't need to dispose of the menuItemDescriptions when the provider is disabled -
    // it needs to be handled by the provider itself. We only should remove it from the list
    // of the disposables we maintain.
    return new (_atom2 || _atom()).Disposable(function () {
      if (subscriptions != null) {
        subscriptions.remove(menuItemDescriptions);
      }
    });
  },

  triggerNux: function triggerNux(nuxID) {
    if (tryTriggerNux != null) {
      tryTriggerNux(nuxID);
    }
  },

  consumeRegisterNuxService: function consumeRegisterNuxService(addNewNux) {
    var disposable = addNewNux(_createDiffViewNux());
    (0, (_assert2 || _assert()).default)(subscriptions != null);
    subscriptions.add(disposable);
    return disposable;
  },

  consumeTriggerNuxService: function consumeTriggerNuxService(tryTriggerNuxService) {
    tryTriggerNux = tryTriggerNuxService;
    module.exports.tryTriggerNux = tryTriggerNux;
  },

  NUX_DIFF_VIEW_ID: NUX_DIFF_VIEW_ID,

  tryTriggerNux: tryTriggerNux
}, {
  __testDiffView: {
    get: function get() {
      return activeDiffView;
    },
    configurable: true,
    enumerable: true
  }
});

function _createDiffViewNux() {

  var diffViewFilesNux = {
    content: 'View the list of newly added and modified files.',
    selector: '.nuclide-diff-view-tree',
    position: 'top'
  };

  var diffViewTimelineNux = {
    content: 'Compare, commit and amend revisions!',
    selector: '.nuclide-diff-timeline',
    position: 'top'
  };

  var diffViewEditButtonNux = {
    content: 'Want to make changes? Click here to open the file in an editor.',
    selector: '.nuclide-diff-view-goto-editor-button',
    position: 'left'
  };

  var diffViewPhabricatorNux = {
    content: 'Publish your changes to Phabricator without leaving Nuclide!',
    selector: '.nuclide-diff-timeline .revision-timeline-wrap .btn',
    position: 'bottom'
  };

  var diffViewNuxTour = {
    id: NUX_DIFF_VIEW_ID,
    name: NUX_DIFF_VIEW_NAME,
    gatekeeperID: NUX_DIFF_VIEW_GK,
    nuxList: [diffViewFilesNux, diffViewTimelineNux, diffViewEditButtonNux, diffViewPhabricatorNux]
  };

  return diffViewNuxTour;
}