function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _libNuclideFeatures = require('../../../../lib/nuclideFeatures');

var _libNuclideFeatures2 = _interopRequireDefault(_libNuclideFeatures);

var _utils = require('./utils');

var diffViewModel = null;
var activeDiffView = null;

// This url style is the one Atom uses for the welcome and settings pages.
var NUCLIDE_DIFF_VIEW_URI = 'atom://nuclide/diff-view';
var uiProviders = [];

var subscriptions = null;
var toolBar = null;
var changeCountElement = null;
var logger = null;

function getLogger() {
  return logger || (logger = require('../../logging').getLogger());
}

// To add a View as an Atom workspace pane, we return `DiffViewElement` which extends `HTMLElement`.
// This pattetn is also followed with atom's TextEditor.
function createView(entryPath) {
  if (activeDiffView) {
    activateFilePath(entryPath);
    return activeDiffView.element;
  }

  var _require = require('react-for-atom');

  var React = _require.React;
  var ReactDOM = _require.ReactDOM;

  var DiffViewElement = require('./DiffViewElement');
  var DiffViewComponent = require('./DiffViewComponent');

  var diffModel = getDiffViewModel();
  var hostElement = new DiffViewElement().initialize(diffModel, NUCLIDE_DIFF_VIEW_URI);
  var component = ReactDOM.render(React.createElement(DiffViewComponent, { diffModel: diffModel }), hostElement);
  activeDiffView = {
    component: component,
    element: hostElement
  };
  diffModel.activate();
  activateFilePath(entryPath);

  var destroySubscription = hostElement.onDidDestroy(function () {
    ReactDOM.unmountComponentAtNode(hostElement);
    diffModel.deactivate();
    destroySubscription.dispose();
    (0, _assert2['default'])(subscriptions);
    subscriptions.remove(destroySubscription);
    activeDiffView = null;
  });

  (0, _assert2['default'])(subscriptions);
  subscriptions.add(destroySubscription);

  var _require2 = require('../../analytics');

  var track = _require2.track;

  track('diff-view-open');

  return hostElement;
}

function getDiffViewModel() {
  if (!diffViewModel) {
    var DiffViewModel = require('./DiffViewModel');
    diffViewModel = new DiffViewModel(uiProviders);
    (0, _assert2['default'])(subscriptions);
    subscriptions.add(diffViewModel);
  }
  return diffViewModel;
}

function activateFilePath(filePath) {
  if (!filePath.length || !diffViewModel) {
    // The Diff View could be opened with no path at all.
    return;
  }
  diffViewModel.activateFile(filePath);
}

