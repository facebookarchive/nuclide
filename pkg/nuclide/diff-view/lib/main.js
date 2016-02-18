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

module.exports = {

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
    updateToolbarCount(button, diffModel.getDirtyFileChanges().size);
    (0, _assert2['default'])(subscriptions);
    subscriptions.add(diffModel.onDidChangeDirtyStatus(function (dirtyFileChanges) {
      updateToolbarCount(button, dirtyFileChanges.size);
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
};
//# sourceMappingURL=data:application/json;base64,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QU87R0FDUjtDQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIb21lRnJhZ21lbnRzfSBmcm9tICcuLi8uLi9ob21lLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbFR5cGUgZnJvbSAnLi9EaWZmVmlld01vZGVsJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBudWNsaWRlRmVhdHVyZXMgZnJvbSAnLi4vLi4vLi4vLi4vbGliL251Y2xpZGVGZWF0dXJlcyc7XG5pbXBvcnQge2dldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudH0gZnJvbSAnLi91dGlscyc7XG5cbmxldCBkaWZmVmlld01vZGVsOiA/RGlmZlZpZXdNb2RlbFR5cGUgPSBudWxsO1xubGV0IGFjdGl2ZURpZmZWaWV3OiA/e1xuICBjb21wb25lbnQ6IFJlYWN0Q29tcG9uZW50LFxuICBlbGVtZW50OiBIVE1MRWxlbWVudCxcbn0gID0gbnVsbDtcblxuLy8gVGhpcyB1cmwgc3R5bGUgaXMgdGhlIG9uZSBBdG9tIHVzZXMgZm9yIHRoZSB3ZWxjb21lIGFuZCBzZXR0aW5ncyBwYWdlcy5cbmNvbnN0IE5VQ0xJREVfRElGRl9WSUVXX1VSSSA9ICdhdG9tOi8vbnVjbGlkZS9kaWZmLXZpZXcnO1xuY29uc3QgdWlQcm92aWRlcnMgPSBbXTtcblxubGV0IHN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlID0gbnVsbDtcbmxldCB0b29sQmFyOiA/YW55ID0gbnVsbDtcbmxldCBjaGFuZ2VDb3VudEVsZW1lbnQ6ID9IVE1MRWxlbWVudCA9IG51bGw7XG5sZXQgbG9nZ2VyID0gbnVsbDtcblxuZnVuY3Rpb24gZ2V0TG9nZ2VyKCkge1xuICByZXR1cm4gbG9nZ2VyIHx8IChsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCkpO1xufVxuXG4vLyBUbyBhZGQgYSBWaWV3IGFzIGFuIEF0b20gd29ya3NwYWNlIHBhbmUsIHdlIHJldHVybiBgRGlmZlZpZXdFbGVtZW50YCB3aGljaCBleHRlbmRzIGBIVE1MRWxlbWVudGAuXG4vLyBUaGlzIHBhdHRldG4gaXMgYWxzbyBmb2xsb3dlZCB3aXRoIGF0b20ncyBUZXh0RWRpdG9yLlxuZnVuY3Rpb24gY3JlYXRlVmlldyhlbnRyeVBhdGg6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgaWYgKGFjdGl2ZURpZmZWaWV3KSB7XG4gICAgYWN0aXZhdGVGaWxlUGF0aChlbnRyeVBhdGgpO1xuICAgIHJldHVybiBhY3RpdmVEaWZmVmlldy5lbGVtZW50O1xuICB9XG5cbiAgY29uc3Qge1xuICAgIFJlYWN0LFxuICAgIFJlYWN0RE9NLFxuICB9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbiAgY29uc3QgRGlmZlZpZXdFbGVtZW50ID0gcmVxdWlyZSgnLi9EaWZmVmlld0VsZW1lbnQnKTtcbiAgY29uc3QgRGlmZlZpZXdDb21wb25lbnQgPSByZXF1aXJlKCcuL0RpZmZWaWV3Q29tcG9uZW50Jyk7XG5cbiAgY29uc3QgZGlmZk1vZGVsID0gZ2V0RGlmZlZpZXdNb2RlbCgpO1xuICBjb25zdCBob3N0RWxlbWVudCA9IG5ldyBEaWZmVmlld0VsZW1lbnQoKS5pbml0aWFsaXplKGRpZmZNb2RlbCwgTlVDTElERV9ESUZGX1ZJRVdfVVJJKTtcbiAgY29uc3QgY29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgIDxEaWZmVmlld0NvbXBvbmVudCBkaWZmTW9kZWw9e2RpZmZNb2RlbH0vPixcbiAgICBob3N0RWxlbWVudCxcbiAgKTtcbiAgYWN0aXZlRGlmZlZpZXcgPSB7XG4gICAgY29tcG9uZW50LFxuICAgIGVsZW1lbnQ6IGhvc3RFbGVtZW50LFxuICB9O1xuICBkaWZmTW9kZWwuYWN0aXZhdGUoKTtcbiAgYWN0aXZhdGVGaWxlUGF0aChlbnRyeVBhdGgpO1xuXG4gIGNvbnN0IGRlc3Ryb3lTdWJzY3JpcHRpb24gPSBob3N0RWxlbWVudC5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoaG9zdEVsZW1lbnQpO1xuICAgIGRpZmZNb2RlbC5kZWFjdGl2YXRlKCk7XG4gICAgZGVzdHJveVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICAgIHN1YnNjcmlwdGlvbnMucmVtb3ZlKGRlc3Ryb3lTdWJzY3JpcHRpb24pO1xuICAgIGFjdGl2ZURpZmZWaWV3ID0gbnVsbDtcbiAgfSk7XG5cbiAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICBzdWJzY3JpcHRpb25zLmFkZChkZXN0cm95U3Vic2NyaXB0aW9uKTtcblxuICBjb25zdCB7dHJhY2t9ID0gcmVxdWlyZSgnLi4vLi4vYW5hbHl0aWNzJyk7XG4gIHRyYWNrKCdkaWZmLXZpZXctb3BlbicpO1xuXG4gIHJldHVybiBob3N0RWxlbWVudDtcbn1cblxuZnVuY3Rpb24gZ2V0RGlmZlZpZXdNb2RlbCgpOiBEaWZmVmlld01vZGVsVHlwZSB7XG4gIGlmICghZGlmZlZpZXdNb2RlbCkge1xuICAgIGNvbnN0IERpZmZWaWV3TW9kZWwgPSByZXF1aXJlKCcuL0RpZmZWaWV3TW9kZWwnKTtcbiAgICBkaWZmVmlld01vZGVsID0gbmV3IERpZmZWaWV3TW9kZWwodWlQcm92aWRlcnMpO1xuICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChkaWZmVmlld01vZGVsKTtcbiAgfVxuICByZXR1cm4gZGlmZlZpZXdNb2RlbDtcbn1cblxuZnVuY3Rpb24gYWN0aXZhdGVGaWxlUGF0aChmaWxlUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gIGlmICghZmlsZVBhdGgubGVuZ3RoIHx8ICFkaWZmVmlld01vZGVsKSB7XG4gICAgLy8gVGhlIERpZmYgVmlldyBjb3VsZCBiZSBvcGVuZWQgd2l0aCBubyBwYXRoIGF0IGFsbC5cbiAgICByZXR1cm47XG4gIH1cbiAgZGlmZlZpZXdNb2RlbC5hY3RpdmF0ZUZpbGUoZmlsZVBhdGgpO1xufVxuXG5mdW5jdGlvbiBwcm9qZWN0c0NvbnRhaW5QYXRoKGNoZWNrUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IHtpc1JlbW90ZX0gPSByZXF1aXJlKCcuLi8uLi9yZW1vdGUtdXJpJyk7XG4gIGNvbnN0IHtEaXJlY3Rvcnl9ID0gcmVxdWlyZSgnYXRvbScpO1xuICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCkuc29tZShkaXJlY3RvcnkgPT4ge1xuICAgIGNvbnN0IGRpcmVjdG9yeVBhdGggPSBkaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICAgIGlmICghY2hlY2tQYXRoLnN0YXJ0c1dpdGgoZGlyZWN0b3J5UGF0aCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIHJlbW90ZSBkaXJlY3RvcnkgaGFzbid0IHlldCBsb2FkZWQuXG4gICAgaWYgKGlzUmVtb3RlKGNoZWNrUGF0aCkgJiYgZGlyZWN0b3J5IGluc3RhbmNlb2YgRGlyZWN0b3J5KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlVG9vbGJhckNvdW50KGRpZmZWaWV3QnV0dG9uOiBIVE1MRWxlbWVudCwgY291bnQ6IG51bWJlcik6IHZvaWQge1xuICBpZiAoIWNoYW5nZUNvdW50RWxlbWVudCkge1xuICAgIGNoYW5nZUNvdW50RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBjaGFuZ2VDb3VudEVsZW1lbnQuY2xhc3NOYW1lID0gJ2RpZmYtdmlldy1jb3VudCc7XG4gICAgZGlmZlZpZXdCdXR0b24uYXBwZW5kQ2hpbGQoY2hhbmdlQ291bnRFbGVtZW50KTtcbiAgfVxuICBpZiAoY291bnQgPiAwKSB7XG4gICAgZGlmZlZpZXdCdXR0b24uY2xhc3NMaXN0LmFkZCgncG9zaXRpdmUtY291bnQnKTtcbiAgfSBlbHNlIHtcbiAgICBkaWZmVmlld0J1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdwb3NpdGl2ZS1jb3VudCcpO1xuICB9XG4gIGNvbnN0IHtcbiAgICBSZWFjdCxcbiAgICBSZWFjdERPTSxcbiAgfSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG4gIGNvbnN0IERpZmZDb3VudENvbXBvbmVudCA9IHJlcXVpcmUoJy4vRGlmZkNvdW50Q29tcG9uZW50Jyk7XG4gIFJlYWN0RE9NLnJlbmRlcig8RGlmZkNvdW50Q29tcG9uZW50IGNvdW50PXtjb3VudH0vPiwgY2hhbmdlQ291bnRFbGVtZW50KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYWN0aXZhdGUoc3RhdGU6ID9hbnkpOiB2b2lkIHtcbiAgICBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICAvLyBMaXN0ZW4gZm9yIG1lbnUgaXRlbSB3b3Jrc3BhY2UgZGlmZiB2aWV3IG9wZW4gY29tbWFuZC5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAnbnVjbGlkZS1kaWZmLXZpZXc6b3BlbicsXG4gICAgICAoKSA9PiBhdG9tLndvcmtzcGFjZS5vcGVuKE5VQ0xJREVfRElGRl9WSUVXX1VSSSlcbiAgICApKTtcbiAgICAvLyBMaXN0ZW4gZm9yIGluLWVkaXRvciBjb250ZXh0IG1lbnUgaXRlbSBkaWZmIHZpZXcgb3BlbiBjb21tYW5kLlxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ251Y2xpZGUtZGlmZi12aWV3Om9wZW4nLFxuICAgICAgKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgIGlmICghZWRpdG9yKSB7XG4gICAgICAgICAgcmV0dXJuIGdldExvZ2dlcigpLndhcm4oJ05vIGFjdGl2ZSB0ZXh0IGVkaXRvciBmb3IgZGlmZiB2aWV3IScpO1xuICAgICAgICB9XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oTlVDTElERV9ESUZGX1ZJRVdfVVJJICsgKGVkaXRvci5nZXRQYXRoKCkgfHwgJycpKTtcbiAgICAgIH1cbiAgICApKTtcblxuICAgIC8vIExpc3RlbiBmb3Igc3dpdGNoaW5nIHRvIGVkaXRvciBtb2RlIGZvciB0aGUgYWN0aXZlIGZpbGUuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnbnVjbGlkZS1kaWZmLXZpZXcnLFxuICAgICAgJ251Y2xpZGUtZGlmZi12aWV3OnN3aXRjaC10by1lZGl0b3InLFxuICAgICAgKCkgPT4ge1xuICAgICAgICBjb25zdCBkaWZmTW9kZWwgPSBnZXREaWZmVmlld01vZGVsKCk7XG4gICAgICAgIGNvbnN0IHtmaWxlUGF0aH0gPSBkaWZmTW9kZWwuZ2V0QWN0aXZlRmlsZVN0YXRlKCk7XG4gICAgICAgIGlmIChmaWxlUGF0aCAhPSBudWxsICYmIGZpbGVQYXRoLmxlbmd0aCkge1xuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKSk7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIGZpbGUgdHJlZSBjb250ZXh0IG1lbnUgZmlsZSBpdGVtIGV2ZW50cyB0byBvcGVuIHRoZSBkaWZmIHZpZXcuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnLnRyZWUtdmlldyAuZW50cnkuZmlsZS5saXN0LWl0ZW0nLFxuICAgICAgJ251Y2xpZGUtZGlmZi12aWV3Om9wZW4tY29udGV4dCcsXG4gICAgICBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZ2V0RmlsZVRyZWVQYXRoRnJvbVRhcmdldEV2ZW50KGV2ZW50KTtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihOVUNMSURFX0RJRkZfVklFV19VUkkgKyAoZmlsZVBhdGggfHwgJycpKTtcbiAgICAgIH1cbiAgICApKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbnRleHRNZW51LmFkZCh7XG4gICAgICAnLnRyZWUtdmlldyAuZW50cnkuZmlsZS5saXN0LWl0ZW0nOiBbXG4gICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRGlmZiBWaWV3JyxcbiAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXZpZXc6b3Blbi1jb250ZXh0JyxcbiAgICAgICAgfSxcbiAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgLy8gTGlzdGVuIGZvciBmaWxlIHRyZWUgY29udGV4dCBtZW51IGRpcmVjdG9yeSBpdGVtIGV2ZW50cyB0byBvcGVuIHRoZSBkaWZmIHZpZXcuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnLnRyZWUtdmlldyAuZW50cnkuZGlyZWN0b3J5Lmxpc3QtbmVzdGVkLWl0ZW0nLFxuICAgICAgJ251Y2xpZGUtZGlmZi12aWV3Om9wZW4tY29udGV4dCcsXG4gICAgICBldmVudCA9PiB7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oTlVDTElERV9ESUZGX1ZJRVdfVVJJKTtcbiAgICAgIH1cbiAgICApKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbnRleHRNZW51LmFkZCh7XG4gICAgICAnLnRyZWUtdmlldyAuZW50cnkuZGlyZWN0b3J5Lmxpc3QtbmVzdGVkLWl0ZW0nOiBbXG4gICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRGlmZiBWaWV3JyxcbiAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXZpZXc6b3Blbi1jb250ZXh0JyxcbiAgICAgICAgfSxcbiAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgLy8gVGhlIERpZmYgVmlldyB3aWxsIG9wZW4gaXRzIG1haW4gVUkgaW4gYSB0YWIsIGxpa2UgQXRvbSdzIHByZWZlcmVuY2VzIGFuZCB3ZWxjb21lIHBhZ2VzLlxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLmFkZE9wZW5lcih1cmkgPT4ge1xuICAgICAgaWYgKHVyaS5zdGFydHNXaXRoKE5VQ0xJREVfRElGRl9WSUVXX1VSSSkpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVZpZXcodXJpLnNsaWNlKE5VQ0xJREVfRElGRl9WSUVXX1VSSS5sZW5ndGgpKTtcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICBpZiAoIXN0YXRlIHx8ICFzdGF0ZS5hY3RpdmVGaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFdhaXQgZm9yIGFsbCBzb3VyY2UgY29udHJvbCBwcm92aWRlcnMgdG8gcmVnaXN0ZXIuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQobnVjbGlkZUZlYXR1cmVzLm9uRGlkQWN0aXZhdGVJbml0aWFsRmVhdHVyZXMoKCkgPT4ge1xuICAgICAgaW52YXJpYW50KHN0YXRlKTtcbiAgICAgIGNvbnN0IHthY3RpdmVGaWxlUGF0aH0gPSBzdGF0ZTtcblxuICAgICAgLy8gSWYgaXQncyBhIGxvY2FsIGRpcmVjdG9yeSwgaXQgbXVzdCBiZSBsb2FkZWQgd2l0aCBwYWNrYWdlcyBhY3RpdmF0aW9uLlxuICAgICAgaWYgKHByb2plY3RzQ29udGFpblBhdGgoYWN0aXZlRmlsZVBhdGgpKSB7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oTlVDTElERV9ESUZGX1ZJRVdfVVJJICsgYWN0aXZlRmlsZVBhdGgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBJZiBpdCdzIGEgcmVtb3RlIGRpcmVjdG9yeSwgaXQgc2hvdWxkIGNvbWUgb24gYSBwYXRoIGNoYW5nZSBldmVudC5cbiAgICAgIC8vIFRoZSBjaGFuZ2UgaGFuZGxlciBpcyBkZWxheWVkIHRvIGJyZWFrIHRoZSByYWNlIHdpdGggdGhlIGBEaWZmVmlld01vZGVsYCBzdWJzY3JpcHRpb24uXG4gICAgICBjb25zdCBjaGFuZ2VQYXRoc1N1YnNjcmlwdGlvbiA9IGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKCgpID0+IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAvLyB0cnkvY2F0Y2ggaGVyZSBiZWNhdXNlIGluIGNhc2Ugb2YgYW55IGVycm9yLCBBdG9tIHN0b3BzIGRpc3BhdGNoaW5nIGV2ZW50cyB0byB0aGVcbiAgICAgICAgLy8gcmVzdCBvZiB0aGUgbGlzdGVuZXJzLCB3aGljaCBjYW4gc3RvcCB0aGUgcmVtb3RlIGVkaXRpbmcgZnJvbSBiZWluZyBmdW5jdGlvbmFsLlxuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChwcm9qZWN0c0NvbnRhaW5QYXRoKGFjdGl2ZUZpbGVQYXRoKSkge1xuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihOVUNMSURFX0RJRkZfVklFV19VUkkgKyBhY3RpdmVGaWxlUGF0aCk7XG4gICAgICAgICAgICBjaGFuZ2VQYXRoc1N1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgICBpbnZhcmlhbnQoc3Vic2NyaXB0aW9ucyk7XG4gICAgICAgICAgICBzdWJzY3JpcHRpb25zLnJlbW92ZShjaGFuZ2VQYXRoc1N1YnNjcmlwdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoJ0RpZmZWaWV3IHJlc3RvcmUgZXJyb3InLCBlKTtcbiAgICAgICAgfVxuICAgICAgfSwgMTApKTtcbiAgICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKGNoYW5nZVBhdGhzU3Vic2NyaXB0aW9uKTtcbiAgICB9KSk7XG4gIH0sXG5cbiAgY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcjogKGdyb3VwOiBzdHJpbmcpID0+IE9iamVjdCk6IHZvaWQge1xuICAgIHRvb2xCYXIgPSBnZXRUb29sQmFyKCdudWNsaWRlLWRpZmYtdmlldycpO1xuICAgIGNvbnN0IGJ1dHRvbiA9IHRvb2xCYXIuYWRkQnV0dG9uKHtcbiAgICAgIGljb246ICdnaXQtYnJhbmNoJyxcbiAgICAgIGNhbGxiYWNrOiAnbnVjbGlkZS1kaWZmLXZpZXc6b3BlbicsXG4gICAgICB0b29sdGlwOiAnT3BlbiBEaWZmIFZpZXcnLFxuICAgICAgcHJpb3JpdHk6IDMwMCxcbiAgICB9KVswXTtcbiAgICBjb25zdCBkaWZmTW9kZWwgPSBnZXREaWZmVmlld01vZGVsKCk7XG4gICAgdXBkYXRlVG9vbGJhckNvdW50KGJ1dHRvbiwgZGlmZk1vZGVsLmdldERpcnR5RmlsZUNoYW5nZXMoKS5zaXplKTtcbiAgICBpbnZhcmlhbnQoc3Vic2NyaXB0aW9ucyk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoZGlmZk1vZGVsLm9uRGlkQ2hhbmdlRGlydHlTdGF0dXMoZGlydHlGaWxlQ2hhbmdlcyA9PiB7XG4gICAgICB1cGRhdGVUb29sYmFyQ291bnQoYnV0dG9uLCBkaXJ0eUZpbGVDaGFuZ2VzLnNpemUpO1xuICAgIH0pKTtcbiAgfSxcblxuICBnZXRIb21lRnJhZ21lbnRzKCk6IEhvbWVGcmFnbWVudHMge1xuICAgIGNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuICAgIHJldHVybiB7XG4gICAgICBmZWF0dXJlOiB7XG4gICAgICAgIHRpdGxlOiAnRGlmZiBWaWV3JyxcbiAgICAgICAgaWNvbjogJ2dpdC1icmFuY2gnLFxuICAgICAgICBkZXNjcmlwdGlvbjogKFxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgTGF1bmNoZXMgYW4gZWRpdGFibGUgc2lkZS1ieS1zaWRlIHZpZXcgb2YgdGhlIG91dHB1dCBvZiB0aGUgTWVyY3VyaWFsXG4gICAgICAgICAgICA8Y29kZT5oZyBkaWZmPC9jb2RlPiBjb21tYW5kLCBzaG93aW5nIHBlbmRpbmcgY2hhbmdlcyB0byBiZSBjb21taXR0ZWQuXG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICApLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXZpZXc6b3BlbicsXG4gICAgICB9LFxuICAgICAgcHJpb3JpdHk6IDMsXG4gICAgfTtcbiAgfSxcblxuICBzZXJpYWxpemUoKTogP09iamVjdCB7XG4gICAgaWYgKCFhY3RpdmVEaWZmVmlldyB8fCAhZGlmZlZpZXdNb2RlbCkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gZGlmZlZpZXdNb2RlbC5nZXRBY3RpdmVGaWxlU3RhdGUoKTtcbiAgICByZXR1cm4ge1xuICAgICAgYWN0aXZlRmlsZVBhdGg6IGZpbGVQYXRoLFxuICAgIH07XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB1aVByb3ZpZGVycy5zcGxpY2UoMCk7XG4gICAgaWYgKHN1YnNjcmlwdGlvbnMgIT0gbnVsbCkge1xuICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICBzdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKGRpZmZWaWV3TW9kZWwgIT0gbnVsbCkge1xuICAgICAgZGlmZlZpZXdNb2RlbC5kaXNwb3NlKCk7XG4gICAgICBkaWZmVmlld01vZGVsID0gbnVsbDtcbiAgICB9XG4gICAgYWN0aXZlRGlmZlZpZXcgPSBudWxsO1xuICAgIGlmICh0b29sQmFyICE9IG51bGwpIHtcbiAgICAgIHRvb2xCYXIucmVtb3ZlSXRlbXMoKTtcbiAgICAgIHRvb2xCYXIgPSBudWxsO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogVGhlIGRpZmYtdmlldyBwYWNrYWdlIGNhbiBjb25zdW1lIHByb3ZpZGVycyB0aGF0IHJldHVybiBSZWFjdCBjb21wb25lbnRzIHRvXG4gICAqIGJlIHJlbmRlcmVkIGlubGluZS5cbiAgICogQSB1aVByb3ZpZGVyIG11c3QgaGF2ZSBhIG1ldGhvZCBjb21wb3NlVWlFbGVtZW50cyB3aXRoIHRoZSBmb2xsb3dpbmcgc3BlYzpcbiAgICogQHBhcmFtIGZpbGVQYXRoIFRoZSBwYXRoIG9mIHRoZSBmaWxlIHRoZSBkaWZmIHZpZXcgaXMgb3BlbmVkIGZvclxuICAgKiBAcmV0dXJuIEFuIGFycmF5IG9mIElubGluZUNvbW1lbnRzIChkZWZpbmVkIGFib3ZlKSB0byBiZSByZW5kZXJlZCBpbnRvIHRoZVxuICAgKiAgICAgICAgIGRpZmYgdmlld1xuICAgKi9cbiAgY29uc3VtZVByb3ZpZGVyKHByb3ZpZGVyOiBPYmplY3QpIHtcbiAgICAvLyBUT0RPKG1vc3QpOiBGaXggVUkgcmVuZGVyaW5nIGFuZCByZS1pbnRyb2R1Y2U6IHQ4MTc0MzMyXG4gICAgLy8gdWlQcm92aWRlcnMucHVzaChwcm92aWRlcik7XG4gICAgcmV0dXJuO1xuICB9LFxufTtcbiJdfQ==