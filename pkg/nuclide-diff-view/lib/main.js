var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _libNuclideFeatures = require('../../../lib/nuclide-features');

var _utils = require('./utils');

var _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');

var _nuclideLogging = require('../../nuclide-logging');

var _constants = require('./constants');

var diffViewModel = null;
var activeDiffView = null;

// This url style is the one Atom uses for the welcome and settings pages.
var NUCLIDE_DIFF_VIEW_URI = 'atom://nuclide/diff-view';
var DIFF_VIEW_FILE_TREE_CONTEXT_MENU_PRIORITY = 1000;
var COMMIT_FILE_TREE_CONTEXT_MENU_PRIORITY = 1100;
var AMEND_FILE_TREE_CONTEXT_MENU_PRIORITY = 1200;
var PUBLISH_FILE_TREE_CONTEXT_MENU_PRIORITY = 1300;

var uiProviders = [];

var subscriptions = null;
var toolBar = null;
var changeCountElement = null;
var cwdApi = null;

function formatDiffViewUrl(diffEntityOptions) {
  if (diffEntityOptions == null) {
    diffEntityOptions = { file: '' };
  }
  return _url2['default'].format({
    protocol: 'atom',
    host: 'nuclide',
    pathname: 'diff-view',
    slashes: true,
    query: diffEntityOptions
  });
}

// To add a View as an Atom workspace pane, we return `DiffViewElement` which extends `HTMLElement`.
// This pattetn is also followed with atom's TextEditor.
function createView(diffEntityOptions) {
  if (activeDiffView) {
    activateDiffPath(diffEntityOptions);
    return activeDiffView.element;
  }
  var DiffViewElement = require('./DiffViewElement');
  var DiffViewComponent = require('./DiffViewComponent');

  var diffModel = getDiffViewModel();
  var hostElement = new DiffViewElement().initialize(diffModel, NUCLIDE_DIFF_VIEW_URI);
  var component = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(DiffViewComponent, { diffModel: diffModel }), hostElement);
  activeDiffView = {
    component: component,
    element: hostElement
  };
  diffModel.activate();
  activateDiffPath(diffEntityOptions);

  var destroySubscription = hostElement.onDidDestroy(function () {
    _reactForAtom.ReactDOM.unmountComponentAtNode(hostElement);
    diffModel.deactivate();
    destroySubscription.dispose();
    (0, _assert2['default'])(subscriptions);
    subscriptions.remove(destroySubscription);
    activeDiffView = null;
  });

  (0, _assert2['default'])(subscriptions);
  subscriptions.add(destroySubscription);

  var _require = require('../../nuclide-analytics');

  var track = _require.track;

  track('diff-view-open');

  return hostElement;
}

