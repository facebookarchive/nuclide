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

var _libNuclideFeatures = require('../../../lib/nuclideFeatures');

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
  return logger || (logger = require('../../nuclide-logging').getLogger());
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

  var _require2 = require('../../nuclide-analytics');

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
  var _require3 = require('../../nuclide-remote-uri');

  var isRemote = _require3.isRemote;

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

  var _require4 = require('react-for-atom');

  var React = _require4.React;
  var ReactDOM = _require4.ReactDOM;

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
    var _require5 = require('react-for-atom');

    var React = _require5.React;

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
//# sourceMappingURL=data:application/json;base64,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QSxlQUFHO0FBQ25CLGFBQU8sY0FBYyxDQUFDO0tBQ3ZCOzs7O0VBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hvbWVGcmFnbWVudHN9IGZyb20gJy4uLy4uL251Y2xpZGUtaG9tZS1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWxUeXBlIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlyZWN0b3J5fSBmcm9tICdhdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBudWNsaWRlRmVhdHVyZXMgZnJvbSAnLi4vLi4vLi4vbGliL251Y2xpZGVGZWF0dXJlcyc7XG5pbXBvcnQge2dldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudH0gZnJvbSAnLi91dGlscyc7XG5cbmxldCBkaWZmVmlld01vZGVsOiA/RGlmZlZpZXdNb2RlbFR5cGUgPSBudWxsO1xubGV0IGFjdGl2ZURpZmZWaWV3OiA/e1xuICBjb21wb25lbnQ6IFJlYWN0Q29tcG9uZW50O1xuICBlbGVtZW50OiBIVE1MRWxlbWVudDtcbn0gID0gbnVsbDtcblxuLy8gVGhpcyB1cmwgc3R5bGUgaXMgdGhlIG9uZSBBdG9tIHVzZXMgZm9yIHRoZSB3ZWxjb21lIGFuZCBzZXR0aW5ncyBwYWdlcy5cbmNvbnN0IE5VQ0xJREVfRElGRl9WSUVXX1VSSSA9ICdhdG9tOi8vbnVjbGlkZS9kaWZmLXZpZXcnO1xuY29uc3QgdWlQcm92aWRlcnMgPSBbXTtcblxubGV0IHN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlID0gbnVsbDtcbmxldCB0b29sQmFyOiA/YW55ID0gbnVsbDtcbmxldCBjaGFuZ2VDb3VudEVsZW1lbnQ6ID9IVE1MRWxlbWVudCA9IG51bGw7XG5sZXQgbG9nZ2VyID0gbnVsbDtcblxuZnVuY3Rpb24gZ2V0TG9nZ2VyKCkge1xuICByZXR1cm4gbG9nZ2VyIHx8IChsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKSk7XG59XG5cbi8vIFRvIGFkZCBhIFZpZXcgYXMgYW4gQXRvbSB3b3Jrc3BhY2UgcGFuZSwgd2UgcmV0dXJuIGBEaWZmVmlld0VsZW1lbnRgIHdoaWNoIGV4dGVuZHMgYEhUTUxFbGVtZW50YC5cbi8vIFRoaXMgcGF0dGV0biBpcyBhbHNvIGZvbGxvd2VkIHdpdGggYXRvbSdzIFRleHRFZGl0b3IuXG5mdW5jdGlvbiBjcmVhdGVWaWV3KGVudHJ5UGF0aDogc3RyaW5nKTogSFRNTEVsZW1lbnQge1xuICBpZiAoYWN0aXZlRGlmZlZpZXcpIHtcbiAgICBhY3RpdmF0ZUZpbGVQYXRoKGVudHJ5UGF0aCk7XG4gICAgcmV0dXJuIGFjdGl2ZURpZmZWaWV3LmVsZW1lbnQ7XG4gIH1cblxuICBjb25zdCB7XG4gICAgUmVhY3QsXG4gICAgUmVhY3RET00sXG4gIH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuICBjb25zdCBEaWZmVmlld0VsZW1lbnQgPSByZXF1aXJlKCcuL0RpZmZWaWV3RWxlbWVudCcpO1xuICBjb25zdCBEaWZmVmlld0NvbXBvbmVudCA9IHJlcXVpcmUoJy4vRGlmZlZpZXdDb21wb25lbnQnKTtcblxuICBjb25zdCBkaWZmTW9kZWwgPSBnZXREaWZmVmlld01vZGVsKCk7XG4gIGNvbnN0IGhvc3RFbGVtZW50ID0gbmV3IERpZmZWaWV3RWxlbWVudCgpLmluaXRpYWxpemUoZGlmZk1vZGVsLCBOVUNMSURFX0RJRkZfVklFV19VUkkpO1xuICBjb25zdCBjb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgPERpZmZWaWV3Q29tcG9uZW50IGRpZmZNb2RlbD17ZGlmZk1vZGVsfSAvPixcbiAgICBob3N0RWxlbWVudCxcbiAgKTtcbiAgYWN0aXZlRGlmZlZpZXcgPSB7XG4gICAgY29tcG9uZW50LFxuICAgIGVsZW1lbnQ6IGhvc3RFbGVtZW50LFxuICB9O1xuICBkaWZmTW9kZWwuYWN0aXZhdGUoKTtcbiAgYWN0aXZhdGVGaWxlUGF0aChlbnRyeVBhdGgpO1xuXG4gIGNvbnN0IGRlc3Ryb3lTdWJzY3JpcHRpb24gPSBob3N0RWxlbWVudC5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoaG9zdEVsZW1lbnQpO1xuICAgIGRpZmZNb2RlbC5kZWFjdGl2YXRlKCk7XG4gICAgZGVzdHJveVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICAgIHN1YnNjcmlwdGlvbnMucmVtb3ZlKGRlc3Ryb3lTdWJzY3JpcHRpb24pO1xuICAgIGFjdGl2ZURpZmZWaWV3ID0gbnVsbDtcbiAgfSk7XG5cbiAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICBzdWJzY3JpcHRpb25zLmFkZChkZXN0cm95U3Vic2NyaXB0aW9uKTtcblxuICBjb25zdCB7dHJhY2t9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnKTtcbiAgdHJhY2soJ2RpZmYtdmlldy1vcGVuJyk7XG5cbiAgcmV0dXJuIGhvc3RFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBnZXREaWZmVmlld01vZGVsKCk6IERpZmZWaWV3TW9kZWxUeXBlIHtcbiAgaWYgKCFkaWZmVmlld01vZGVsKSB7XG4gICAgY29uc3QgRGlmZlZpZXdNb2RlbCA9IHJlcXVpcmUoJy4vRGlmZlZpZXdNb2RlbCcpO1xuICAgIGRpZmZWaWV3TW9kZWwgPSBuZXcgRGlmZlZpZXdNb2RlbCh1aVByb3ZpZGVycyk7XG4gICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGRpZmZWaWV3TW9kZWwpO1xuICB9XG4gIHJldHVybiBkaWZmVmlld01vZGVsO1xufVxuXG5mdW5jdGlvbiBhY3RpdmF0ZUZpbGVQYXRoKGZpbGVQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKCFmaWxlUGF0aC5sZW5ndGggfHwgIWRpZmZWaWV3TW9kZWwpIHtcbiAgICAvLyBUaGUgRGlmZiBWaWV3IGNvdWxkIGJlIG9wZW5lZCB3aXRoIG5vIHBhdGggYXQgYWxsLlxuICAgIHJldHVybjtcbiAgfVxuICBkaWZmVmlld01vZGVsLmFjdGl2YXRlRmlsZShmaWxlUGF0aCk7XG59XG5cbmZ1bmN0aW9uIHByb2plY3RzQ29udGFpblBhdGgoY2hlY2tQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3Qge2lzUmVtb3RlfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaScpO1xuICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCkuc29tZShkaXJlY3RvcnkgPT4ge1xuICAgIGNvbnN0IGRpcmVjdG9yeVBhdGggPSBkaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICAgIGlmICghY2hlY2tQYXRoLnN0YXJ0c1dpdGgoZGlyZWN0b3J5UGF0aCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIHJlbW90ZSBkaXJlY3RvcnkgaGFzbid0IHlldCBsb2FkZWQuXG4gICAgaWYgKGlzUmVtb3RlKGNoZWNrUGF0aCkgJiYgZGlyZWN0b3J5IGluc3RhbmNlb2YgRGlyZWN0b3J5KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlVG9vbGJhckNvdW50KGRpZmZWaWV3QnV0dG9uOiBIVE1MRWxlbWVudCwgY291bnQ6IG51bWJlcik6IHZvaWQge1xuICBpZiAoIWNoYW5nZUNvdW50RWxlbWVudCkge1xuICAgIGNoYW5nZUNvdW50RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBjaGFuZ2VDb3VudEVsZW1lbnQuY2xhc3NOYW1lID0gJ2RpZmYtdmlldy1jb3VudCc7XG4gICAgZGlmZlZpZXdCdXR0b24uYXBwZW5kQ2hpbGQoY2hhbmdlQ291bnRFbGVtZW50KTtcbiAgfVxuICBpZiAoY291bnQgPiAwKSB7XG4gICAgZGlmZlZpZXdCdXR0b24uY2xhc3NMaXN0LmFkZCgncG9zaXRpdmUtY291bnQnKTtcbiAgfSBlbHNlIHtcbiAgICBkaWZmVmlld0J1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdwb3NpdGl2ZS1jb3VudCcpO1xuICB9XG4gIGNvbnN0IHtcbiAgICBSZWFjdCxcbiAgICBSZWFjdERPTSxcbiAgfSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG4gIGNvbnN0IERpZmZDb3VudENvbXBvbmVudCA9IHJlcXVpcmUoJy4vRGlmZkNvdW50Q29tcG9uZW50Jyk7XG4gIFJlYWN0RE9NLnJlbmRlcig8RGlmZkNvdW50Q29tcG9uZW50IGNvdW50PXtjb3VudH0gLz4sIGNoYW5nZUNvdW50RWxlbWVudCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGFjdGl2YXRlKHN0YXRlOiA/YW55KTogdm9pZCB7XG4gICAgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgLy8gTGlzdGVuIGZvciBtZW51IGl0ZW0gd29ya3NwYWNlIGRpZmYgdmlldyBvcGVuIGNvbW1hbmQuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ251Y2xpZGUtZGlmZi12aWV3Om9wZW4nLFxuICAgICAgKCkgPT4gYXRvbS53b3Jrc3BhY2Uub3BlbihOVUNMSURFX0RJRkZfVklFV19VUkkpXG4gICAgKSk7XG4gICAgLy8gTGlzdGVuIGZvciBpbi1lZGl0b3IgY29udGV4dCBtZW51IGl0ZW0gZGlmZiB2aWV3IG9wZW4gY29tbWFuZC5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdudWNsaWRlLWRpZmYtdmlldzpvcGVuJyxcbiAgICAgICgpID0+IHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgICBpZiAoIWVkaXRvcikge1xuICAgICAgICAgIHJldHVybiBnZXRMb2dnZXIoKS53YXJuKCdObyBhY3RpdmUgdGV4dCBlZGl0b3IgZm9yIGRpZmYgdmlldyEnKTtcbiAgICAgICAgfVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKE5VQ0xJREVfRElGRl9WSUVXX1VSSSArIChlZGl0b3IuZ2V0UGF0aCgpIHx8ICcnKSk7XG4gICAgICB9XG4gICAgKSk7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHN3aXRjaGluZyB0byBlZGl0b3IgbW9kZSBmb3IgdGhlIGFjdGl2ZSBmaWxlLlxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJ251Y2xpZGUtZGlmZi12aWV3JyxcbiAgICAgICdudWNsaWRlLWRpZmYtdmlldzpzd2l0Y2gtdG8tZWRpdG9yJyxcbiAgICAgICgpID0+IHtcbiAgICAgICAgY29uc3QgZGlmZk1vZGVsID0gZ2V0RGlmZlZpZXdNb2RlbCgpO1xuICAgICAgICBjb25zdCB7ZmlsZVBhdGh9ID0gZGlmZk1vZGVsLmdldEFjdGl2ZUZpbGVTdGF0ZSgpO1xuICAgICAgICBpZiAoZmlsZVBhdGggIT0gbnVsbCAmJiBmaWxlUGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICkpO1xuXG4gICAgLy8gTGlzdGVuIGZvciBmaWxlIHRyZWUgY29udGV4dCBtZW51IGZpbGUgaXRlbSBldmVudHMgdG8gb3BlbiB0aGUgZGlmZiB2aWV3LlxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJy50cmVlLXZpZXcgLmVudHJ5LmZpbGUubGlzdC1pdGVtJyxcbiAgICAgICdudWNsaWRlLWRpZmYtdmlldzpvcGVuLWNvbnRleHQnLFxuICAgICAgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGdldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudChldmVudCk7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oTlVDTElERV9ESUZGX1ZJRVdfVVJJICsgKGZpbGVQYXRoIHx8ICcnKSk7XG4gICAgICB9XG4gICAgKSk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgJy50cmVlLXZpZXcgLmVudHJ5LmZpbGUubGlzdC1pdGVtJzogW1xuICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdPcGVuIGluIERpZmYgVmlldycsXG4gICAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZGlmZi12aWV3Om9wZW4tY29udGV4dCcsXG4gICAgICAgIH0sXG4gICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICBdLFxuICAgIH0pKTtcblxuICAgIC8vIExpc3RlbiBmb3IgZmlsZSB0cmVlIGNvbnRleHQgbWVudSBkaXJlY3RvcnkgaXRlbSBldmVudHMgdG8gb3BlbiB0aGUgZGlmZiB2aWV3LlxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJy50cmVlLXZpZXcgLmVudHJ5LmRpcmVjdG9yeS5saXN0LW5lc3RlZC1pdGVtJyxcbiAgICAgICdudWNsaWRlLWRpZmYtdmlldzpvcGVuLWNvbnRleHQnLFxuICAgICAgZXZlbnQgPT4ge1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKE5VQ0xJREVfRElGRl9WSUVXX1VSSSk7XG4gICAgICB9XG4gICAgKSk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgJy50cmVlLXZpZXcgLmVudHJ5LmRpcmVjdG9yeS5saXN0LW5lc3RlZC1pdGVtJzogW1xuICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdPcGVuIGluIERpZmYgVmlldycsXG4gICAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZGlmZi12aWV3Om9wZW4tY29udGV4dCcsXG4gICAgICAgIH0sXG4gICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICBdLFxuICAgIH0pKTtcblxuICAgIC8vIFRoZSBEaWZmIFZpZXcgd2lsbCBvcGVuIGl0cyBtYWluIFVJIGluIGEgdGFiLCBsaWtlIEF0b20ncyBwcmVmZXJlbmNlcyBhbmQgd2VsY29tZSBwYWdlcy5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIodXJpID0+IHtcbiAgICAgIGlmICh1cmkuc3RhcnRzV2l0aChOVUNMSURFX0RJRkZfVklFV19VUkkpKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVWaWV3KHVyaS5zbGljZShOVUNMSURFX0RJRkZfVklFV19VUkkubGVuZ3RoKSk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgaWYgKCFzdGF0ZSB8fCAhc3RhdGUuYWN0aXZlRmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBXYWl0IGZvciBhbGwgc291cmNlIGNvbnRyb2wgcHJvdmlkZXJzIHRvIHJlZ2lzdGVyLlxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKG51Y2xpZGVGZWF0dXJlcy5vbkRpZEFjdGl2YXRlSW5pdGlhbEZlYXR1cmVzKCgpID0+IHtcbiAgICAgIGludmFyaWFudChzdGF0ZSk7XG4gICAgICBjb25zdCB7YWN0aXZlRmlsZVBhdGh9ID0gc3RhdGU7XG5cbiAgICAgIC8vIElmIGl0J3MgYSBsb2NhbCBkaXJlY3RvcnksIGl0IG11c3QgYmUgbG9hZGVkIHdpdGggcGFja2FnZXMgYWN0aXZhdGlvbi5cbiAgICAgIGlmIChwcm9qZWN0c0NvbnRhaW5QYXRoKGFjdGl2ZUZpbGVQYXRoKSkge1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKE5VQ0xJREVfRElGRl9WSUVXX1VSSSArIGFjdGl2ZUZpbGVQYXRoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gSWYgaXQncyBhIHJlbW90ZSBkaXJlY3RvcnksIGl0IHNob3VsZCBjb21lIG9uIGEgcGF0aCBjaGFuZ2UgZXZlbnQuXG4gICAgICAvLyBUaGUgY2hhbmdlIGhhbmRsZXIgaXMgZGVsYXllZCB0byBicmVhayB0aGUgcmFjZSB3aXRoIHRoZSBgRGlmZlZpZXdNb2RlbGAgc3Vic2NyaXB0aW9uLlxuICAgICAgY29uc3QgY2hhbmdlUGF0aHNTdWJzY3JpcHRpb24gPSBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgLy8gdHJ5L2NhdGNoIGhlcmUgYmVjYXVzZSBpbiBjYXNlIG9mIGFueSBlcnJvciwgQXRvbSBzdG9wcyBkaXNwYXRjaGluZyBldmVudHMgdG8gdGhlXG4gICAgICAgIC8vIHJlc3Qgb2YgdGhlIGxpc3RlbmVycywgd2hpY2ggY2FuIHN0b3AgdGhlIHJlbW90ZSBlZGl0aW5nIGZyb20gYmVpbmcgZnVuY3Rpb25hbC5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAocHJvamVjdHNDb250YWluUGF0aChhY3RpdmVGaWxlUGF0aCkpIHtcbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oTlVDTElERV9ESUZGX1ZJRVdfVVJJICsgYWN0aXZlRmlsZVBhdGgpO1xuICAgICAgICAgICAgY2hhbmdlUGF0aHNTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICAgICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICAgICAgICAgICAgc3Vic2NyaXB0aW9ucy5yZW1vdmUoY2hhbmdlUGF0aHNTdWJzY3JpcHRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGdldExvZ2dlcigpLmVycm9yKCdEaWZmVmlldyByZXN0b3JlIGVycm9yJywgZSk7XG4gICAgICAgIH1cbiAgICAgIH0sIDEwKSk7XG4gICAgICBpbnZhcmlhbnQoc3Vic2NyaXB0aW9ucyk7XG4gICAgICBzdWJzY3JpcHRpb25zLmFkZChjaGFuZ2VQYXRoc1N1YnNjcmlwdGlvbik7XG4gICAgfSkpO1xuICB9LFxuXG4gIGNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXI6IChncm91cDogc3RyaW5nKSA9PiBPYmplY3QpOiB2b2lkIHtcbiAgICB0b29sQmFyID0gZ2V0VG9vbEJhcignbnVjbGlkZS1kaWZmLXZpZXcnKTtcbiAgICBjb25zdCBidXR0b24gPSB0b29sQmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiAnZ2l0LWJyYW5jaCcsXG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtZGlmZi12aWV3Om9wZW4nLFxuICAgICAgdG9vbHRpcDogJ09wZW4gRGlmZiBWaWV3JyxcbiAgICAgIHByaW9yaXR5OiAzMDAsXG4gICAgfSlbMF07XG4gICAgY29uc3QgZGlmZk1vZGVsID0gZ2V0RGlmZlZpZXdNb2RlbCgpO1xuICAgIHVwZGF0ZVRvb2xiYXJDb3VudChidXR0b24sIGRpZmZNb2RlbC5nZXRTdGF0ZSgpLmRpcnR5RmlsZUNoYW5nZXMuc2l6ZSk7XG4gICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGRpZmZNb2RlbC5vbkRpZFVwZGF0ZVN0YXRlKCgpID0+IHtcbiAgICAgIHVwZGF0ZVRvb2xiYXJDb3VudChidXR0b24sIGRpZmZNb2RlbC5nZXRTdGF0ZSgpLmRpcnR5RmlsZUNoYW5nZXMuc2l6ZSk7XG4gICAgfSkpO1xuICB9LFxuXG4gIGdldEhvbWVGcmFnbWVudHMoKTogSG9tZUZyYWdtZW50cyB7XG4gICAgY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZlYXR1cmU6IHtcbiAgICAgICAgdGl0bGU6ICdEaWZmIFZpZXcnLFxuICAgICAgICBpY29uOiAnZ2l0LWJyYW5jaCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAoXG4gICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICBMYXVuY2hlcyBhbiBlZGl0YWJsZSBzaWRlLWJ5LXNpZGUgdmlldyBvZiB0aGUgb3V0cHV0IG9mIHRoZSBNZXJjdXJpYWxcbiAgICAgICAgICAgIDxjb2RlPmhnIGRpZmY8L2NvZGU+IGNvbW1hbmQsIHNob3dpbmcgcGVuZGluZyBjaGFuZ2VzIHRvIGJlIGNvbW1pdHRlZC5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICksXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWRpZmYtdmlldzpvcGVuJyxcbiAgICAgIH0sXG4gICAgICBwcmlvcml0eTogMyxcbiAgICB9O1xuICB9LFxuXG4gIHNlcmlhbGl6ZSgpOiA/T2JqZWN0IHtcbiAgICBpZiAoIWFjdGl2ZURpZmZWaWV3IHx8ICFkaWZmVmlld01vZGVsKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSBkaWZmVmlld01vZGVsLmdldEFjdGl2ZUZpbGVTdGF0ZSgpO1xuICAgIHJldHVybiB7XG4gICAgICBhY3RpdmVGaWxlUGF0aDogZmlsZVBhdGgsXG4gICAgfTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIHVpUHJvdmlkZXJzLnNwbGljZSgwKTtcbiAgICBpZiAoc3Vic2NyaXB0aW9ucyAhPSBudWxsKSB7XG4gICAgICBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHN1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoZGlmZlZpZXdNb2RlbCAhPSBudWxsKSB7XG4gICAgICBkaWZmVmlld01vZGVsLmRpc3Bvc2UoKTtcbiAgICAgIGRpZmZWaWV3TW9kZWwgPSBudWxsO1xuICAgIH1cbiAgICBhY3RpdmVEaWZmVmlldyA9IG51bGw7XG4gICAgaWYgKHRvb2xCYXIgIT0gbnVsbCkge1xuICAgICAgdG9vbEJhci5yZW1vdmVJdGVtcygpO1xuICAgICAgdG9vbEJhciA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBUaGUgZGlmZi12aWV3IHBhY2thZ2UgY2FuIGNvbnN1bWUgcHJvdmlkZXJzIHRoYXQgcmV0dXJuIFJlYWN0IGNvbXBvbmVudHMgdG9cbiAgICogYmUgcmVuZGVyZWQgaW5saW5lLlxuICAgKiBBIHVpUHJvdmlkZXIgbXVzdCBoYXZlIGEgbWV0aG9kIGNvbXBvc2VVaUVsZW1lbnRzIHdpdGggdGhlIGZvbGxvd2luZyBzcGVjOlxuICAgKiBAcGFyYW0gZmlsZVBhdGggVGhlIHBhdGggb2YgdGhlIGZpbGUgdGhlIGRpZmYgdmlldyBpcyBvcGVuZWQgZm9yXG4gICAqIEByZXR1cm4gQW4gYXJyYXkgb2YgSW5saW5lQ29tbWVudHMgKGRlZmluZWQgYWJvdmUpIHRvIGJlIHJlbmRlcmVkIGludG8gdGhlXG4gICAqICAgICAgICAgZGlmZiB2aWV3XG4gICAqL1xuICBjb25zdW1lUHJvdmlkZXIocHJvdmlkZXI6IE9iamVjdCkge1xuICAgIC8vIFRPRE8obW9zdCk6IEZpeCBVSSByZW5kZXJpbmcgYW5kIHJlLWludHJvZHVjZTogdDgxNzQzMzJcbiAgICAvLyB1aVByb3ZpZGVycy5wdXNoKHByb3ZpZGVyKTtcbiAgICByZXR1cm47XG4gIH0sXG5cbiAgZ2V0IF9fdGVzdERpZmZWaWV3KCkge1xuICAgIHJldHVybiBhY3RpdmVEaWZmVmlldztcbiAgfSxcbn07XG4iXX0=