function projectsContainPath(checkPath) {
  var _require3 = require('../../remote-uri');

  var isRemote = _require3.isRemote;

  var _require4 = require('atom');

  var Directory = _require4.Directory;

  return atom.project.getDirectories().some(function (directory) {
    var directoryPath = directory.getPath();
    if (!checkPath.startsWith(directoryPath)) {
      return false;
    }
    // If the remote directory hasn't yet loaded.
    if (isRemote(checkPath) && directory instanceof Directory) {
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

  var _require5 = require('react-for-atom');

  var React = _require5.React;
  var ReactDOM = _require5.ReactDOM;

  var DiffCountComponent = require('./DiffCountComponent');
  ReactDOM.render(React.createElement(DiffCountComponent, { count: count }), changeCountElement);
}

module.exports = Object.defineProperties({

  activate: function activate(state) {
    subscriptions = new _atom.CompositeDisposable();
    // Listen for menu item workspace diff view open command.
    subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-diff-view:open', function () {
      return atom.workspace.open(NUCLIDE_DIFF_VIEW_URI);
    }));
    // Listen for in-editor context menu item diff view open command.
    subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-diff-view:open', function () {
      var editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        return getLogger().warn('No active text editor for diff view!');
      }
      atom.workspace.open(NUCLIDE_DIFF_VIEW_URI + (editor.getPath() || ''));
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

    // Listen for file tree context menu file item events to open the diff view.
    subscriptions.add(atom.commands.add('.tree-view .entry.file.list-item', 'nuclide-diff-view:open-context', function (event) {
      var filePath = (0, _utils.getFileTreePathFromTargetEvent)(event);
      atom.workspace.open(NUCLIDE_DIFF_VIEW_URI + (filePath || ''));
    }));
    subscriptions.add(atom.contextMenu.add({
      '.tree-view .entry.file.list-item': [{ type: 'separator' }, {
        label: 'Open in Diff View',
        command: 'nuclide-diff-view:open-context'
      }, { type: 'separator' }]
    }));

    // Listen for file tree context menu directory item events to open the diff view.
    subscriptions.add(atom.commands.add('.tree-view .entry.directory.list-nested-item', 'nuclide-diff-view:open-context', function (event) {
      atom.workspace.open(NUCLIDE_DIFF_VIEW_URI);
    }));
    subscriptions.add(atom.contextMenu.add({
      '.tree-view .entry.directory.list-nested-item': [{ type: 'separator' }, {
        label: 'Open in Diff View',
        command: 'nuclide-diff-view:open-context'
      }, { type: 'separator' }]
    }));

    // The Diff View will open its main UI in a tab, like Atom's preferences and welcome pages.
    subscriptions.add(atom.workspace.addOpener(function (uri) {
      if (uri.startsWith(NUCLIDE_DIFF_VIEW_URI)) {
        return createView(uri.slice(NUCLIDE_DIFF_VIEW_URI.length));
      }
    }));

    if (!state || !state.activeFilePath) {
      return;
    }

    // Wait for all source control providers to register.
    subscriptions.add(_libNuclideFeatures2['default'].onDidActivateInitialFeatures(function () {
      (0, _assert2['default'])(state);
      var activeFilePath = state.activeFilePath;

      // If it's a local directory, it must be loaded with packages activation.
      if (projectsContainPath(activeFilePath)) {
        atom.workspace.open(NUCLIDE_DIFF_VIEW_URI + activeFilePath);
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
              atom.workspace.open(NUCLIDE_DIFF_VIEW_URI + activeFilePath);
              changePathsSubscription.dispose();
              (0, _assert2['default'])(subscriptions);
              subscriptions.remove(changePathsSubscription);
            }
          } catch (e) {
            getLogger().error('DiffView restore error', e);
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
    var _require6 = require('react-for-atom');

    var React = _require6.React;

    return {
      feature: {
        title: 'Diff View',
        icon: 'git-branch',
        description: React.createElement(
          'span',
          null,
          'Launches an editable side-by-side view of the output of the Mercurial',
          React.createElement(
            'code',
            null,
            'hg diff'
          ),
          ' command, showing pending changes to be committed.'
        ),
        command: 'nuclide-diff-view:open'
      },
      priority: 3
    };
  },

  serialize: function serialize() {
    if (!activeDiffView || !diffViewModel) {
      return {};
    }

    var _diffViewModel$getActiveFileState = diffViewModel.getActiveFileState();

    var filePath = _diffViewModel$getActiveFileState.filePath;

    return {
      activeFilePath: filePath
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
  consumeProvider: function consumeProvider(provider) {
    // TODO(most): Fix UI rendering and re-introduce: t8174332
    // uiProviders.push(provider);
    return;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFja0MsTUFBTTs7c0JBQ2xCLFFBQVE7Ozs7a0NBQ0YsaUNBQWlDOzs7O3FCQUNoQixTQUFTOztBQUV0RCxJQUFJLGFBQWlDLEdBQUcsSUFBSSxDQUFDO0FBQzdDLElBQUksY0FHSCxHQUFJLElBQUksQ0FBQzs7O0FBR1YsSUFBTSxxQkFBcUIsR0FBRywwQkFBMEIsQ0FBQztBQUN6RCxJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7O0FBRXZCLElBQUksYUFBbUMsR0FBRyxJQUFJLENBQUM7QUFDL0MsSUFBSSxPQUFhLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLElBQUksa0JBQWdDLEdBQUcsSUFBSSxDQUFDO0FBQzVDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsU0FBUyxTQUFTLEdBQUc7QUFDbkIsU0FBTyxNQUFNLEtBQUssTUFBTSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQSxBQUFDLENBQUM7Q0FDbEU7Ozs7QUFJRCxTQUFTLFVBQVUsQ0FBQyxTQUFpQixFQUFlO0FBQ2xELE1BQUksY0FBYyxFQUFFO0FBQ2xCLG9CQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzVCLFdBQU8sY0FBYyxDQUFDLE9BQU8sQ0FBQztHQUMvQjs7aUJBS0csT0FBTyxDQUFDLGdCQUFnQixDQUFDOztNQUYzQixLQUFLLFlBQUwsS0FBSztNQUNMLFFBQVEsWUFBUixRQUFROztBQUVWLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3JELE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRXpELE1BQU0sU0FBUyxHQUFHLGdCQUFnQixFQUFFLENBQUM7QUFDckMsTUFBTSxXQUFXLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUM7QUFDdkYsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FDL0Isb0JBQUMsaUJBQWlCLElBQUMsU0FBUyxFQUFFLFNBQVMsQUFBQyxHQUFHLEVBQzNDLFdBQVcsQ0FDWixDQUFDO0FBQ0YsZ0JBQWMsR0FBRztBQUNmLGFBQVMsRUFBVCxTQUFTO0FBQ1QsV0FBTyxFQUFFLFdBQVc7R0FDckIsQ0FBQztBQUNGLFdBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNyQixrQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFNUIsTUFBTSxtQkFBbUIsR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDLFlBQU07QUFDekQsWUFBUSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzdDLGFBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUN2Qix1QkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5Qiw2QkFBVSxhQUFhLENBQUMsQ0FBQztBQUN6QixpQkFBYSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQzFDLGtCQUFjLEdBQUcsSUFBSSxDQUFDO0dBQ3ZCLENBQUMsQ0FBQzs7QUFFSCwyQkFBVSxhQUFhLENBQUMsQ0FBQztBQUN6QixlQUFhLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7O2tCQUV2QixPQUFPLENBQUMsaUJBQWlCLENBQUM7O01BQW5DLEtBQUssYUFBTCxLQUFLOztBQUNaLE9BQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOztBQUV4QixTQUFPLFdBQVcsQ0FBQztDQUNwQjs7QUFFRCxTQUFTLGdCQUFnQixHQUFzQjtBQUM3QyxNQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2xCLFFBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2pELGlCQUFhLEdBQUcsSUFBSSxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDL0MsNkJBQVUsYUFBYSxDQUFDLENBQUM7QUFDekIsaUJBQWEsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7R0FDbEM7QUFDRCxTQUFPLGFBQWEsQ0FBQztDQUN0Qjs7QUFFRCxTQUFTLGdCQUFnQixDQUFDLFFBQWdCLEVBQVE7QUFDaEQsTUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUU7O0FBRXRDLFdBQU87R0FDUjtBQUNELGVBQWEsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDdEM7O0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxTQUFpQixFQUFXO2tCQUNwQyxPQUFPLENBQUMsa0JBQWtCLENBQUM7O01BQXZDLFFBQVEsYUFBUixRQUFROztrQkFDSyxPQUFPLENBQUMsTUFBTSxDQUFDOztNQUE1QixTQUFTLGFBQVQsU0FBUzs7QUFDaEIsU0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLFNBQVMsRUFBSTtBQUNyRCxRQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDMUMsUUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQUU7QUFDeEMsYUFBTyxLQUFLLENBQUM7S0FDZDs7QUFFRCxRQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLFlBQVksU0FBUyxFQUFFO0FBQ3pELGFBQU8sS0FBSyxDQUFDO0tBQ2Q7QUFDRCxXQUFPLElBQUksQ0FBQztHQUNiLENBQUMsQ0FBQztDQUNKOztBQUVELFNBQVMsa0JBQWtCLENBQUMsY0FBMkIsRUFBRSxLQUFhLEVBQVE7QUFDNUUsTUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQ3ZCLHNCQUFrQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEQsc0JBQWtCLENBQUMsU0FBUyxHQUFHLGlCQUFpQixDQUFDO0FBQ2pELGtCQUFjLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLENBQUM7R0FDaEQ7QUFDRCxNQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7QUFDYixrQkFBYyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztHQUNoRCxNQUFNO0FBQ0wsa0JBQWMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7R0FDbkQ7O2tCQUlHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7TUFGM0IsS0FBSyxhQUFMLEtBQUs7TUFDTCxRQUFRLGFBQVIsUUFBUTs7QUFFVixNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQzNELFVBQVEsQ0FBQyxNQUFNLENBQUMsb0JBQUMsa0JBQWtCLElBQUMsS0FBSyxFQUFFLEtBQUssQUFBQyxHQUFHLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztDQUMzRTs7QUFFRCxNQUFNLENBQUMsT0FBTywyQkFBRzs7QUFFZixVQUFRLEVBQUEsa0JBQUMsS0FBVyxFQUFRO0FBQzFCLGlCQUFhLEdBQUcsK0JBQXlCLENBQUM7O0FBRTFDLGlCQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNqQyxnQkFBZ0IsRUFDaEIsd0JBQXdCLEVBQ3hCO2FBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7S0FBQSxDQUNqRCxDQUFDLENBQUM7O0FBRUgsaUJBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ2pDLGtCQUFrQixFQUNsQix3QkFBd0IsRUFDeEIsWUFBTTtBQUNKLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUNwRCxVQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsZUFBTyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsQ0FBQztPQUNqRTtBQUNELFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUEsQUFBQyxDQUFDLENBQUM7S0FDdkUsQ0FDRixDQUFDLENBQUM7OztBQUdILGlCQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNqQyxtQkFBbUIsRUFDbkIsb0NBQW9DLEVBQ3BDLFlBQU07QUFDSixVQUFNLFNBQVMsR0FBRyxnQkFBZ0IsRUFBRSxDQUFDOzswQ0FDbEIsU0FBUyxDQUFDLGtCQUFrQixFQUFFOztVQUExQyxRQUFRLGlDQUFSLFFBQVE7O0FBQ2YsVUFBSSxRQUFRLElBQUksSUFBSSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7QUFDdkMsWUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDL0I7S0FDRixDQUNGLENBQUMsQ0FBQzs7O0FBR0gsaUJBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ2pDLGtDQUFrQyxFQUNsQyxnQ0FBZ0MsRUFDaEMsVUFBQSxLQUFLLEVBQUk7QUFDUCxVQUFNLFFBQVEsR0FBRywyQ0FBK0IsS0FBSyxDQUFDLENBQUM7QUFDdkQsVUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksUUFBUSxJQUFJLEVBQUUsQ0FBQSxBQUFDLENBQUMsQ0FBQztLQUMvRCxDQUNGLENBQUMsQ0FBQztBQUNILGlCQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDO0FBQ3JDLHdDQUFrQyxFQUFFLENBQ2xDLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBQyxFQUNuQjtBQUNFLGFBQUssRUFBRSxtQkFBbUI7QUFDMUIsZUFBTyxFQUFFLGdDQUFnQztPQUMxQyxFQUNELEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBQyxDQUNwQjtLQUNGLENBQUMsQ0FBQyxDQUFDOzs7QUFHSixpQkFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDakMsOENBQThDLEVBQzlDLGdDQUFnQyxFQUNoQyxVQUFBLEtBQUssRUFBSTtBQUNQLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDNUMsQ0FDRixDQUFDLENBQUM7QUFDSCxpQkFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQztBQUNyQyxvREFBOEMsRUFBRSxDQUM5QyxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUMsRUFDbkI7QUFDRSxhQUFLLEVBQUUsbUJBQW1CO0FBQzFCLGVBQU8sRUFBRSxnQ0FBZ0M7T0FDMUMsRUFDRCxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUMsQ0FDcEI7S0FDRixDQUFDLENBQUMsQ0FBQzs7O0FBR0osaUJBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDaEQsVUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLEVBQUU7QUFDekMsZUFBTyxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO09BQzVEO0tBQ0YsQ0FBQyxDQUFDLENBQUM7O0FBRUosUUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUU7QUFDbkMsYUFBTztLQUNSOzs7QUFHRCxpQkFBYSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0IsNEJBQTRCLENBQUMsWUFBTTtBQUNuRSwrQkFBVSxLQUFLLENBQUMsQ0FBQztVQUNWLGNBQWMsR0FBSSxLQUFLLENBQXZCLGNBQWM7OztBQUdyQixVQUFJLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxFQUFFO0FBQ3ZDLFlBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGNBQWMsQ0FBQyxDQUFDO0FBQzVELGVBQU87T0FDUjs7O0FBR0QsVUFBTSx1QkFBdUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDO2VBQU0sVUFBVSxDQUFDLFlBQU07OztBQUduRixjQUFJO0FBQ0YsZ0JBQUksbUJBQW1CLENBQUMsY0FBYyxDQUFDLEVBQUU7QUFDdkMsa0JBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGNBQWMsQ0FBQyxDQUFDO0FBQzVELHFDQUF1QixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xDLHVDQUFVLGFBQWEsQ0FBQyxDQUFDO0FBQ3pCLDJCQUFhLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUM7YUFDL0M7V0FDRixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YscUJBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsQ0FBQztXQUNoRDtTQUNGLEVBQUUsRUFBRSxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQ1IsK0JBQVUsYUFBYSxDQUFDLENBQUM7QUFDekIsbUJBQWEsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztLQUM1QyxDQUFDLENBQUMsQ0FBQztHQUNMOztBQUVELGdCQUFjLEVBQUEsd0JBQUMsVUFBcUMsRUFBUTtBQUMxRCxXQUFPLEdBQUcsVUFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDMUMsUUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUMvQixVQUFJLEVBQUUsWUFBWTtBQUNsQixjQUFRLEVBQUUsd0JBQXdCO0FBQ2xDLGFBQU8sRUFBRSxnQkFBZ0I7QUFDekIsY0FBUSxFQUFFLEdBQUc7S0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDTixRQUFNLFNBQVMsR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3JDLHNCQUFrQixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkUsNkJBQVUsYUFBYSxDQUFDLENBQUM7QUFDekIsaUJBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFlBQU07QUFDakQsd0JBQWtCLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN4RSxDQUFDLENBQUMsQ0FBQztHQUNMOztBQUVELGtCQUFnQixFQUFBLDRCQUFrQjtvQkFDaEIsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztRQUFsQyxLQUFLLGFBQUwsS0FBSzs7QUFDWixXQUFPO0FBQ0wsYUFBTyxFQUFFO0FBQ1AsYUFBSyxFQUFFLFdBQVc7QUFDbEIsWUFBSSxFQUFFLFlBQVk7QUFDbEIsbUJBQVcsRUFDVDs7OztVQUVFOzs7O1dBQW9COztTQUNmLEFBQ1I7QUFDRCxlQUFPLEVBQUUsd0JBQXdCO09BQ2xDO0FBQ0QsY0FBUSxFQUFFLENBQUM7S0FDWixDQUFDO0dBQ0g7O0FBRUQsV0FBUyxFQUFBLHFCQUFZO0FBQ25CLFFBQUksQ0FBQyxjQUFjLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDckMsYUFBTyxFQUFFLENBQUM7S0FDWDs7NENBQ2tCLGFBQWEsQ0FBQyxrQkFBa0IsRUFBRTs7UUFBOUMsUUFBUSxxQ0FBUixRQUFROztBQUNmLFdBQU87QUFDTCxvQkFBYyxFQUFFLFFBQVE7S0FDekIsQ0FBQztHQUNIOztBQUVELFlBQVUsRUFBQSxzQkFBUztBQUNqQixlQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLFFBQUksYUFBYSxJQUFJLElBQUksRUFBRTtBQUN6QixtQkFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3hCLG1CQUFhLEdBQUcsSUFBSSxDQUFDO0tBQ3RCO0FBQ0QsUUFBSSxhQUFhLElBQUksSUFBSSxFQUFFO0FBQ3pCLG1CQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDeEIsbUJBQWEsR0FBRyxJQUFJLENBQUM7S0FDdEI7QUFDRCxrQkFBYyxHQUFHLElBQUksQ0FBQztBQUN0QixRQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7QUFDbkIsYUFBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3RCLGFBQU8sR0FBRyxJQUFJLENBQUM7S0FDaEI7R0FDRjs7Ozs7Ozs7OztBQVVELGlCQUFlLEVBQUEseUJBQUMsUUFBZ0IsRUFBRTs7O0FBR2hDLFdBQU87R0FDUjs7Q0FLRjtBQUhLLGdCQUFjO1NBQUEsZUFBRztBQUNuQixhQUFPLGNBQWMsQ0FBQztLQUN2Qjs7OztFQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIb21lRnJhZ21lbnRzfSBmcm9tICcuLi8uLi9ob21lLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbFR5cGUgZnJvbSAnLi9EaWZmVmlld01vZGVsJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBudWNsaWRlRmVhdHVyZXMgZnJvbSAnLi4vLi4vLi4vLi4vbGliL251Y2xpZGVGZWF0dXJlcyc7XG5pbXBvcnQge2dldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudH0gZnJvbSAnLi91dGlscyc7XG5cbmxldCBkaWZmVmlld01vZGVsOiA/RGlmZlZpZXdNb2RlbFR5cGUgPSBudWxsO1xubGV0IGFjdGl2ZURpZmZWaWV3OiA/e1xuICBjb21wb25lbnQ6IFJlYWN0Q29tcG9uZW50O1xuICBlbGVtZW50OiBIVE1MRWxlbWVudDtcbn0gID0gbnVsbDtcblxuLy8gVGhpcyB1cmwgc3R5bGUgaXMgdGhlIG9uZSBBdG9tIHVzZXMgZm9yIHRoZSB3ZWxjb21lIGFuZCBzZXR0aW5ncyBwYWdlcy5cbmNvbnN0IE5VQ0xJREVfRElGRl9WSUVXX1VSSSA9ICdhdG9tOi8vbnVjbGlkZS9kaWZmLXZpZXcnO1xuY29uc3QgdWlQcm92aWRlcnMgPSBbXTtcblxubGV0IHN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlID0gbnVsbDtcbmxldCB0b29sQmFyOiA/YW55ID0gbnVsbDtcbmxldCBjaGFuZ2VDb3VudEVsZW1lbnQ6ID9IVE1MRWxlbWVudCA9IG51bGw7XG5sZXQgbG9nZ2VyID0gbnVsbDtcblxuZnVuY3Rpb24gZ2V0TG9nZ2VyKCkge1xuICByZXR1cm4gbG9nZ2VyIHx8IChsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCkpO1xufVxuXG4vLyBUbyBhZGQgYSBWaWV3IGFzIGFuIEF0b20gd29ya3NwYWNlIHBhbmUsIHdlIHJldHVybiBgRGlmZlZpZXdFbGVtZW50YCB3aGljaCBleHRlbmRzIGBIVE1MRWxlbWVudGAuXG4vLyBUaGlzIHBhdHRldG4gaXMgYWxzbyBmb2xsb3dlZCB3aXRoIGF0b20ncyBUZXh0RWRpdG9yLlxuZnVuY3Rpb24gY3JlYXRlVmlldyhlbnRyeVBhdGg6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgaWYgKGFjdGl2ZURpZmZWaWV3KSB7XG4gICAgYWN0aXZhdGVGaWxlUGF0aChlbnRyeVBhdGgpO1xuICAgIHJldHVybiBhY3RpdmVEaWZmVmlldy5lbGVtZW50O1xuICB9XG5cbiAgY29uc3Qge1xuICAgIFJlYWN0LFxuICAgIFJlYWN0RE9NLFxuICB9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbiAgY29uc3QgRGlmZlZpZXdFbGVtZW50ID0gcmVxdWlyZSgnLi9EaWZmVmlld0VsZW1lbnQnKTtcbiAgY29uc3QgRGlmZlZpZXdDb21wb25lbnQgPSByZXF1aXJlKCcuL0RpZmZWaWV3Q29tcG9uZW50Jyk7XG5cbiAgY29uc3QgZGlmZk1vZGVsID0gZ2V0RGlmZlZpZXdNb2RlbCgpO1xuICBjb25zdCBob3N0RWxlbWVudCA9IG5ldyBEaWZmVmlld0VsZW1lbnQoKS5pbml0aWFsaXplKGRpZmZNb2RlbCwgTlVDTElERV9ESUZGX1ZJRVdfVVJJKTtcbiAgY29uc3QgY29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgIDxEaWZmVmlld0NvbXBvbmVudCBkaWZmTW9kZWw9e2RpZmZNb2RlbH0gLz4sXG4gICAgaG9zdEVsZW1lbnQsXG4gICk7XG4gIGFjdGl2ZURpZmZWaWV3ID0ge1xuICAgIGNvbXBvbmVudCxcbiAgICBlbGVtZW50OiBob3N0RWxlbWVudCxcbiAgfTtcbiAgZGlmZk1vZGVsLmFjdGl2YXRlKCk7XG4gIGFjdGl2YXRlRmlsZVBhdGgoZW50cnlQYXRoKTtcblxuICBjb25zdCBkZXN0cm95U3Vic2NyaXB0aW9uID0gaG9zdEVsZW1lbnQub25EaWREZXN0cm95KCgpID0+IHtcbiAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKGhvc3RFbGVtZW50KTtcbiAgICBkaWZmTW9kZWwuZGVhY3RpdmF0ZSgpO1xuICAgIGRlc3Ryb3lTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICBzdWJzY3JpcHRpb25zLnJlbW92ZShkZXN0cm95U3Vic2NyaXB0aW9uKTtcbiAgICBhY3RpdmVEaWZmVmlldyA9IG51bGw7XG4gIH0pO1xuXG4gIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgc3Vic2NyaXB0aW9ucy5hZGQoZGVzdHJveVN1YnNjcmlwdGlvbik7XG5cbiAgY29uc3Qge3RyYWNrfSA9IHJlcXVpcmUoJy4uLy4uL2FuYWx5dGljcycpO1xuICB0cmFjaygnZGlmZi12aWV3LW9wZW4nKTtcblxuICByZXR1cm4gaG9zdEVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGdldERpZmZWaWV3TW9kZWwoKTogRGlmZlZpZXdNb2RlbFR5cGUge1xuICBpZiAoIWRpZmZWaWV3TW9kZWwpIHtcbiAgICBjb25zdCBEaWZmVmlld01vZGVsID0gcmVxdWlyZSgnLi9EaWZmVmlld01vZGVsJyk7XG4gICAgZGlmZlZpZXdNb2RlbCA9IG5ldyBEaWZmVmlld01vZGVsKHVpUHJvdmlkZXJzKTtcbiAgICBpbnZhcmlhbnQoc3Vic2NyaXB0aW9ucyk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoZGlmZlZpZXdNb2RlbCk7XG4gIH1cbiAgcmV0dXJuIGRpZmZWaWV3TW9kZWw7XG59XG5cbmZ1bmN0aW9uIGFjdGl2YXRlRmlsZVBhdGgoZmlsZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICBpZiAoIWZpbGVQYXRoLmxlbmd0aCB8fCAhZGlmZlZpZXdNb2RlbCkge1xuICAgIC8vIFRoZSBEaWZmIFZpZXcgY291bGQgYmUgb3BlbmVkIHdpdGggbm8gcGF0aCBhdCBhbGwuXG4gICAgcmV0dXJuO1xuICB9XG4gIGRpZmZWaWV3TW9kZWwuYWN0aXZhdGVGaWxlKGZpbGVQYXRoKTtcbn1cblxuZnVuY3Rpb24gcHJvamVjdHNDb250YWluUGF0aChjaGVja1BhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCB7aXNSZW1vdGV9ID0gcmVxdWlyZSgnLi4vLi4vcmVtb3RlLXVyaScpO1xuICBjb25zdCB7RGlyZWN0b3J5fSA9IHJlcXVpcmUoJ2F0b20nKTtcbiAgcmV0dXJuIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLnNvbWUoZGlyZWN0b3J5ID0+IHtcbiAgICBjb25zdCBkaXJlY3RvcnlQYXRoID0gZGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgICBpZiAoIWNoZWNrUGF0aC5zdGFydHNXaXRoKGRpcmVjdG9yeVBhdGgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIElmIHRoZSByZW1vdGUgZGlyZWN0b3J5IGhhc24ndCB5ZXQgbG9hZGVkLlxuICAgIGlmIChpc1JlbW90ZShjaGVja1BhdGgpICYmIGRpcmVjdG9yeSBpbnN0YW5jZW9mIERpcmVjdG9yeSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVRvb2xiYXJDb3VudChkaWZmVmlld0J1dHRvbjogSFRNTEVsZW1lbnQsIGNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgaWYgKCFjaGFuZ2VDb3VudEVsZW1lbnQpIHtcbiAgICBjaGFuZ2VDb3VudEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgY2hhbmdlQ291bnRFbGVtZW50LmNsYXNzTmFtZSA9ICdkaWZmLXZpZXctY291bnQnO1xuICAgIGRpZmZWaWV3QnV0dG9uLmFwcGVuZENoaWxkKGNoYW5nZUNvdW50RWxlbWVudCk7XG4gIH1cbiAgaWYgKGNvdW50ID4gMCkge1xuICAgIGRpZmZWaWV3QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3Bvc2l0aXZlLWNvdW50Jyk7XG4gIH0gZWxzZSB7XG4gICAgZGlmZlZpZXdCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgncG9zaXRpdmUtY291bnQnKTtcbiAgfVxuICBjb25zdCB7XG4gICAgUmVhY3QsXG4gICAgUmVhY3RET00sXG4gIH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuICBjb25zdCBEaWZmQ291bnRDb21wb25lbnQgPSByZXF1aXJlKCcuL0RpZmZDb3VudENvbXBvbmVudCcpO1xuICBSZWFjdERPTS5yZW5kZXIoPERpZmZDb3VudENvbXBvbmVudCBjb3VudD17Y291bnR9IC8+LCBjaGFuZ2VDb3VudEVsZW1lbnQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhY3RpdmF0ZShzdGF0ZTogP2FueSk6IHZvaWQge1xuICAgIHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIC8vIExpc3RlbiBmb3IgbWVudSBpdGVtIHdvcmtzcGFjZSBkaWZmIHZpZXcgb3BlbiBjb21tYW5kLlxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdudWNsaWRlLWRpZmYtdmlldzpvcGVuJyxcbiAgICAgICgpID0+IGF0b20ud29ya3NwYWNlLm9wZW4oTlVDTElERV9ESUZGX1ZJRVdfVVJJKVxuICAgICkpO1xuICAgIC8vIExpc3RlbiBmb3IgaW4tZWRpdG9yIGNvbnRleHQgbWVudSBpdGVtIGRpZmYgdmlldyBvcGVuIGNvbW1hbmQuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgICAnbnVjbGlkZS1kaWZmLXZpZXc6b3BlbicsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgICAgaWYgKCFlZGl0b3IpIHtcbiAgICAgICAgICByZXR1cm4gZ2V0TG9nZ2VyKCkud2FybignTm8gYWN0aXZlIHRleHQgZWRpdG9yIGZvciBkaWZmIHZpZXchJyk7XG4gICAgICAgIH1cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihOVUNMSURFX0RJRkZfVklFV19VUkkgKyAoZWRpdG9yLmdldFBhdGgoKSB8fCAnJykpO1xuICAgICAgfVxuICAgICkpO1xuXG4gICAgLy8gTGlzdGVuIGZvciBzd2l0Y2hpbmcgdG8gZWRpdG9yIG1vZGUgZm9yIHRoZSBhY3RpdmUgZmlsZS5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICdudWNsaWRlLWRpZmYtdmlldycsXG4gICAgICAnbnVjbGlkZS1kaWZmLXZpZXc6c3dpdGNoLXRvLWVkaXRvcicsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpZmZNb2RlbCA9IGdldERpZmZWaWV3TW9kZWwoKTtcbiAgICAgICAgY29uc3Qge2ZpbGVQYXRofSA9IGRpZmZNb2RlbC5nZXRBY3RpdmVGaWxlU3RhdGUoKTtcbiAgICAgICAgaWYgKGZpbGVQYXRoICE9IG51bGwgJiYgZmlsZVBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApKTtcblxuICAgIC8vIExpc3RlbiBmb3IgZmlsZSB0cmVlIGNvbnRleHQgbWVudSBmaWxlIGl0ZW0gZXZlbnRzIHRvIG9wZW4gdGhlIGRpZmYgdmlldy5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICcudHJlZS12aWV3IC5lbnRyeS5maWxlLmxpc3QtaXRlbScsXG4gICAgICAnbnVjbGlkZS1kaWZmLXZpZXc6b3Blbi1jb250ZXh0JyxcbiAgICAgIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBnZXRGaWxlVHJlZVBhdGhGcm9tVGFyZ2V0RXZlbnQoZXZlbnQpO1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKE5VQ0xJREVfRElGRl9WSUVXX1VSSSArIChmaWxlUGF0aCB8fCAnJykpO1xuICAgICAgfVxuICAgICkpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29udGV4dE1lbnUuYWRkKHtcbiAgICAgICcudHJlZS12aWV3IC5lbnRyeS5maWxlLmxpc3QtaXRlbSc6IFtcbiAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBEaWZmIFZpZXcnLFxuICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWRpZmYtdmlldzpvcGVuLWNvbnRleHQnLFxuICAgICAgICB9LFxuICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgXSxcbiAgICB9KSk7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIGZpbGUgdHJlZSBjb250ZXh0IG1lbnUgZGlyZWN0b3J5IGl0ZW0gZXZlbnRzIHRvIG9wZW4gdGhlIGRpZmYgdmlldy5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICcudHJlZS12aWV3IC5lbnRyeS5kaXJlY3RvcnkubGlzdC1uZXN0ZWQtaXRlbScsXG4gICAgICAnbnVjbGlkZS1kaWZmLXZpZXc6b3Blbi1jb250ZXh0JyxcbiAgICAgIGV2ZW50ID0+IHtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihOVUNMSURFX0RJRkZfVklFV19VUkkpO1xuICAgICAgfVxuICAgICkpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29udGV4dE1lbnUuYWRkKHtcbiAgICAgICcudHJlZS12aWV3IC5lbnRyeS5kaXJlY3RvcnkubGlzdC1uZXN0ZWQtaXRlbSc6IFtcbiAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBEaWZmIFZpZXcnLFxuICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWRpZmYtdmlldzpvcGVuLWNvbnRleHQnLFxuICAgICAgICB9LFxuICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgXSxcbiAgICB9KSk7XG5cbiAgICAvLyBUaGUgRGlmZiBWaWV3IHdpbGwgb3BlbiBpdHMgbWFpbiBVSSBpbiBhIHRhYiwgbGlrZSBBdG9tJ3MgcHJlZmVyZW5jZXMgYW5kIHdlbGNvbWUgcGFnZXMuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKHVyaSA9PiB7XG4gICAgICBpZiAodXJpLnN0YXJ0c1dpdGgoTlVDTElERV9ESUZGX1ZJRVdfVVJJKSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlVmlldyh1cmkuc2xpY2UoTlVDTElERV9ESUZGX1ZJRVdfVVJJLmxlbmd0aCkpO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIGlmICghc3RhdGUgfHwgIXN0YXRlLmFjdGl2ZUZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gV2FpdCBmb3IgYWxsIHNvdXJjZSBjb250cm9sIHByb3ZpZGVycyB0byByZWdpc3Rlci5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChudWNsaWRlRmVhdHVyZXMub25EaWRBY3RpdmF0ZUluaXRpYWxGZWF0dXJlcygoKSA9PiB7XG4gICAgICBpbnZhcmlhbnQoc3RhdGUpO1xuICAgICAgY29uc3Qge2FjdGl2ZUZpbGVQYXRofSA9IHN0YXRlO1xuXG4gICAgICAvLyBJZiBpdCdzIGEgbG9jYWwgZGlyZWN0b3J5LCBpdCBtdXN0IGJlIGxvYWRlZCB3aXRoIHBhY2thZ2VzIGFjdGl2YXRpb24uXG4gICAgICBpZiAocHJvamVjdHNDb250YWluUGF0aChhY3RpdmVGaWxlUGF0aCkpIHtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihOVUNMSURFX0RJRkZfVklFV19VUkkgKyBhY3RpdmVGaWxlUGF0aCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIElmIGl0J3MgYSByZW1vdGUgZGlyZWN0b3J5LCBpdCBzaG91bGQgY29tZSBvbiBhIHBhdGggY2hhbmdlIGV2ZW50LlxuICAgICAgLy8gVGhlIGNoYW5nZSBoYW5kbGVyIGlzIGRlbGF5ZWQgdG8gYnJlYWsgdGhlIHJhY2Ugd2l0aCB0aGUgYERpZmZWaWV3TW9kZWxgIHN1YnNjcmlwdGlvbi5cbiAgICAgIGNvbnN0IGNoYW5nZVBhdGhzU3Vic2NyaXB0aW9uID0gYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT4gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vIHRyeS9jYXRjaCBoZXJlIGJlY2F1c2UgaW4gY2FzZSBvZiBhbnkgZXJyb3IsIEF0b20gc3RvcHMgZGlzcGF0Y2hpbmcgZXZlbnRzIHRvIHRoZVxuICAgICAgICAvLyByZXN0IG9mIHRoZSBsaXN0ZW5lcnMsIHdoaWNoIGNhbiBzdG9wIHRoZSByZW1vdGUgZWRpdGluZyBmcm9tIGJlaW5nIGZ1bmN0aW9uYWwuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKHByb2plY3RzQ29udGFpblBhdGgoYWN0aXZlRmlsZVBhdGgpKSB7XG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKE5VQ0xJREVfRElGRl9WSUVXX1VSSSArIGFjdGl2ZUZpbGVQYXRoKTtcbiAgICAgICAgICAgIGNoYW5nZVBhdGhzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbnMucmVtb3ZlKGNoYW5nZVBhdGhzU3Vic2NyaXB0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBnZXRMb2dnZXIoKS5lcnJvcignRGlmZlZpZXcgcmVzdG9yZSBlcnJvcicsIGUpO1xuICAgICAgICB9XG4gICAgICB9LCAxMCkpO1xuICAgICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQoY2hhbmdlUGF0aHNTdWJzY3JpcHRpb24pO1xuICAgIH0pKTtcbiAgfSxcblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgdG9vbEJhciA9IGdldFRvb2xCYXIoJ251Y2xpZGUtZGlmZi12aWV3Jyk7XG4gICAgY29uc3QgYnV0dG9uID0gdG9vbEJhci5hZGRCdXR0b24oe1xuICAgICAgaWNvbjogJ2dpdC1icmFuY2gnLFxuICAgICAgY2FsbGJhY2s6ICdudWNsaWRlLWRpZmYtdmlldzpvcGVuJyxcbiAgICAgIHRvb2x0aXA6ICdPcGVuIERpZmYgVmlldycsXG4gICAgICBwcmlvcml0eTogMzAwLFxuICAgIH0pWzBdO1xuICAgIGNvbnN0IGRpZmZNb2RlbCA9IGdldERpZmZWaWV3TW9kZWwoKTtcbiAgICB1cGRhdGVUb29sYmFyQ291bnQoYnV0dG9uLCBkaWZmTW9kZWwuZ2V0U3RhdGUoKS5kaXJ0eUZpbGVDaGFuZ2VzLnNpemUpO1xuICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChkaWZmTW9kZWwub25EaWRVcGRhdGVTdGF0ZSgoKSA9PiB7XG4gICAgICB1cGRhdGVUb29sYmFyQ291bnQoYnV0dG9uLCBkaWZmTW9kZWwuZ2V0U3RhdGUoKS5kaXJ0eUZpbGVDaGFuZ2VzLnNpemUpO1xuICAgIH0pKTtcbiAgfSxcblxuICBnZXRIb21lRnJhZ21lbnRzKCk6IEhvbWVGcmFnbWVudHMge1xuICAgIGNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuICAgIHJldHVybiB7XG4gICAgICBmZWF0dXJlOiB7XG4gICAgICAgIHRpdGxlOiAnRGlmZiBWaWV3JyxcbiAgICAgICAgaWNvbjogJ2dpdC1icmFuY2gnLFxuICAgICAgICBkZXNjcmlwdGlvbjogKFxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgTGF1bmNoZXMgYW4gZWRpdGFibGUgc2lkZS1ieS1zaWRlIHZpZXcgb2YgdGhlIG91dHB1dCBvZiB0aGUgTWVyY3VyaWFsXG4gICAgICAgICAgICA8Y29kZT5oZyBkaWZmPC9jb2RlPiBjb21tYW5kLCBzaG93aW5nIHBlbmRpbmcgY2hhbmdlcyB0byBiZSBjb21taXR0ZWQuXG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICApLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXZpZXc6b3BlbicsXG4gICAgICB9LFxuICAgICAgcHJpb3JpdHk6IDMsXG4gICAgfTtcbiAgfSxcblxuICBzZXJpYWxpemUoKTogP09iamVjdCB7XG4gICAgaWYgKCFhY3RpdmVEaWZmVmlldyB8fCAhZGlmZlZpZXdNb2RlbCkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gZGlmZlZpZXdNb2RlbC5nZXRBY3RpdmVGaWxlU3RhdGUoKTtcbiAgICByZXR1cm4ge1xuICAgICAgYWN0aXZlRmlsZVBhdGg6IGZpbGVQYXRoLFxuICAgIH07XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB1aVByb3ZpZGVycy5zcGxpY2UoMCk7XG4gICAgaWYgKHN1YnNjcmlwdGlvbnMgIT0gbnVsbCkge1xuICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICBzdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKGRpZmZWaWV3TW9kZWwgIT0gbnVsbCkge1xuICAgICAgZGlmZlZpZXdNb2RlbC5kaXNwb3NlKCk7XG4gICAgICBkaWZmVmlld01vZGVsID0gbnVsbDtcbiAgICB9XG4gICAgYWN0aXZlRGlmZlZpZXcgPSBudWxsO1xuICAgIGlmICh0b29sQmFyICE9IG51bGwpIHtcbiAgICAgIHRvb2xCYXIucmVtb3ZlSXRlbXMoKTtcbiAgICAgIHRvb2xCYXIgPSBudWxsO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogVGhlIGRpZmYtdmlldyBwYWNrYWdlIGNhbiBjb25zdW1lIHByb3ZpZGVycyB0aGF0IHJldHVybiBSZWFjdCBjb21wb25lbnRzIHRvXG4gICAqIGJlIHJlbmRlcmVkIGlubGluZS5cbiAgICogQSB1aVByb3ZpZGVyIG11c3QgaGF2ZSBhIG1ldGhvZCBjb21wb3NlVWlFbGVtZW50cyB3aXRoIHRoZSBmb2xsb3dpbmcgc3BlYzpcbiAgICogQHBhcmFtIGZpbGVQYXRoIFRoZSBwYXRoIG9mIHRoZSBmaWxlIHRoZSBkaWZmIHZpZXcgaXMgb3BlbmVkIGZvclxuICAgKiBAcmV0dXJuIEFuIGFycmF5IG9mIElubGluZUNvbW1lbnRzIChkZWZpbmVkIGFib3ZlKSB0byBiZSByZW5kZXJlZCBpbnRvIHRoZVxuICAgKiAgICAgICAgIGRpZmYgdmlld1xuICAgKi9cbiAgY29uc3VtZVByb3ZpZGVyKHByb3ZpZGVyOiBPYmplY3QpIHtcbiAgICAvLyBUT0RPKG1vc3QpOiBGaXggVUkgcmVuZGVyaW5nIGFuZCByZS1pbnRyb2R1Y2U6IHQ4MTc0MzMyXG4gICAgLy8gdWlQcm92aWRlcnMucHVzaChwcm92aWRlcik7XG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIGdldCBfX3Rlc3REaWZmVmlldygpIHtcbiAgICByZXR1cm4gYWN0aXZlRGlmZlZpZXc7XG4gIH0sXG59O1xuIl19