function getDiffViewModel() {
  if (diffViewModel == null) {
    var DiffViewModel = require('./DiffViewModel');
    diffViewModel = new DiffViewModel();
    diffViewModel.setUiProviders(uiProviders);
    (0, _assert2['default'])(subscriptions);
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

function projectsContainPath(checkPath) {
  var _require2 = require('../../nuclide-remote-uri');

  var isRemote = _require2.isRemote;

  return atom.project.getDirectories().some(function (directory) {
    var directoryPath = directory.getPath();
    if (!checkPath.startsWith(directoryPath)) {
      return false;
    }
    // If the remote directory hasn't yet loaded.
    if (isRemote(checkPath) && directory instanceof _atom.Directory) {
      return false;
    }
    return true;
  });
}

function updateToolbarCount(diffViewButton, count) {
  if (!changeCountElement) {
    changeCountElement = document.createElement('span');
    changeCountElement.className = 'diff-view-count';
    diffViewButton.appendChild(changeCountElement);
  }
  if (count > 0) {
    diffViewButton.classList.add('positive-count');
  } else {
    diffViewButton.classList.remove('positive-count');
  }
  var DiffCountComponent = require('./DiffCountComponent');
  _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(DiffCountComponent, { count: count }), changeCountElement);
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
  var repository = (0, _nuclideHgGitBridge.repositoryForPath)(filePath);
  return repository != null && repository.getType() === 'hg';
}

// Listen for file tree context menu file item events to open the diff view.
function addFileTreeCommands(commandName, diffOptions) {
  (0, _assert2['default'])(subscriptions);
  subscriptions.add(atom.commands.add('.tree-view .entry.file.list-item', commandName, function (event) {
    var filePath = (0, _utils.getFileTreePathFromTargetEvent)(event);
    atom.workspace.open(formatDiffViewUrl(_extends({
      file: filePath || ''
    }, diffOptions)));
  }));

  subscriptions.add(atom.commands.add('.tree-view .entry.directory.list-nested-item > .list-item', commandName, function (event) {
    var directoryPath = (0, _utils.getFileTreePathFromTargetEvent)(event);
    atom.workspace.open(formatDiffViewUrl(_extends({
      directory: directoryPath || ''
    }, diffOptions)));
  }));
}

function addActivePathCommands(commandName, diffOptions) {
  (0, _assert2['default'])(subscriptions);
  var boundDiffActivePath = diffActivePath.bind(null, diffOptions);
  subscriptions.add(atom.commands.add('atom-workspace', commandName, boundDiffActivePath));
  // Listen for in-editor context menu item diff view open command.
  subscriptions.add(atom.commands.add('atom-text-editor', commandName, boundDiffActivePath));
}

module.exports = Object.defineProperties({

  activate: function activate(state) {
    subscriptions = new _atom.CompositeDisposable();
    // Listen for menu item workspace diff view open command.
    addActivePathCommands('nuclide-diff-view:open');
    addActivePathCommands('nuclide-diff-view:commit', {
      viewMode: _constants.DiffMode.COMMIT_MODE,
      commitMode: _constants.CommitMode.COMMIT
    });
    addActivePathCommands('nuclide-diff-view:amend', {
      viewMode: _constants.DiffMode.COMMIT_MODE,
      commitMode: _constants.CommitMode.AMEND
    });
    addActivePathCommands('nuclide-diff-view:publish', {
      viewMode: _constants.DiffMode.PUBLISH_MODE
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
      viewMode: _constants.DiffMode.COMMIT_MODE,
      commitMode: _constants.CommitMode.COMMIT
    });
    addFileTreeCommands('nuclide-diff-view:amend-context', {
      viewMode: _constants.DiffMode.COMMIT_MODE,
      commitMode: _constants.CommitMode.AMEND
    });
    addFileTreeCommands('nuclide-diff-view:publish-context', {
      viewMode: _constants.DiffMode.PUBLISH_MODE
    });

    // The Diff View will open its main UI in a tab, like Atom's preferences and welcome pages.
    subscriptions.add(atom.workspace.addOpener(function (uri) {
      if (uri.startsWith(NUCLIDE_DIFF_VIEW_URI)) {
        if (!require('semver').gte(atom.getVersion(), '1.6.1')) {
          throw new Error('Outdated Atom version<br/>\n' + '**Nuclide\'s Diff View require Atom 1.6.1 or later**');
        }

        var _url$parse = _url2['default'].parse(uri, true);

        var diffEntityOptions = _url$parse.query;

        return createView(diffEntityOptions);
      }
    }));

    if (state == null || !state.visible) {
      return;
    }

    var activeFilePath = state.activeFilePath;
    var viewMode = state.viewMode;
    var commitMode = state.commitMode;

    // Wait for all source control providers to register.
    subscriptions.add(_libNuclideFeatures.nuclideFeatures.onDidActivateInitialFeatures(function () {
      function restoreActiveDiffView() {
        atom.workspace.open(formatDiffViewUrl({
          file: activeFilePath,
          viewMode: viewMode,
          commitMode: commitMode
        }));
      }

      // If it's a local directory, it must be loaded with packages activation.
      if (!activeFilePath || projectsContainPath(activeFilePath)) {
        restoreActiveDiffView();
        return;
      }
      // If it's a remote directory, it should come on a path change event.
      // The change handler is delayed to break the race with the `DiffViewModel` subscription.
      var changePathsSubscription = atom.project.onDidChangePaths(function () {
        return setTimeout(function () {
          // try/catch here because in case of any error, Atom stops dispatching events to the
          // rest of the listeners, which can stop the remote editing from being functional.
          try {
            if (projectsContainPath(activeFilePath)) {
              restoreActiveDiffView();
              changePathsSubscription.dispose();
              (0, _assert2['default'])(subscriptions);
              subscriptions.remove(changePathsSubscription);
            }
          } catch (e) {
            (0, _nuclideLogging.getLogger)().error('DiffView restore error', e);
          }
        }, 10);
      });
      (0, _assert2['default'])(subscriptions);
      subscriptions.add(changePathsSubscription);
    }));
  },

  consumeToolBar: function consumeToolBar(getToolBar) {
    toolBar = getToolBar('nuclide-diff-view');
    var button = toolBar.addButton({
      icon: 'git-branch',
      callback: 'nuclide-diff-view:open',
      tooltip: 'Open Diff View',
      priority: 300
    })[0];
    var diffModel = getDiffViewModel();
    updateToolbarCount(button, diffModel.getState().dirtyFileChanges.size);
    (0, _assert2['default'])(subscriptions);
    subscriptions.add(diffModel.onDidUpdateState(function () {
      updateToolbarCount(button, diffModel.getState().dirtyFileChanges.size);
    }));
  },

  getHomeFragments: function getHomeFragments() {
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
    if (toolBar != null) {
      toolBar.removeItems();
      toolBar = null;
    }
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
    (0, _assert2['default'])(subscriptions);
    var menuItemDescriptions = new _atom.CompositeDisposable();
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
    return menuItemDescriptions;
  }

}, {
  __testDiffView: {
    get: function get() {
      return activeDiffView;
    },
    configurable: true,
    enumerable: true
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O29CQXFCNkMsTUFBTTs7NEJBQ3JCLGdCQUFnQjs7c0JBQ3hCLFFBQVE7Ozs7bUJBQ2QsS0FBSzs7OztrQ0FDUywrQkFBK0I7O3FCQUNoQixTQUFTOztrQ0FDdEIsNkJBQTZCOzs4QkFDckMsdUJBQXVCOzt5QkFDWixhQUFhOztBQVdoRCxJQUFJLGFBQWlDLEdBQUcsSUFBSSxDQUFDO0FBQzdDLElBQUksY0FHSCxHQUFJLElBQUksQ0FBQzs7O0FBR1YsSUFBTSxxQkFBcUIsR0FBRywwQkFBMEIsQ0FBQztBQUN6RCxJQUFNLHlDQUF5QyxHQUFHLElBQUksQ0FBQztBQUN2RCxJQUFNLHNDQUFzQyxHQUFHLElBQUksQ0FBQztBQUNwRCxJQUFNLHFDQUFxQyxHQUFHLElBQUksQ0FBQztBQUNuRCxJQUFNLHVDQUF1QyxHQUFHLElBQUksQ0FBQzs7QUFFckQsSUFBTSxXQUE4QixHQUFHLEVBQUUsQ0FBQzs7QUFFMUMsSUFBSSxhQUFtQyxHQUFHLElBQUksQ0FBQztBQUMvQyxJQUFJLE9BQWEsR0FBRyxJQUFJLENBQUM7QUFDekIsSUFBSSxrQkFBZ0MsR0FBRyxJQUFJLENBQUM7QUFDNUMsSUFBSSxNQUFlLEdBQUcsSUFBSSxDQUFDOztBQUUzQixTQUFTLGlCQUFpQixDQUFDLGlCQUFzQyxFQUFVO0FBQ3pFLE1BQUksaUJBQWlCLElBQUksSUFBSSxFQUFFO0FBQzdCLHFCQUFpQixHQUFHLEVBQUMsSUFBSSxFQUFFLEVBQUUsRUFBQyxDQUFDO0dBQ2hDO0FBQ0QsU0FBTyxpQkFBSSxNQUFNLENBQUM7QUFDaEIsWUFBUSxFQUFFLE1BQU07QUFDaEIsUUFBSSxFQUFFLFNBQVM7QUFDZixZQUFRLEVBQUUsV0FBVztBQUNyQixXQUFPLEVBQUUsSUFBSTtBQUNiLFNBQUssRUFBRSxpQkFBaUI7R0FDekIsQ0FBQyxDQUFDO0NBQ0o7Ozs7QUFLRCxTQUFTLFVBQVUsQ0FBQyxpQkFBb0MsRUFBZTtBQUNyRSxNQUFJLGNBQWMsRUFBRTtBQUNsQixvQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3BDLFdBQU8sY0FBYyxDQUFDLE9BQU8sQ0FBQztHQUMvQjtBQUNELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3JELE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRXpELE1BQU0sU0FBUyxHQUFHLGdCQUFnQixFQUFFLENBQUM7QUFDckMsTUFBTSxXQUFXLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUM7QUFDdkYsTUFBTSxTQUFTLEdBQUcsdUJBQVMsTUFBTSxDQUMvQixrQ0FBQyxpQkFBaUIsSUFBQyxTQUFTLEVBQUUsU0FBUyxBQUFDLEdBQUcsRUFDM0MsV0FBVyxDQUNaLENBQUM7QUFDRixnQkFBYyxHQUFHO0FBQ2YsYUFBUyxFQUFULFNBQVM7QUFDVCxXQUFPLEVBQUUsV0FBVztHQUNyQixDQUFDO0FBQ0YsV0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3JCLGtCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUM7O0FBRXBDLE1BQU0sbUJBQW1CLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxZQUFNO0FBQ3pELDJCQUFTLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzdDLGFBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUN2Qix1QkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5Qiw2QkFBVSxhQUFhLENBQUMsQ0FBQztBQUN6QixpQkFBYSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQzFDLGtCQUFjLEdBQUcsSUFBSSxDQUFDO0dBQ3ZCLENBQUMsQ0FBQzs7QUFFSCwyQkFBVSxhQUFhLENBQUMsQ0FBQztBQUN6QixlQUFhLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7O2lCQUV2QixPQUFPLENBQUMseUJBQXlCLENBQUM7O01BQTNDLEtBQUssWUFBTCxLQUFLOztBQUNaLE9BQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOztBQUV4QixTQUFPLFdBQVcsQ0FBQztDQUNwQjs7QUFFRCxTQUFTLGdCQUFnQixHQUFzQjtBQUM3QyxNQUFJLGFBQWEsSUFBSSxJQUFJLEVBQUU7QUFDekIsUUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDakQsaUJBQWEsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO0FBQ3BDLGlCQUFhLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzFDLDZCQUFVLGFBQWEsQ0FBQyxDQUFDO0FBQ3pCLGlCQUFhLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0dBQ2xDO0FBQ0QsU0FBTyxhQUFhLENBQUM7Q0FDdEI7O0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxpQkFBb0MsRUFBUTtBQUNwRSxNQUFJLGFBQWEsSUFBSSxJQUFJLEVBQUU7QUFDekIsV0FBTztHQUNSO0FBQ0QsTUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0FBQzdFLFFBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNsQyxRQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7QUFDckIsdUJBQWlCLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNuRDtHQUNGO0FBQ0QsZUFBYSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0NBQzdDOztBQUVELFNBQVMsbUJBQW1CLENBQUMsU0FBaUIsRUFBVztrQkFDcEMsT0FBTyxDQUFDLDBCQUEwQixDQUFDOztNQUEvQyxRQUFRLGFBQVIsUUFBUTs7QUFDZixTQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUEsU0FBUyxFQUFJO0FBQ3JELFFBQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFBRTtBQUN4QyxhQUFPLEtBQUssQ0FBQztLQUNkOztBQUVELFFBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsMkJBQXFCLEVBQUU7QUFDekQsYUFBTyxLQUFLLENBQUM7S0FDZDtBQUNELFdBQU8sSUFBSSxDQUFDO0dBQ2IsQ0FBQyxDQUFDO0NBQ0o7O0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxjQUEyQixFQUFFLEtBQWEsRUFBUTtBQUM1RSxNQUFJLENBQUMsa0JBQWtCLEVBQUU7QUFDdkIsc0JBQWtCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwRCxzQkFBa0IsQ0FBQyxTQUFTLEdBQUcsaUJBQWlCLENBQUM7QUFDakQsa0JBQWMsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQztHQUNoRDtBQUNELE1BQUksS0FBSyxHQUFHLENBQUMsRUFBRTtBQUNiLGtCQUFjLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0dBQ2hELE1BQU07QUFDTCxrQkFBYyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztHQUNuRDtBQUNELE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDM0QseUJBQVMsTUFBTSxDQUFDLGtDQUFDLGtCQUFrQixJQUFDLEtBQUssRUFBRSxLQUFLLEFBQUMsR0FBRyxFQUFFLGtCQUFrQixDQUFDLENBQUM7Q0FDM0U7O0FBRUQsU0FBUyxjQUFjLENBQUMsV0FBb0IsRUFBUTtBQUNsRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDcEQsTUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0FBQ2xCLFFBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7R0FDckQsTUFBTTtBQUNMLFFBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQjtBQUNuQyxVQUFJLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUU7T0FDekIsV0FBVyxFQUNkLENBQUMsQ0FBQztHQUNMO0NBQ0Y7O0FBRUQsU0FBUyxzQkFBc0IsR0FBWTtBQUN6QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDcEQsTUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0FBQ2xCLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7QUFDRCxTQUFPLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztDQUN6Qzs7QUFFRCxTQUFTLHlCQUF5QixDQUFDLFdBQWdDLEVBQVc7QUFDNUUsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLHFCQUFxQixFQUFFLENBQUM7QUFDakQsU0FBTyxJQUFJLElBQUksSUFBSSxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDakQ7O0FBRUQsU0FBUyxjQUFjLENBQUMsUUFBaUIsRUFBVztBQUNsRCxNQUFJLFFBQVEsSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDN0MsV0FBTyxLQUFLLENBQUM7R0FDZDtBQUNELE1BQU0sVUFBVSxHQUFHLDJDQUFrQixRQUFRLENBQUMsQ0FBQztBQUMvQyxTQUFPLFVBQVUsSUFBSSxJQUFJLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUksQ0FBQztDQUM1RDs7O0FBR0QsU0FBUyxtQkFBbUIsQ0FBQyxXQUFtQixFQUFFLFdBQW9CLEVBQVE7QUFDNUUsMkJBQVUsYUFBYSxDQUFDLENBQUM7QUFDekIsZUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDakMsa0NBQWtDLEVBQ2xDLFdBQVcsRUFDWCxVQUFBLEtBQUssRUFBSTtBQUNQLFFBQU0sUUFBUSxHQUFHLDJDQUErQixLQUFLLENBQUMsQ0FBQztBQUN2RCxRQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxpQkFBaUI7QUFDbkMsVUFBSSxFQUFFLFFBQVEsSUFBSSxFQUFFO09BQ2pCLFdBQVcsRUFDZCxDQUFDLENBQUM7R0FDTCxDQUNGLENBQUMsQ0FBQzs7QUFFSCxlQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNqQywyREFBMkQsRUFDM0QsV0FBVyxFQUNYLFVBQUEsS0FBSyxFQUFJO0FBQ1AsUUFBTSxhQUFhLEdBQUcsMkNBQStCLEtBQUssQ0FBQyxDQUFDO0FBQzVELFFBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQjtBQUNuQyxlQUFTLEVBQUUsYUFBYSxJQUFJLEVBQUU7T0FDM0IsV0FBVyxFQUNkLENBQUMsQ0FBQztHQUNMLENBQ0YsQ0FBQyxDQUFDO0NBQ0o7O0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxXQUFtQixFQUFFLFdBQW9CLEVBQUU7QUFDeEUsMkJBQVUsYUFBYSxDQUFDLENBQUM7QUFDekIsTUFBTSxtQkFBbUIsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztBQUNuRSxlQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNqQyxnQkFBZ0IsRUFDaEIsV0FBVyxFQUNYLG1CQUFtQixDQUNwQixDQUFDLENBQUM7O0FBRUgsZUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDakMsa0JBQWtCLEVBQ2xCLFdBQVcsRUFDWCxtQkFBbUIsQ0FDcEIsQ0FBQyxDQUFDO0NBQ0o7O0FBRUQsTUFBTSxDQUFDLE9BQU8sMkJBQUc7O0FBRWYsVUFBUSxFQUFBLGtCQUFDLEtBQStCLEVBQVE7QUFDOUMsaUJBQWEsR0FBRywrQkFBeUIsQ0FBQzs7QUFFMUMseUJBQXFCLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUNoRCx5QkFBcUIsQ0FBQywwQkFBMEIsRUFBRTtBQUNoRCxjQUFRLEVBQUUsb0JBQVMsV0FBVztBQUM5QixnQkFBVSxFQUFFLHNCQUFXLE1BQU07S0FDOUIsQ0FBQyxDQUFDO0FBQ0gseUJBQXFCLENBQUMseUJBQXlCLEVBQUU7QUFDL0MsY0FBUSxFQUFFLG9CQUFTLFdBQVc7QUFDOUIsZ0JBQVUsRUFBRSxzQkFBVyxLQUFLO0tBQzdCLENBQUMsQ0FBQztBQUNILHlCQUFxQixDQUFDLDJCQUEyQixFQUFFO0FBQ2pELGNBQVEsRUFBRSxvQkFBUyxZQUFZO0tBQ2hDLENBQUMsQ0FBQzs7O0FBR0gsaUJBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7QUFDckMsd0JBQWtCLEVBQUUsQ0FDbEIsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFDLEVBQ25CO0FBQ0UsYUFBSyxFQUFFLGdCQUFnQjtBQUN2QixlQUFPLEVBQUUsQ0FDUDtBQUNFLGVBQUssRUFBRSxtQkFBbUI7QUFDMUIsaUJBQU8sRUFBRSx3QkFBd0I7U0FDbEMsRUFDRDtBQUNFLGVBQUssRUFBRSxRQUFRO0FBQ2YsaUJBQU8sRUFBRSwwQkFBMEI7U0FDcEMsRUFDRDtBQUNFLGVBQUssRUFBRSxPQUFPO0FBQ2QsaUJBQU8sRUFBRSx5QkFBeUI7U0FDbkMsRUFDRDtBQUNFLGVBQUssRUFBRSx3QkFBd0I7QUFDL0IsaUJBQU8sRUFBRSwyQkFBMkI7U0FDckMsQ0FDRjtBQUNELHFCQUFhLEVBQUEseUJBQUc7QUFDZCxpQkFBTyxzQkFBc0IsRUFBRSxDQUFDO1NBQ2pDO09BQ0YsRUFDRCxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUMsQ0FDcEI7S0FDRixDQUFDLENBQUMsQ0FBQzs7O0FBR0osaUJBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ2pDLG1CQUFtQixFQUNuQixvQ0FBb0MsRUFDcEMsWUFBTTtBQUNKLFVBQU0sU0FBUyxHQUFHLGdCQUFnQixFQUFFLENBQUM7OzBDQUNsQixTQUFTLENBQUMsa0JBQWtCLEVBQUU7O1VBQTFDLFFBQVEsaUNBQVIsUUFBUTs7QUFDZixVQUFJLFFBQVEsSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUN2QyxZQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUMvQjtLQUNGLENBQ0YsQ0FBQyxDQUFDOztBQUVILHVCQUFtQixDQUFDLGdDQUFnQyxDQUFDLENBQUM7QUFDdEQsdUJBQW1CLENBQUMsa0NBQWtDLEVBQUU7QUFDdEQsY0FBUSxFQUFFLG9CQUFTLFdBQVc7QUFDOUIsZ0JBQVUsRUFBRSxzQkFBVyxNQUFNO0tBQzlCLENBQUMsQ0FBQztBQUNILHVCQUFtQixDQUFDLGlDQUFpQyxFQUFFO0FBQ3JELGNBQVEsRUFBRSxvQkFBUyxXQUFXO0FBQzlCLGdCQUFVLEVBQUUsc0JBQVcsS0FBSztLQUM3QixDQUFDLENBQUM7QUFDSCx1QkFBbUIsQ0FBQyxtQ0FBbUMsRUFBRTtBQUN2RCxjQUFRLEVBQUUsb0JBQVMsWUFBWTtLQUNoQyxDQUFDLENBQUM7OztBQUdILGlCQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQUEsR0FBRyxFQUFJO0FBQ2hELFVBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO0FBQ3pDLFlBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUN0RCxnQkFBTSxJQUFJLEtBQUssQ0FDYiw4QkFBOEIsR0FDOUIsc0RBQXNELENBQ3ZELENBQUM7U0FDSDs7eUJBQ2tDLGlCQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDOztZQUF6QyxpQkFBaUIsY0FBeEIsS0FBSzs7QUFDWixlQUFPLFVBQVUsQ0FBRSxpQkFBaUIsQ0FBTyxDQUFDO09BQzdDO0tBQ0YsQ0FBQyxDQUFDLENBQUM7O0FBRUosUUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRTtBQUNuQyxhQUFPO0tBQ1I7O1FBRU0sY0FBYyxHQUEwQixLQUFLLENBQTdDLGNBQWM7UUFBRSxRQUFRLEdBQWdCLEtBQUssQ0FBN0IsUUFBUTtRQUFFLFVBQVUsR0FBSSxLQUFLLENBQW5CLFVBQVU7OztBQUUzQyxpQkFBYSxDQUFDLEdBQUcsQ0FBQyxvQ0FBZ0IsNEJBQTRCLENBQUMsWUFBTTtBQUNuRSxlQUFTLHFCQUFxQixHQUFHO0FBQy9CLFlBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO0FBQ3BDLGNBQUksRUFBRSxjQUFjO0FBQ3BCLGtCQUFRLEVBQVIsUUFBUTtBQUNSLG9CQUFVLEVBQVYsVUFBVTtTQUNYLENBQUMsQ0FBQyxDQUFDO09BQ0w7OztBQUdELFVBQUksQ0FBQyxjQUFjLElBQUksbUJBQW1CLENBQUMsY0FBYyxDQUFDLEVBQUU7QUFDMUQsNkJBQXFCLEVBQUUsQ0FBQztBQUN4QixlQUFPO09BQ1I7OztBQUdELFVBQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztlQUFNLFVBQVUsQ0FBQyxZQUFNOzs7QUFHbkYsY0FBSTtBQUNGLGdCQUFJLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxFQUFFO0FBQ3ZDLG1DQUFxQixFQUFFLENBQUM7QUFDeEIscUNBQXVCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsdUNBQVUsYUFBYSxDQUFDLENBQUM7QUFDekIsMkJBQWEsQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQzthQUMvQztXQUNGLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDViw0Q0FBVyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsQ0FBQztXQUNoRDtTQUNGLEVBQUUsRUFBRSxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQ1IsK0JBQVUsYUFBYSxDQUFDLENBQUM7QUFDekIsbUJBQWEsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztLQUM1QyxDQUFDLENBQUMsQ0FBQztHQUNMOztBQUVELGdCQUFjLEVBQUEsd0JBQUMsVUFBcUMsRUFBUTtBQUMxRCxXQUFPLEdBQUcsVUFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDMUMsUUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUMvQixVQUFJLEVBQUUsWUFBWTtBQUNsQixjQUFRLEVBQUUsd0JBQXdCO0FBQ2xDLGFBQU8sRUFBRSxnQkFBZ0I7QUFDekIsY0FBUSxFQUFFLEdBQUc7S0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDTixRQUFNLFNBQVMsR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3JDLHNCQUFrQixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkUsNkJBQVUsYUFBYSxDQUFDLENBQUM7QUFDekIsaUJBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFlBQU07QUFDakQsd0JBQWtCLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN4RSxDQUFDLENBQUMsQ0FBQztHQUNMOztBQUVELGtCQUFnQixFQUFBLDRCQUFrQjtBQUNoQyxXQUFPO0FBQ0wsYUFBTyxFQUFFO0FBQ1AsYUFBSyxFQUFFLFdBQVc7QUFDbEIsWUFBSSxFQUFFLFlBQVk7QUFDbEIsbUJBQVcsRUFDVDs7OztTQUdPLEFBQ1I7QUFDRCxlQUFPLEVBQUUsd0JBQXdCO09BQ2xDO0FBQ0QsY0FBUSxFQUFFLENBQUM7S0FDWixDQUFDO0dBQ0g7O0FBRUQsV0FBUyxFQUFBLHFCQUE0QjtBQUNuQyxRQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3JDLGFBQU87QUFDTCxlQUFPLEVBQUUsS0FBSztPQUNmLENBQUM7S0FDSDs7NENBQ2tCLGFBQWEsQ0FBQyxrQkFBa0IsRUFBRTs7UUFBOUMsUUFBUSxxQ0FBUixRQUFROztrQ0FDZ0IsYUFBYSxDQUFDLFFBQVEsRUFBRTs7UUFBaEQsUUFBUSwyQkFBUixRQUFRO1FBQUUsVUFBVSwyQkFBVixVQUFVOztBQUMzQixXQUFPO0FBQ0wsYUFBTyxFQUFFLElBQUk7QUFDYixvQkFBYyxFQUFFLFFBQVE7QUFDeEIsY0FBUSxFQUFSLFFBQVE7QUFDUixnQkFBVSxFQUFWLFVBQVU7S0FDWCxDQUFDO0dBQ0g7O0FBRUQsWUFBVSxFQUFBLHNCQUFTO0FBQ2pCLGVBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsUUFBSSxhQUFhLElBQUksSUFBSSxFQUFFO0FBQ3pCLG1CQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDeEIsbUJBQWEsR0FBRyxJQUFJLENBQUM7S0FDdEI7QUFDRCxRQUFJLGFBQWEsSUFBSSxJQUFJLEVBQUU7QUFDekIsbUJBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN4QixtQkFBYSxHQUFHLElBQUksQ0FBQztLQUN0QjtBQUNELGtCQUFjLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLFFBQUksT0FBTyxJQUFJLElBQUksRUFBRTtBQUNuQixhQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDdEIsYUFBTyxHQUFHLElBQUksQ0FBQztLQUNoQjtHQUNGOzs7Ozs7Ozs7O0FBVUQsbUJBQWlCLEVBQUEsMkJBQUMsUUFBb0IsRUFBRTtBQUN0QyxlQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzNCLFFBQUksYUFBYSxJQUFJLElBQUksRUFBRTtBQUN6QixtQkFBYSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUMzQztBQUNELFdBQU87R0FDUjs7QUFFRCxlQUFhLEVBQUEsdUJBQUMsR0FBVyxFQUFRO0FBQy9CLFVBQU0sR0FBRyxHQUFHLENBQUM7R0FDZDs7QUFFRCwrQkFBNkIsRUFBQSx1Q0FBQyxXQUFnQyxFQUFlO0FBQzNFLDZCQUFVLGFBQWEsQ0FBQyxDQUFDO0FBQ3pCLFFBQU0sb0JBQW9CLEdBQUcsK0JBQXlCLENBQUM7QUFDdkQsd0JBQW9CLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQywwQkFBMEIsQ0FDN0Q7QUFDRSxXQUFLLEVBQUUsbUJBQW1CO0FBQzFCLGFBQU8sRUFBRSxnQ0FBZ0M7QUFDekMsbUJBQWEsRUFBQSx5QkFBRztBQUNkLGVBQU8seUJBQXlCLENBQUMsV0FBVyxDQUFDLENBQUM7T0FDL0M7S0FDRixFQUNELHlDQUF5QyxDQUMxQyxDQUFDLENBQUM7QUFDSCx3QkFBb0IsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLDBCQUEwQixDQUM3RDtBQUNFLFdBQUssRUFBRSxRQUFRO0FBQ2YsYUFBTyxFQUFFLGtDQUFrQztBQUMzQyxtQkFBYSxFQUFBLHlCQUFHO0FBQ2QsZUFBTyx5QkFBeUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztPQUMvQztLQUNGLEVBQ0Qsc0NBQXNDLENBQ3ZDLENBQUMsQ0FBQztBQUNILHdCQUFvQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsMEJBQTBCLENBQzdEO0FBQ0UsV0FBSyxFQUFFLE9BQU87QUFDZCxhQUFPLEVBQUUsaUNBQWlDO0FBQzFDLG1CQUFhLEVBQUEseUJBQUc7QUFDZCxlQUFPLHlCQUF5QixDQUFDLFdBQVcsQ0FBQyxDQUFDO09BQy9DO0tBQ0YsRUFDRCxxQ0FBcUMsQ0FDdEMsQ0FBQyxDQUFDO0FBQ0gsd0JBQW9CLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQywwQkFBMEIsQ0FDN0Q7QUFDRSxXQUFLLEVBQUUsd0JBQXdCO0FBQy9CLGFBQU8sRUFBRSxtQ0FBbUM7QUFDNUMsbUJBQWEsRUFBQSx5QkFBRztBQUNkLGVBQU8seUJBQXlCLENBQUMsV0FBVyxDQUFDLENBQUM7T0FDL0M7S0FDRixFQUNELHVDQUF1QyxDQUN4QyxDQUFDLENBQUM7QUFDSCxpQkFBYSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ3hDLFdBQU8sb0JBQW9CLENBQUM7R0FDN0I7O0NBS0Y7QUFISyxnQkFBYztTQUFBLGVBQUc7QUFDbkIsYUFBTyxjQUFjLENBQUM7S0FDdkI7Ozs7RUFDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtDb21taXRNb2RlVHlwZSwgRGlmZk1vZGVUeXBlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWxUeXBlLCB7RGlmZkVudGl0eU9wdGlvbnN9IGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5pbXBvcnQgdHlwZSBGaWxlVHJlZUNvbnRleHRNZW51IGZyb20gJy4uLy4uL251Y2xpZGUtZmlsZS10cmVlL2xpYi9GaWxlVHJlZUNvbnRleHRNZW51JztcbmltcG9ydCB0eXBlIHtIb21lRnJhZ21lbnRzfSBmcm9tICcuLi8uLi9udWNsaWRlLWhvbWUtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7Q3dkQXBpfSBmcm9tICcuLi8uLi9udWNsaWRlLWN1cnJlbnQtd29ya2luZy1kaXJlY3RvcnkvbGliL0N3ZEFwaSc7XG5pbXBvcnQgdHlwZSB7XG4gIFVJUHJvdmlkZXIsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGlmZi11aS1wcm92aWRlci1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXJlY3Rvcnl9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtSZWFjdCwgUmVhY3RET019IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB1cmwgZnJvbSAndXJsJztcbmltcG9ydCB7bnVjbGlkZUZlYXR1cmVzfSBmcm9tICcuLi8uLi8uLi9saWIvbnVjbGlkZS1mZWF0dXJlcyc7XG5pbXBvcnQge2dldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge3JlcG9zaXRvcnlGb3JQYXRofSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5pbXBvcnQge0RpZmZNb2RlLCBDb21taXRNb2RlfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbnR5cGUgU2VyaWFsaXplZERpZmZWaWV3U3RhdGUgPSB7XG4gIHZpc2libGU6IGZhbHNlO1xufSB8IHtcbiAgdmlzaWJsZTogdHJ1ZTtcbiAgYWN0aXZlRmlsZVBhdGg6IE51Y2xpZGVVcmk7XG4gIHZpZXdNb2RlOiBEaWZmTW9kZVR5cGU7XG4gIGNvbW1pdE1vZGU6IENvbW1pdE1vZGVUeXBlO1xufTtcblxubGV0IGRpZmZWaWV3TW9kZWw6ID9EaWZmVmlld01vZGVsVHlwZSA9IG51bGw7XG5sZXQgYWN0aXZlRGlmZlZpZXc6ID97XG4gIGNvbXBvbmVudDogUmVhY3QuQ29tcG9uZW50O1xuICBlbGVtZW50OiBIVE1MRWxlbWVudDtcbn0gID0gbnVsbDtcblxuLy8gVGhpcyB1cmwgc3R5bGUgaXMgdGhlIG9uZSBBdG9tIHVzZXMgZm9yIHRoZSB3ZWxjb21lIGFuZCBzZXR0aW5ncyBwYWdlcy5cbmNvbnN0IE5VQ0xJREVfRElGRl9WSUVXX1VSSSA9ICdhdG9tOi8vbnVjbGlkZS9kaWZmLXZpZXcnO1xuY29uc3QgRElGRl9WSUVXX0ZJTEVfVFJFRV9DT05URVhUX01FTlVfUFJJT1JJVFkgPSAxMDAwO1xuY29uc3QgQ09NTUlUX0ZJTEVfVFJFRV9DT05URVhUX01FTlVfUFJJT1JJVFkgPSAxMTAwO1xuY29uc3QgQU1FTkRfRklMRV9UUkVFX0NPTlRFWFRfTUVOVV9QUklPUklUWSA9IDEyMDA7XG5jb25zdCBQVUJMSVNIX0ZJTEVfVFJFRV9DT05URVhUX01FTlVfUFJJT1JJVFkgPSAxMzAwO1xuXG5jb25zdCB1aVByb3ZpZGVyczogQXJyYXk8VUlQcm92aWRlcj4gPSBbXTtcblxubGV0IHN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlID0gbnVsbDtcbmxldCB0b29sQmFyOiA/YW55ID0gbnVsbDtcbmxldCBjaGFuZ2VDb3VudEVsZW1lbnQ6ID9IVE1MRWxlbWVudCA9IG51bGw7XG5sZXQgY3dkQXBpOiA/Q3dkQXBpID0gbnVsbDtcblxuZnVuY3Rpb24gZm9ybWF0RGlmZlZpZXdVcmwoZGlmZkVudGl0eU9wdGlvbnM/OiA/RGlmZkVudGl0eU9wdGlvbnMpOiBzdHJpbmcge1xuICBpZiAoZGlmZkVudGl0eU9wdGlvbnMgPT0gbnVsbCkge1xuICAgIGRpZmZFbnRpdHlPcHRpb25zID0ge2ZpbGU6ICcnfTtcbiAgfVxuICByZXR1cm4gdXJsLmZvcm1hdCh7XG4gICAgcHJvdG9jb2w6ICdhdG9tJyxcbiAgICBob3N0OiAnbnVjbGlkZScsXG4gICAgcGF0aG5hbWU6ICdkaWZmLXZpZXcnLFxuICAgIHNsYXNoZXM6IHRydWUsXG4gICAgcXVlcnk6IGRpZmZFbnRpdHlPcHRpb25zLFxuICB9KTtcbn1cblxuXG4vLyBUbyBhZGQgYSBWaWV3IGFzIGFuIEF0b20gd29ya3NwYWNlIHBhbmUsIHdlIHJldHVybiBgRGlmZlZpZXdFbGVtZW50YCB3aGljaCBleHRlbmRzIGBIVE1MRWxlbWVudGAuXG4vLyBUaGlzIHBhdHRldG4gaXMgYWxzbyBmb2xsb3dlZCB3aXRoIGF0b20ncyBUZXh0RWRpdG9yLlxuZnVuY3Rpb24gY3JlYXRlVmlldyhkaWZmRW50aXR5T3B0aW9uczogRGlmZkVudGl0eU9wdGlvbnMpOiBIVE1MRWxlbWVudCB7XG4gIGlmIChhY3RpdmVEaWZmVmlldykge1xuICAgIGFjdGl2YXRlRGlmZlBhdGgoZGlmZkVudGl0eU9wdGlvbnMpO1xuICAgIHJldHVybiBhY3RpdmVEaWZmVmlldy5lbGVtZW50O1xuICB9XG4gIGNvbnN0IERpZmZWaWV3RWxlbWVudCA9IHJlcXVpcmUoJy4vRGlmZlZpZXdFbGVtZW50Jyk7XG4gIGNvbnN0IERpZmZWaWV3Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9EaWZmVmlld0NvbXBvbmVudCcpO1xuXG4gIGNvbnN0IGRpZmZNb2RlbCA9IGdldERpZmZWaWV3TW9kZWwoKTtcbiAgY29uc3QgaG9zdEVsZW1lbnQgPSBuZXcgRGlmZlZpZXdFbGVtZW50KCkuaW5pdGlhbGl6ZShkaWZmTW9kZWwsIE5VQ0xJREVfRElGRl9WSUVXX1VSSSk7XG4gIGNvbnN0IGNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICA8RGlmZlZpZXdDb21wb25lbnQgZGlmZk1vZGVsPXtkaWZmTW9kZWx9IC8+LFxuICAgIGhvc3RFbGVtZW50LFxuICApO1xuICBhY3RpdmVEaWZmVmlldyA9IHtcbiAgICBjb21wb25lbnQsXG4gICAgZWxlbWVudDogaG9zdEVsZW1lbnQsXG4gIH07XG4gIGRpZmZNb2RlbC5hY3RpdmF0ZSgpO1xuICBhY3RpdmF0ZURpZmZQYXRoKGRpZmZFbnRpdHlPcHRpb25zKTtcblxuICBjb25zdCBkZXN0cm95U3Vic2NyaXB0aW9uID0gaG9zdEVsZW1lbnQub25EaWREZXN0cm95KCgpID0+IHtcbiAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKGhvc3RFbGVtZW50KTtcbiAgICBkaWZmTW9kZWwuZGVhY3RpdmF0ZSgpO1xuICAgIGRlc3Ryb3lTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICBzdWJzY3JpcHRpb25zLnJlbW92ZShkZXN0cm95U3Vic2NyaXB0aW9uKTtcbiAgICBhY3RpdmVEaWZmVmlldyA9IG51bGw7XG4gIH0pO1xuXG4gIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgc3Vic2NyaXB0aW9ucy5hZGQoZGVzdHJveVN1YnNjcmlwdGlvbik7XG5cbiAgY29uc3Qge3RyYWNrfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJyk7XG4gIHRyYWNrKCdkaWZmLXZpZXctb3BlbicpO1xuXG4gIHJldHVybiBob3N0RWxlbWVudDtcbn1cblxuZnVuY3Rpb24gZ2V0RGlmZlZpZXdNb2RlbCgpOiBEaWZmVmlld01vZGVsVHlwZSB7XG4gIGlmIChkaWZmVmlld01vZGVsID09IG51bGwpIHtcbiAgICBjb25zdCBEaWZmVmlld01vZGVsID0gcmVxdWlyZSgnLi9EaWZmVmlld01vZGVsJyk7XG4gICAgZGlmZlZpZXdNb2RlbCA9IG5ldyBEaWZmVmlld01vZGVsKCk7XG4gICAgZGlmZlZpZXdNb2RlbC5zZXRVaVByb3ZpZGVycyh1aVByb3ZpZGVycyk7XG4gICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGRpZmZWaWV3TW9kZWwpO1xuICB9XG4gIHJldHVybiBkaWZmVmlld01vZGVsO1xufVxuXG5mdW5jdGlvbiBhY3RpdmF0ZURpZmZQYXRoKGRpZmZFbnRpdHlPcHRpb25zOiBEaWZmRW50aXR5T3B0aW9ucyk6IHZvaWQge1xuICBpZiAoZGlmZlZpZXdNb2RlbCA9PSBudWxsKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICghZGlmZkVudGl0eU9wdGlvbnMuZmlsZSAmJiAhZGlmZkVudGl0eU9wdGlvbnMuZGlyZWN0b3J5ICYmIGN3ZEFwaSAhPSBudWxsKSB7XG4gICAgY29uc3QgZGlyZWN0b3J5ID0gY3dkQXBpLmdldEN3ZCgpO1xuICAgIGlmIChkaXJlY3RvcnkgIT0gbnVsbCkge1xuICAgICAgZGlmZkVudGl0eU9wdGlvbnMuZGlyZWN0b3J5ID0gZGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgICB9XG4gIH1cbiAgZGlmZlZpZXdNb2RlbC5kaWZmRW50aXR5KGRpZmZFbnRpdHlPcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gcHJvamVjdHNDb250YWluUGF0aChjaGVja1BhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCB7aXNSZW1vdGV9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJyk7XG4gIHJldHVybiBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5zb21lKGRpcmVjdG9yeSA9PiB7XG4gICAgY29uc3QgZGlyZWN0b3J5UGF0aCA9IGRpcmVjdG9yeS5nZXRQYXRoKCk7XG4gICAgaWYgKCFjaGVja1BhdGguc3RhcnRzV2l0aChkaXJlY3RvcnlQYXRoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgcmVtb3RlIGRpcmVjdG9yeSBoYXNuJ3QgeWV0IGxvYWRlZC5cbiAgICBpZiAoaXNSZW1vdGUoY2hlY2tQYXRoKSAmJiBkaXJlY3RvcnkgaW5zdGFuY2VvZiBEaXJlY3RvcnkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVUb29sYmFyQ291bnQoZGlmZlZpZXdCdXR0b246IEhUTUxFbGVtZW50LCBjb3VudDogbnVtYmVyKTogdm9pZCB7XG4gIGlmICghY2hhbmdlQ291bnRFbGVtZW50KSB7XG4gICAgY2hhbmdlQ291bnRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGNoYW5nZUNvdW50RWxlbWVudC5jbGFzc05hbWUgPSAnZGlmZi12aWV3LWNvdW50JztcbiAgICBkaWZmVmlld0J1dHRvbi5hcHBlbmRDaGlsZChjaGFuZ2VDb3VudEVsZW1lbnQpO1xuICB9XG4gIGlmIChjb3VudCA+IDApIHtcbiAgICBkaWZmVmlld0J1dHRvbi5jbGFzc0xpc3QuYWRkKCdwb3NpdGl2ZS1jb3VudCcpO1xuICB9IGVsc2Uge1xuICAgIGRpZmZWaWV3QnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ3Bvc2l0aXZlLWNvdW50Jyk7XG4gIH1cbiAgY29uc3QgRGlmZkNvdW50Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9EaWZmQ291bnRDb21wb25lbnQnKTtcbiAgUmVhY3RET00ucmVuZGVyKDxEaWZmQ291bnRDb21wb25lbnQgY291bnQ9e2NvdW50fSAvPiwgY2hhbmdlQ291bnRFbGVtZW50KTtcbn1cblxuZnVuY3Rpb24gZGlmZkFjdGl2ZVBhdGgoZGlmZk9wdGlvbnM/OiBPYmplY3QpOiB2b2lkIHtcbiAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICBpZiAoZWRpdG9yID09IG51bGwpIHtcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZvcm1hdERpZmZWaWV3VXJsKGRpZmZPcHRpb25zKSk7XG4gIH0gZWxzZSB7XG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbihmb3JtYXREaWZmVmlld1VybCh7XG4gICAgICBmaWxlOiBlZGl0b3IuZ2V0UGF0aCgpIHx8ICcnLFxuICAgICAgLi4uZGlmZk9wdGlvbnMsXG4gICAgfSkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQWN0aXZlRWRpdG9yRGlmZmFibGUoKTogYm9vbGVhbiB7XG4gIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgaWYgKGVkaXRvciA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBpc1BhdGhEaWZmYWJsZShlZGl0b3IuZ2V0UGF0aCgpKTtcbn1cblxuZnVuY3Rpb24gc2hvdWxkRGlzcGxheURpZmZUcmVlSXRlbShjb250ZXh0TWVudTogRmlsZVRyZWVDb250ZXh0TWVudSk6IGJvb2xlYW4ge1xuICBjb25zdCBub2RlID0gY29udGV4dE1lbnUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gIHJldHVybiBub2RlICE9IG51bGwgJiYgaXNQYXRoRGlmZmFibGUobm9kZS51cmkpO1xufVxuXG5mdW5jdGlvbiBpc1BhdGhEaWZmYWJsZShmaWxlUGF0aDogP3N0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoZmlsZVBhdGggPT0gbnVsbCB8fCBmaWxlUGF0aC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnlGb3JQYXRoKGZpbGVQYXRoKTtcbiAgcmV0dXJuIHJlcG9zaXRvcnkgIT0gbnVsbCAmJiByZXBvc2l0b3J5LmdldFR5cGUoKSA9PT0gJ2hnJztcbn1cblxuLy8gTGlzdGVuIGZvciBmaWxlIHRyZWUgY29udGV4dCBtZW51IGZpbGUgaXRlbSBldmVudHMgdG8gb3BlbiB0aGUgZGlmZiB2aWV3LlxuZnVuY3Rpb24gYWRkRmlsZVRyZWVDb21tYW5kcyhjb21tYW5kTmFtZTogc3RyaW5nLCBkaWZmT3B0aW9ucz86IE9iamVjdCk6IHZvaWQge1xuICBpbnZhcmlhbnQoc3Vic2NyaXB0aW9ucyk7XG4gIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICcudHJlZS12aWV3IC5lbnRyeS5maWxlLmxpc3QtaXRlbScsXG4gICAgY29tbWFuZE5hbWUsXG4gICAgZXZlbnQgPT4ge1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBnZXRGaWxlVHJlZVBhdGhGcm9tVGFyZ2V0RXZlbnQoZXZlbnQpO1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbihmb3JtYXREaWZmVmlld1VybCh7XG4gICAgICAgIGZpbGU6IGZpbGVQYXRoIHx8ICcnLFxuICAgICAgICAuLi5kaWZmT3B0aW9ucyxcbiAgICAgIH0pKTtcbiAgICB9XG4gICkpO1xuXG4gIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICcudHJlZS12aWV3IC5lbnRyeS5kaXJlY3RvcnkubGlzdC1uZXN0ZWQtaXRlbSA+IC5saXN0LWl0ZW0nLFxuICAgIGNvbW1hbmROYW1lLFxuICAgIGV2ZW50ID0+IHtcbiAgICAgIGNvbnN0IGRpcmVjdG9yeVBhdGggPSBnZXRGaWxlVHJlZVBhdGhGcm9tVGFyZ2V0RXZlbnQoZXZlbnQpO1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbihmb3JtYXREaWZmVmlld1VybCh7XG4gICAgICAgIGRpcmVjdG9yeTogZGlyZWN0b3J5UGF0aCB8fCAnJyxcbiAgICAgICAgLi4uZGlmZk9wdGlvbnMsXG4gICAgICB9KSk7XG4gICAgfVxuICApKTtcbn1cblxuZnVuY3Rpb24gYWRkQWN0aXZlUGF0aENvbW1hbmRzKGNvbW1hbmROYW1lOiBzdHJpbmcsIGRpZmZPcHRpb25zPzogT2JqZWN0KSB7XG4gIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgY29uc3QgYm91bmREaWZmQWN0aXZlUGF0aCA9IGRpZmZBY3RpdmVQYXRoLmJpbmQobnVsbCwgZGlmZk9wdGlvbnMpO1xuICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgIGNvbW1hbmROYW1lLFxuICAgIGJvdW5kRGlmZkFjdGl2ZVBhdGgsXG4gICkpO1xuICAvLyBMaXN0ZW4gZm9yIGluLWVkaXRvciBjb250ZXh0IG1lbnUgaXRlbSBkaWZmIHZpZXcgb3BlbiBjb21tYW5kLlxuICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgY29tbWFuZE5hbWUsXG4gICAgYm91bmREaWZmQWN0aXZlUGF0aCxcbiAgKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGFjdGl2YXRlKHN0YXRlOiA/U2VyaWFsaXplZERpZmZWaWV3U3RhdGUpOiB2b2lkIHtcbiAgICBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICAvLyBMaXN0ZW4gZm9yIG1lbnUgaXRlbSB3b3Jrc3BhY2UgZGlmZiB2aWV3IG9wZW4gY29tbWFuZC5cbiAgICBhZGRBY3RpdmVQYXRoQ29tbWFuZHMoJ251Y2xpZGUtZGlmZi12aWV3Om9wZW4nKTtcbiAgICBhZGRBY3RpdmVQYXRoQ29tbWFuZHMoJ251Y2xpZGUtZGlmZi12aWV3OmNvbW1pdCcsIHtcbiAgICAgIHZpZXdNb2RlOiBEaWZmTW9kZS5DT01NSVRfTU9ERSxcbiAgICAgIGNvbW1pdE1vZGU6IENvbW1pdE1vZGUuQ09NTUlULFxuICAgIH0pO1xuICAgIGFkZEFjdGl2ZVBhdGhDb21tYW5kcygnbnVjbGlkZS1kaWZmLXZpZXc6YW1lbmQnLCB7XG4gICAgICB2aWV3TW9kZTogRGlmZk1vZGUuQ09NTUlUX01PREUsXG4gICAgICBjb21taXRNb2RlOiBDb21taXRNb2RlLkFNRU5ELFxuICAgIH0pO1xuICAgIGFkZEFjdGl2ZVBhdGhDb21tYW5kcygnbnVjbGlkZS1kaWZmLXZpZXc6cHVibGlzaCcsIHtcbiAgICAgIHZpZXdNb2RlOiBEaWZmTW9kZS5QVUJMSVNIX01PREUsXG4gICAgfSk7XG5cbiAgICAvLyBDb250ZXh0IE1lbnUgSXRlbXMuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgJ2F0b20tdGV4dC1lZGl0b3InOiBbXG4gICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ1NvdXJjZSBDb250cm9sJyxcbiAgICAgICAgICBzdWJtZW51OiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBEaWZmIFZpZXcnLFxuICAgICAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXZpZXc6b3BlbicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBsYWJlbDogJ0NvbW1pdCcsXG4gICAgICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWRpZmYtdmlldzpjb21taXQnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGFiZWw6ICdBbWVuZCcsXG4gICAgICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWRpZmYtdmlldzphbWVuZCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBsYWJlbDogJ1B1Ymxpc2ggdG8gUGhhYnJpY2F0b3InLFxuICAgICAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXZpZXc6cHVibGlzaCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgICAgc2hvdWxkRGlzcGxheSgpIHtcbiAgICAgICAgICAgIHJldHVybiBpc0FjdGl2ZUVkaXRvckRpZmZhYmxlKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgLy8gTGlzdGVuIGZvciBzd2l0Y2hpbmcgdG8gZWRpdG9yIG1vZGUgZm9yIHRoZSBhY3RpdmUgZmlsZS5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICdudWNsaWRlLWRpZmYtdmlldycsXG4gICAgICAnbnVjbGlkZS1kaWZmLXZpZXc6c3dpdGNoLXRvLWVkaXRvcicsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpZmZNb2RlbCA9IGdldERpZmZWaWV3TW9kZWwoKTtcbiAgICAgICAgY29uc3Qge2ZpbGVQYXRofSA9IGRpZmZNb2RlbC5nZXRBY3RpdmVGaWxlU3RhdGUoKTtcbiAgICAgICAgaWYgKGZpbGVQYXRoICE9IG51bGwgJiYgZmlsZVBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApKTtcblxuICAgIGFkZEZpbGVUcmVlQ29tbWFuZHMoJ251Y2xpZGUtZGlmZi12aWV3Om9wZW4tY29udGV4dCcpO1xuICAgIGFkZEZpbGVUcmVlQ29tbWFuZHMoJ251Y2xpZGUtZGlmZi12aWV3OmNvbW1pdC1jb250ZXh0Jywge1xuICAgICAgdmlld01vZGU6IERpZmZNb2RlLkNPTU1JVF9NT0RFLFxuICAgICAgY29tbWl0TW9kZTogQ29tbWl0TW9kZS5DT01NSVQsXG4gICAgfSk7XG4gICAgYWRkRmlsZVRyZWVDb21tYW5kcygnbnVjbGlkZS1kaWZmLXZpZXc6YW1lbmQtY29udGV4dCcsIHtcbiAgICAgIHZpZXdNb2RlOiBEaWZmTW9kZS5DT01NSVRfTU9ERSxcbiAgICAgIGNvbW1pdE1vZGU6IENvbW1pdE1vZGUuQU1FTkQsXG4gICAgfSk7XG4gICAgYWRkRmlsZVRyZWVDb21tYW5kcygnbnVjbGlkZS1kaWZmLXZpZXc6cHVibGlzaC1jb250ZXh0Jywge1xuICAgICAgdmlld01vZGU6IERpZmZNb2RlLlBVQkxJU0hfTU9ERSxcbiAgICB9KTtcblxuICAgIC8vIFRoZSBEaWZmIFZpZXcgd2lsbCBvcGVuIGl0cyBtYWluIFVJIGluIGEgdGFiLCBsaWtlIEF0b20ncyBwcmVmZXJlbmNlcyBhbmQgd2VsY29tZSBwYWdlcy5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIodXJpID0+IHtcbiAgICAgIGlmICh1cmkuc3RhcnRzV2l0aChOVUNMSURFX0RJRkZfVklFV19VUkkpKSB7XG4gICAgICAgIGlmICghcmVxdWlyZSgnc2VtdmVyJykuZ3RlKGF0b20uZ2V0VmVyc2lvbigpLCAnMS42LjEnKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdPdXRkYXRlZCBBdG9tIHZlcnNpb248YnIvPlxcbicgK1xuICAgICAgICAgICAgJyoqTnVjbGlkZVxcJ3MgRGlmZiBWaWV3IHJlcXVpcmUgQXRvbSAxLjYuMSBvciBsYXRlcioqJyxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHtxdWVyeTogZGlmZkVudGl0eU9wdGlvbnN9ID0gdXJsLnBhcnNlKHVyaSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBjcmVhdGVWaWV3KChkaWZmRW50aXR5T3B0aW9uczogYW55KSk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgaWYgKHN0YXRlID09IG51bGwgfHwgIXN0YXRlLnZpc2libGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7YWN0aXZlRmlsZVBhdGgsIHZpZXdNb2RlLCBjb21taXRNb2RlfSA9IHN0YXRlO1xuICAgIC8vIFdhaXQgZm9yIGFsbCBzb3VyY2UgY29udHJvbCBwcm92aWRlcnMgdG8gcmVnaXN0ZXIuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQobnVjbGlkZUZlYXR1cmVzLm9uRGlkQWN0aXZhdGVJbml0aWFsRmVhdHVyZXMoKCkgPT4ge1xuICAgICAgZnVuY3Rpb24gcmVzdG9yZUFjdGl2ZURpZmZWaWV3KCkge1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZvcm1hdERpZmZWaWV3VXJsKHtcbiAgICAgICAgICBmaWxlOiBhY3RpdmVGaWxlUGF0aCxcbiAgICAgICAgICB2aWV3TW9kZSxcbiAgICAgICAgICBjb21taXRNb2RlLFxuICAgICAgICB9KSk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGl0J3MgYSBsb2NhbCBkaXJlY3RvcnksIGl0IG11c3QgYmUgbG9hZGVkIHdpdGggcGFja2FnZXMgYWN0aXZhdGlvbi5cbiAgICAgIGlmICghYWN0aXZlRmlsZVBhdGggfHwgcHJvamVjdHNDb250YWluUGF0aChhY3RpdmVGaWxlUGF0aCkpIHtcbiAgICAgICAgcmVzdG9yZUFjdGl2ZURpZmZWaWV3KCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIElmIGl0J3MgYSByZW1vdGUgZGlyZWN0b3J5LCBpdCBzaG91bGQgY29tZSBvbiBhIHBhdGggY2hhbmdlIGV2ZW50LlxuICAgICAgLy8gVGhlIGNoYW5nZSBoYW5kbGVyIGlzIGRlbGF5ZWQgdG8gYnJlYWsgdGhlIHJhY2Ugd2l0aCB0aGUgYERpZmZWaWV3TW9kZWxgIHN1YnNjcmlwdGlvbi5cbiAgICAgIGNvbnN0IGNoYW5nZVBhdGhzU3Vic2NyaXB0aW9uID0gYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT4gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vIHRyeS9jYXRjaCBoZXJlIGJlY2F1c2UgaW4gY2FzZSBvZiBhbnkgZXJyb3IsIEF0b20gc3RvcHMgZGlzcGF0Y2hpbmcgZXZlbnRzIHRvIHRoZVxuICAgICAgICAvLyByZXN0IG9mIHRoZSBsaXN0ZW5lcnMsIHdoaWNoIGNhbiBzdG9wIHRoZSByZW1vdGUgZWRpdGluZyBmcm9tIGJlaW5nIGZ1bmN0aW9uYWwuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKHByb2plY3RzQ29udGFpblBhdGgoYWN0aXZlRmlsZVBhdGgpKSB7XG4gICAgICAgICAgICByZXN0b3JlQWN0aXZlRGlmZlZpZXcoKTtcbiAgICAgICAgICAgIGNoYW5nZVBhdGhzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbnMucmVtb3ZlKGNoYW5nZVBhdGhzU3Vic2NyaXB0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBnZXRMb2dnZXIoKS5lcnJvcignRGlmZlZpZXcgcmVzdG9yZSBlcnJvcicsIGUpO1xuICAgICAgICB9XG4gICAgICB9LCAxMCkpO1xuICAgICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQoY2hhbmdlUGF0aHNTdWJzY3JpcHRpb24pO1xuICAgIH0pKTtcbiAgfSxcblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgdG9vbEJhciA9IGdldFRvb2xCYXIoJ251Y2xpZGUtZGlmZi12aWV3Jyk7XG4gICAgY29uc3QgYnV0dG9uID0gdG9vbEJhci5hZGRCdXR0b24oe1xuICAgICAgaWNvbjogJ2dpdC1icmFuY2gnLFxuICAgICAgY2FsbGJhY2s6ICdudWNsaWRlLWRpZmYtdmlldzpvcGVuJyxcbiAgICAgIHRvb2x0aXA6ICdPcGVuIERpZmYgVmlldycsXG4gICAgICBwcmlvcml0eTogMzAwLFxuICAgIH0pWzBdO1xuICAgIGNvbnN0IGRpZmZNb2RlbCA9IGdldERpZmZWaWV3TW9kZWwoKTtcbiAgICB1cGRhdGVUb29sYmFyQ291bnQoYnV0dG9uLCBkaWZmTW9kZWwuZ2V0U3RhdGUoKS5kaXJ0eUZpbGVDaGFuZ2VzLnNpemUpO1xuICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChkaWZmTW9kZWwub25EaWRVcGRhdGVTdGF0ZSgoKSA9PiB7XG4gICAgICB1cGRhdGVUb29sYmFyQ291bnQoYnV0dG9uLCBkaWZmTW9kZWwuZ2V0U3RhdGUoKS5kaXJ0eUZpbGVDaGFuZ2VzLnNpemUpO1xuICAgIH0pKTtcbiAgfSxcblxuICBnZXRIb21lRnJhZ21lbnRzKCk6IEhvbWVGcmFnbWVudHMge1xuICAgIHJldHVybiB7XG4gICAgICBmZWF0dXJlOiB7XG4gICAgICAgIHRpdGxlOiAnRGlmZiBWaWV3JyxcbiAgICAgICAgaWNvbjogJ2dpdC1icmFuY2gnLFxuICAgICAgICBkZXNjcmlwdGlvbjogKFxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgTGF1bmNoZXMgYW4gZWRpdGFibGUgc2lkZS1ieS1zaWRlIGNvbXBhcmUgdmlldyBhY3Jvc3MgbWVyY3VyaWFsIGRpcnR5IGFuZCBjb21taXRzXG4gICAgICAgICAgICBjaGFuZ2VzLCBhbGxvd2luZyBjb21taXR0aW5nIGFuZCBwdXNoaW5nIGNoYW5nZXMgdG8gcGhhYnJpY2F0b3IuXG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICApLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXZpZXc6b3BlbicsXG4gICAgICB9LFxuICAgICAgcHJpb3JpdHk6IDMsXG4gICAgfTtcbiAgfSxcblxuICBzZXJpYWxpemUoKTogU2VyaWFsaXplZERpZmZWaWV3U3RhdGUge1xuICAgIGlmICghYWN0aXZlRGlmZlZpZXcgfHwgIWRpZmZWaWV3TW9kZWwpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IGRpZmZWaWV3TW9kZWwuZ2V0QWN0aXZlRmlsZVN0YXRlKCk7XG4gICAgY29uc3Qge3ZpZXdNb2RlLCBjb21taXRNb2RlfSA9IGRpZmZWaWV3TW9kZWwuZ2V0U3RhdGUoKTtcbiAgICByZXR1cm4ge1xuICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgIGFjdGl2ZUZpbGVQYXRoOiBmaWxlUGF0aCxcbiAgICAgIHZpZXdNb2RlLFxuICAgICAgY29tbWl0TW9kZSxcbiAgICB9O1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdWlQcm92aWRlcnMuc3BsaWNlKDApO1xuICAgIGlmIChzdWJzY3JpcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICAgIGlmIChkaWZmVmlld01vZGVsICE9IG51bGwpIHtcbiAgICAgIGRpZmZWaWV3TW9kZWwuZGlzcG9zZSgpO1xuICAgICAgZGlmZlZpZXdNb2RlbCA9IG51bGw7XG4gICAgfVxuICAgIGFjdGl2ZURpZmZWaWV3ID0gbnVsbDtcbiAgICBpZiAodG9vbEJhciAhPSBudWxsKSB7XG4gICAgICB0b29sQmFyLnJlbW92ZUl0ZW1zKCk7XG4gICAgICB0b29sQmFyID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFRoZSBkaWZmLXZpZXcgcGFja2FnZSBjYW4gY29uc3VtZSBwcm92aWRlcnMgdGhhdCByZXR1cm4gUmVhY3QgY29tcG9uZW50cyB0b1xuICAgKiBiZSByZW5kZXJlZCBpbmxpbmUuXG4gICAqIEEgdWlQcm92aWRlciBtdXN0IGhhdmUgYSBtZXRob2QgY29tcG9zZVVpRWxlbWVudHMgd2l0aCB0aGUgZm9sbG93aW5nIHNwZWM6XG4gICAqIEBwYXJhbSBmaWxlUGF0aCBUaGUgcGF0aCBvZiB0aGUgZmlsZSB0aGUgZGlmZiB2aWV3IGlzIG9wZW5lZCBmb3JcbiAgICogQHJldHVybiBBbiBhcnJheSBvZiBJbmxpbmVDb21tZW50cyAoZGVmaW5lZCBhYm92ZSkgdG8gYmUgcmVuZGVyZWQgaW50byB0aGVcbiAgICogICAgICAgICBkaWZmIHZpZXdcbiAgICovXG4gIGNvbnN1bWVVSVByb3ZpZGVyKHByb3ZpZGVyOiBVSVByb3ZpZGVyKSB7XG4gICAgdWlQcm92aWRlcnMucHVzaChwcm92aWRlcik7XG4gICAgaWYgKGRpZmZWaWV3TW9kZWwgIT0gbnVsbCkge1xuICAgICAgZGlmZlZpZXdNb2RlbC5zZXRVaVByb3ZpZGVycyh1aVByb3ZpZGVycyk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfSxcblxuICBjb25zdW1lQ3dkQXBpKGFwaTogQ3dkQXBpKTogdm9pZCB7XG4gICAgY3dkQXBpID0gYXBpO1xuICB9LFxuXG4gIGFkZEl0ZW1zVG9GaWxlVHJlZUNvbnRleHRNZW51KGNvbnRleHRNZW51OiBGaWxlVHJlZUNvbnRleHRNZW51KTogSURpc3Bvc2FibGUge1xuICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICBjb25zdCBtZW51SXRlbURlc2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgbWVudUl0ZW1EZXNjcmlwdGlvbnMuYWRkKGNvbnRleHRNZW51LmFkZEl0ZW1Ub1NvdXJjZUNvbnRyb2xNZW51KFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ09wZW4gaW4gRGlmZiBWaWV3JyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZGlmZi12aWV3Om9wZW4tY29udGV4dCcsXG4gICAgICAgIHNob3VsZERpc3BsYXkoKSB7XG4gICAgICAgICAgcmV0dXJuIHNob3VsZERpc3BsYXlEaWZmVHJlZUl0ZW0oY29udGV4dE1lbnUpO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIERJRkZfVklFV19GSUxFX1RSRUVfQ09OVEVYVF9NRU5VX1BSSU9SSVRZLFxuICAgICkpO1xuICAgIG1lbnVJdGVtRGVzY3JpcHRpb25zLmFkZChjb250ZXh0TWVudS5hZGRJdGVtVG9Tb3VyY2VDb250cm9sTWVudShcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdDb21taXQnLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXZpZXc6Y29tbWl0LWNvbnRleHQnLFxuICAgICAgICBzaG91bGREaXNwbGF5KCkge1xuICAgICAgICAgIHJldHVybiBzaG91bGREaXNwbGF5RGlmZlRyZWVJdGVtKGNvbnRleHRNZW51KTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBDT01NSVRfRklMRV9UUkVFX0NPTlRFWFRfTUVOVV9QUklPUklUWSxcbiAgICApKTtcbiAgICBtZW51SXRlbURlc2NyaXB0aW9ucy5hZGQoY29udGV4dE1lbnUuYWRkSXRlbVRvU291cmNlQ29udHJvbE1lbnUoXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQW1lbmQnLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXZpZXc6YW1lbmQtY29udGV4dCcsXG4gICAgICAgIHNob3VsZERpc3BsYXkoKSB7XG4gICAgICAgICAgcmV0dXJuIHNob3VsZERpc3BsYXlEaWZmVHJlZUl0ZW0oY29udGV4dE1lbnUpO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIEFNRU5EX0ZJTEVfVFJFRV9DT05URVhUX01FTlVfUFJJT1JJVFksXG4gICAgKSk7XG4gICAgbWVudUl0ZW1EZXNjcmlwdGlvbnMuYWRkKGNvbnRleHRNZW51LmFkZEl0ZW1Ub1NvdXJjZUNvbnRyb2xNZW51KFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1B1Ymxpc2ggdG8gUGhhYnJpY2F0b3InLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXZpZXc6cHVibGlzaC1jb250ZXh0JyxcbiAgICAgICAgc2hvdWxkRGlzcGxheSgpIHtcbiAgICAgICAgICByZXR1cm4gc2hvdWxkRGlzcGxheURpZmZUcmVlSXRlbShjb250ZXh0TWVudSk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgUFVCTElTSF9GSUxFX1RSRUVfQ09OVEVYVF9NRU5VX1BSSU9SSVRZLFxuICAgICkpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKG1lbnVJdGVtRGVzY3JpcHRpb25zKTtcbiAgICByZXR1cm4gbWVudUl0ZW1EZXNjcmlwdGlvbnM7XG4gIH0sXG5cbiAgZ2V0IF9fdGVzdERpZmZWaWV3KCkge1xuICAgIHJldHVybiBhY3RpdmVEaWZmVmlldztcbiAgfSxcbn07XG4iXX0=