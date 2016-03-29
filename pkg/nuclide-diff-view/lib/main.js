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

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _libNuclideFeatures = require('../../../lib/nuclideFeatures');

var _libNuclideFeatures2 = _interopRequireDefault(_libNuclideFeatures);

var _utils = require('./utils');

var _nuclideLogging = require('../../nuclide-logging');

var diffViewModel = null;
var activeDiffView = null;

// This url style is the one Atom uses for the welcome and settings pages.
var NUCLIDE_DIFF_VIEW_URI = 'atom://nuclide/diff-view';
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
  activateDiffPath(diffEntityOptions);

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

function activateDiffPath(diffEntityOptions) {
  if (diffViewModel == null) {
    return;
  }
  var validDiffEntityOptions = null;
  if (diffEntityOptions.file || diffEntityOptions.directory) {
    validDiffEntityOptions = diffEntityOptions;
  } else if (cwdApi != null) {
    var directory = cwdApi.getCwd();
    if (directory != null) {
      validDiffEntityOptions = { directory: directory.getPath() };
    }
  }
  if (validDiffEntityOptions != null) {
    diffViewModel.diffEntity(validDiffEntityOptions);
  }
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
      return atom.workspace.open(formatDiffViewUrl());
    }));
    // Listen for in-editor context menu item diff view open command.
    subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-diff-view:open', function () {
      var editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        return (0, _nuclideLogging.getLogger)().warn('No active text editor for diff view!');
      }
      atom.workspace.open(formatDiffViewUrl({ file: editor.getPath() || '' }));
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
      atom.workspace.open(formatDiffViewUrl({ file: filePath || '' }));
    }));
    subscriptions.add(atom.contextMenu.add({
      '.tree-view .entry.file.list-item': [{ type: 'separator' }, {
        label: 'Open in Diff View',
        command: 'nuclide-diff-view:open-context'
      }, { type: 'separator' }]
    }));

    // Listen for file tree context menu directory item events to open the diff view.
    subscriptions.add(atom.commands.add('.tree-view .entry.directory.list-nested-item', 'nuclide-diff-view:open-context', function (event) {
      var directoryPath = (0, _utils.getFileTreePathFromTargetEvent)(event);
      atom.workspace.open(formatDiffViewUrl({ directory: directoryPath || '' }));
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
        var _url$parse = _url2['default'].parse(uri, true);

        var diffEntityOptions = _url$parse.query;

        return createView(diffEntityOptions);
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
        atom.workspace.open(formatDiffViewUrl({ file: activeFilePath }));
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
              atom.workspace.open(formatDiffViewUrl({ file: activeFilePath }));
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

  consumeOutputService: function consumeOutputService(api) {
    return api.registerOutputProvider({
      source: 'diff view',
      messages: getDiffViewModel().getMessages()
    });
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
  },

  consumeCwdApi: function consumeCwdApi(api) {
    cwdApi = api;
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
//# sourceMappingURL=data:application/json;base64,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LEdBQUcsQ0FBQztHQUNkOztDQUtGO0FBSEssZ0JBQWM7U0FBQSxlQUFHO0FBQ25CLGFBQU8sY0FBYyxDQUFDO0tBQ3ZCOzs7O0VBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbFR5cGUsIHtEaWZmRW50aXR5T3B0aW9uc30gZnJvbSAnLi9EaWZmVmlld01vZGVsJztcbmltcG9ydCB0eXBlIHtIb21lRnJhZ21lbnRzfSBmcm9tICcuLi8uLi9udWNsaWRlLWhvbWUtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSBPdXRwdXRTZXJ2aWNlIGZyb20gJy4uLy4uL251Y2xpZGUtY29uc29sZS9saWIvT3V0cHV0U2VydmljZSc7XG5pbXBvcnQgdHlwZSB7Q3dkQXBpfSBmcm9tICcuLi8uLi9udWNsaWRlLWN1cnJlbnQtd29ya2luZy1kaXJlY3RvcnkvbGliL0N3ZEFwaSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlyZWN0b3J5fSBmcm9tICdhdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB1cmwgZnJvbSAndXJsJztcbmltcG9ydCBudWNsaWRlRmVhdHVyZXMgZnJvbSAnLi4vLi4vLi4vbGliL251Y2xpZGVGZWF0dXJlcyc7XG5pbXBvcnQge2dldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcblxubGV0IGRpZmZWaWV3TW9kZWw6ID9EaWZmVmlld01vZGVsVHlwZSA9IG51bGw7XG5sZXQgYWN0aXZlRGlmZlZpZXc6ID97XG4gIGNvbXBvbmVudDogUmVhY3RDb21wb25lbnQ7XG4gIGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xufSAgPSBudWxsO1xuXG4vLyBUaGlzIHVybCBzdHlsZSBpcyB0aGUgb25lIEF0b20gdXNlcyBmb3IgdGhlIHdlbGNvbWUgYW5kIHNldHRpbmdzIHBhZ2VzLlxuY29uc3QgTlVDTElERV9ESUZGX1ZJRVdfVVJJID0gJ2F0b206Ly9udWNsaWRlL2RpZmYtdmlldyc7XG5jb25zdCB1aVByb3ZpZGVycyA9IFtdO1xuXG5sZXQgc3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGUgPSBudWxsO1xubGV0IHRvb2xCYXI6ID9hbnkgPSBudWxsO1xubGV0IGNoYW5nZUNvdW50RWxlbWVudDogP0hUTUxFbGVtZW50ID0gbnVsbDtcbmxldCBjd2RBcGk6ID9Dd2RBcGkgPSBudWxsO1xuXG5mdW5jdGlvbiBmb3JtYXREaWZmVmlld1VybChkaWZmRW50aXR5T3B0aW9ucz86ID9EaWZmRW50aXR5T3B0aW9ucyk6IHN0cmluZyB7XG4gIGlmIChkaWZmRW50aXR5T3B0aW9ucyA9PSBudWxsKSB7XG4gICAgZGlmZkVudGl0eU9wdGlvbnMgPSB7ZmlsZTogJyd9O1xuICB9XG4gIHJldHVybiB1cmwuZm9ybWF0KHtcbiAgICBwcm90b2NvbDogJ2F0b20nLFxuICAgIGhvc3Q6ICdudWNsaWRlJyxcbiAgICBwYXRobmFtZTogJ2RpZmYtdmlldycsXG4gICAgc2xhc2hlczogdHJ1ZSxcbiAgICBxdWVyeTogZGlmZkVudGl0eU9wdGlvbnMsXG4gIH0pO1xufVxuXG5cbi8vIFRvIGFkZCBhIFZpZXcgYXMgYW4gQXRvbSB3b3Jrc3BhY2UgcGFuZSwgd2UgcmV0dXJuIGBEaWZmVmlld0VsZW1lbnRgIHdoaWNoIGV4dGVuZHMgYEhUTUxFbGVtZW50YC5cbi8vIFRoaXMgcGF0dGV0biBpcyBhbHNvIGZvbGxvd2VkIHdpdGggYXRvbSdzIFRleHRFZGl0b3IuXG5mdW5jdGlvbiBjcmVhdGVWaWV3KGRpZmZFbnRpdHlPcHRpb25zOiBEaWZmRW50aXR5T3B0aW9ucyk6IEhUTUxFbGVtZW50IHtcbiAgaWYgKGFjdGl2ZURpZmZWaWV3KSB7XG4gICAgYWN0aXZhdGVEaWZmUGF0aChkaWZmRW50aXR5T3B0aW9ucyk7XG4gICAgcmV0dXJuIGFjdGl2ZURpZmZWaWV3LmVsZW1lbnQ7XG4gIH1cblxuICBjb25zdCB7XG4gICAgUmVhY3QsXG4gICAgUmVhY3RET00sXG4gIH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuICBjb25zdCBEaWZmVmlld0VsZW1lbnQgPSByZXF1aXJlKCcuL0RpZmZWaWV3RWxlbWVudCcpO1xuICBjb25zdCBEaWZmVmlld0NvbXBvbmVudCA9IHJlcXVpcmUoJy4vRGlmZlZpZXdDb21wb25lbnQnKTtcblxuICBjb25zdCBkaWZmTW9kZWwgPSBnZXREaWZmVmlld01vZGVsKCk7XG4gIGNvbnN0IGhvc3RFbGVtZW50ID0gbmV3IERpZmZWaWV3RWxlbWVudCgpLmluaXRpYWxpemUoZGlmZk1vZGVsLCBOVUNMSURFX0RJRkZfVklFV19VUkkpO1xuICBjb25zdCBjb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgPERpZmZWaWV3Q29tcG9uZW50IGRpZmZNb2RlbD17ZGlmZk1vZGVsfSAvPixcbiAgICBob3N0RWxlbWVudCxcbiAgKTtcbiAgYWN0aXZlRGlmZlZpZXcgPSB7XG4gICAgY29tcG9uZW50LFxuICAgIGVsZW1lbnQ6IGhvc3RFbGVtZW50LFxuICB9O1xuICBkaWZmTW9kZWwuYWN0aXZhdGUoKTtcbiAgYWN0aXZhdGVEaWZmUGF0aChkaWZmRW50aXR5T3B0aW9ucyk7XG5cbiAgY29uc3QgZGVzdHJveVN1YnNjcmlwdGlvbiA9IGhvc3RFbGVtZW50Lm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShob3N0RWxlbWVudCk7XG4gICAgZGlmZk1vZGVsLmRlYWN0aXZhdGUoKTtcbiAgICBkZXN0cm95U3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICBpbnZhcmlhbnQoc3Vic2NyaXB0aW9ucyk7XG4gICAgc3Vic2NyaXB0aW9ucy5yZW1vdmUoZGVzdHJveVN1YnNjcmlwdGlvbik7XG4gICAgYWN0aXZlRGlmZlZpZXcgPSBudWxsO1xuICB9KTtcblxuICBpbnZhcmlhbnQoc3Vic2NyaXB0aW9ucyk7XG4gIHN1YnNjcmlwdGlvbnMuYWRkKGRlc3Ryb3lTdWJzY3JpcHRpb24pO1xuXG4gIGNvbnN0IHt0cmFja30gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWFuYWx5dGljcycpO1xuICB0cmFjaygnZGlmZi12aWV3LW9wZW4nKTtcblxuICByZXR1cm4gaG9zdEVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGdldERpZmZWaWV3TW9kZWwoKTogRGlmZlZpZXdNb2RlbFR5cGUge1xuICBpZiAoIWRpZmZWaWV3TW9kZWwpIHtcbiAgICBjb25zdCBEaWZmVmlld01vZGVsID0gcmVxdWlyZSgnLi9EaWZmVmlld01vZGVsJyk7XG4gICAgZGlmZlZpZXdNb2RlbCA9IG5ldyBEaWZmVmlld01vZGVsKHVpUHJvdmlkZXJzKTtcbiAgICBpbnZhcmlhbnQoc3Vic2NyaXB0aW9ucyk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoZGlmZlZpZXdNb2RlbCk7XG4gIH1cbiAgcmV0dXJuIGRpZmZWaWV3TW9kZWw7XG59XG5cbmZ1bmN0aW9uIGFjdGl2YXRlRGlmZlBhdGgoZGlmZkVudGl0eU9wdGlvbnM6IERpZmZFbnRpdHlPcHRpb25zKTogdm9pZCB7XG4gIGlmIChkaWZmVmlld01vZGVsID09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IHZhbGlkRGlmZkVudGl0eU9wdGlvbnMgPSBudWxsO1xuICBpZiAoZGlmZkVudGl0eU9wdGlvbnMuZmlsZSB8fCBkaWZmRW50aXR5T3B0aW9ucy5kaXJlY3RvcnkpIHtcbiAgICB2YWxpZERpZmZFbnRpdHlPcHRpb25zID0gZGlmZkVudGl0eU9wdGlvbnM7XG4gIH0gZWxzZSBpZiAoY3dkQXBpICE9IG51bGwpIHtcbiAgICBjb25zdCBkaXJlY3RvcnkgPSBjd2RBcGkuZ2V0Q3dkKCk7XG4gICAgaWYgKGRpcmVjdG9yeSAhPSBudWxsKSB7XG4gICAgICB2YWxpZERpZmZFbnRpdHlPcHRpb25zID0ge2RpcmVjdG9yeTogZGlyZWN0b3J5LmdldFBhdGgoKX07XG4gICAgfVxuICB9XG4gIGlmICh2YWxpZERpZmZFbnRpdHlPcHRpb25zICE9IG51bGwpIHtcbiAgICBkaWZmVmlld01vZGVsLmRpZmZFbnRpdHkodmFsaWREaWZmRW50aXR5T3B0aW9ucyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvamVjdHNDb250YWluUGF0aChjaGVja1BhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCB7aXNSZW1vdGV9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJyk7XG4gIHJldHVybiBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5zb21lKGRpcmVjdG9yeSA9PiB7XG4gICAgY29uc3QgZGlyZWN0b3J5UGF0aCA9IGRpcmVjdG9yeS5nZXRQYXRoKCk7XG4gICAgaWYgKCFjaGVja1BhdGguc3RhcnRzV2l0aChkaXJlY3RvcnlQYXRoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgcmVtb3RlIGRpcmVjdG9yeSBoYXNuJ3QgeWV0IGxvYWRlZC5cbiAgICBpZiAoaXNSZW1vdGUoY2hlY2tQYXRoKSAmJiBkaXJlY3RvcnkgaW5zdGFuY2VvZiBEaXJlY3RvcnkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVUb29sYmFyQ291bnQoZGlmZlZpZXdCdXR0b246IEhUTUxFbGVtZW50LCBjb3VudDogbnVtYmVyKTogdm9pZCB7XG4gIGlmICghY2hhbmdlQ291bnRFbGVtZW50KSB7XG4gICAgY2hhbmdlQ291bnRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGNoYW5nZUNvdW50RWxlbWVudC5jbGFzc05hbWUgPSAnZGlmZi12aWV3LWNvdW50JztcbiAgICBkaWZmVmlld0J1dHRvbi5hcHBlbmRDaGlsZChjaGFuZ2VDb3VudEVsZW1lbnQpO1xuICB9XG4gIGlmIChjb3VudCA+IDApIHtcbiAgICBkaWZmVmlld0J1dHRvbi5jbGFzc0xpc3QuYWRkKCdwb3NpdGl2ZS1jb3VudCcpO1xuICB9IGVsc2Uge1xuICAgIGRpZmZWaWV3QnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ3Bvc2l0aXZlLWNvdW50Jyk7XG4gIH1cbiAgY29uc3Qge1xuICAgIFJlYWN0LFxuICAgIFJlYWN0RE9NLFxuICB9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbiAgY29uc3QgRGlmZkNvdW50Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9EaWZmQ291bnRDb21wb25lbnQnKTtcbiAgUmVhY3RET00ucmVuZGVyKDxEaWZmQ291bnRDb21wb25lbnQgY291bnQ9e2NvdW50fSAvPiwgY2hhbmdlQ291bnRFbGVtZW50KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYWN0aXZhdGUoc3RhdGU6ID9hbnkpOiB2b2lkIHtcbiAgICBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICAvLyBMaXN0ZW4gZm9yIG1lbnUgaXRlbSB3b3Jrc3BhY2UgZGlmZiB2aWV3IG9wZW4gY29tbWFuZC5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAnbnVjbGlkZS1kaWZmLXZpZXc6b3BlbicsXG4gICAgICAoKSA9PiBhdG9tLndvcmtzcGFjZS5vcGVuKGZvcm1hdERpZmZWaWV3VXJsKCkpLFxuICAgICkpO1xuICAgIC8vIExpc3RlbiBmb3IgaW4tZWRpdG9yIGNvbnRleHQgbWVudSBpdGVtIGRpZmYgdmlldyBvcGVuIGNvbW1hbmQuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgICAnbnVjbGlkZS1kaWZmLXZpZXc6b3BlbicsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgICAgaWYgKCFlZGl0b3IpIHtcbiAgICAgICAgICByZXR1cm4gZ2V0TG9nZ2VyKCkud2FybignTm8gYWN0aXZlIHRleHQgZWRpdG9yIGZvciBkaWZmIHZpZXchJyk7XG4gICAgICAgIH1cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbihmb3JtYXREaWZmVmlld1VybCh7ZmlsZTogZWRpdG9yLmdldFBhdGgoKSB8fCAnJ30pKTtcbiAgICAgIH0sXG4gICAgKSk7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHN3aXRjaGluZyB0byBlZGl0b3IgbW9kZSBmb3IgdGhlIGFjdGl2ZSBmaWxlLlxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJ251Y2xpZGUtZGlmZi12aWV3JyxcbiAgICAgICdudWNsaWRlLWRpZmYtdmlldzpzd2l0Y2gtdG8tZWRpdG9yJyxcbiAgICAgICgpID0+IHtcbiAgICAgICAgY29uc3QgZGlmZk1vZGVsID0gZ2V0RGlmZlZpZXdNb2RlbCgpO1xuICAgICAgICBjb25zdCB7ZmlsZVBhdGh9ID0gZGlmZk1vZGVsLmdldEFjdGl2ZUZpbGVTdGF0ZSgpO1xuICAgICAgICBpZiAoZmlsZVBhdGggIT0gbnVsbCAmJiBmaWxlUGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICkpO1xuXG4gICAgLy8gTGlzdGVuIGZvciBmaWxlIHRyZWUgY29udGV4dCBtZW51IGZpbGUgaXRlbSBldmVudHMgdG8gb3BlbiB0aGUgZGlmZiB2aWV3LlxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJy50cmVlLXZpZXcgLmVudHJ5LmZpbGUubGlzdC1pdGVtJyxcbiAgICAgICdudWNsaWRlLWRpZmYtdmlldzpvcGVuLWNvbnRleHQnLFxuICAgICAgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGdldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudChldmVudCk7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZm9ybWF0RGlmZlZpZXdVcmwoe2ZpbGU6IGZpbGVQYXRoIHx8ICcnfSkpO1xuICAgICAgfVxuICAgICkpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29udGV4dE1lbnUuYWRkKHtcbiAgICAgICcudHJlZS12aWV3IC5lbnRyeS5maWxlLmxpc3QtaXRlbSc6IFtcbiAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBEaWZmIFZpZXcnLFxuICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWRpZmYtdmlldzpvcGVuLWNvbnRleHQnLFxuICAgICAgICB9LFxuICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgXSxcbiAgICB9KSk7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIGZpbGUgdHJlZSBjb250ZXh0IG1lbnUgZGlyZWN0b3J5IGl0ZW0gZXZlbnRzIHRvIG9wZW4gdGhlIGRpZmYgdmlldy5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICcudHJlZS12aWV3IC5lbnRyeS5kaXJlY3RvcnkubGlzdC1uZXN0ZWQtaXRlbScsXG4gICAgICAnbnVjbGlkZS1kaWZmLXZpZXc6b3Blbi1jb250ZXh0JyxcbiAgICAgIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgZGlyZWN0b3J5UGF0aCA9IGdldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudChldmVudCk7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZm9ybWF0RGlmZlZpZXdVcmwoe2RpcmVjdG9yeTogZGlyZWN0b3J5UGF0aCB8fCAnJ30pKTtcbiAgICAgIH1cbiAgICApKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbnRleHRNZW51LmFkZCh7XG4gICAgICAnLnRyZWUtdmlldyAuZW50cnkuZGlyZWN0b3J5Lmxpc3QtbmVzdGVkLWl0ZW0nOiBbXG4gICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRGlmZiBWaWV3JyxcbiAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXZpZXc6b3Blbi1jb250ZXh0JyxcbiAgICAgICAgfSxcbiAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgLy8gVGhlIERpZmYgVmlldyB3aWxsIG9wZW4gaXRzIG1haW4gVUkgaW4gYSB0YWIsIGxpa2UgQXRvbSdzIHByZWZlcmVuY2VzIGFuZCB3ZWxjb21lIHBhZ2VzLlxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLmFkZE9wZW5lcih1cmkgPT4ge1xuICAgICAgaWYgKHVyaS5zdGFydHNXaXRoKE5VQ0xJREVfRElGRl9WSUVXX1VSSSkpIHtcbiAgICAgICAgY29uc3Qge3F1ZXJ5OiBkaWZmRW50aXR5T3B0aW9uc30gPSB1cmwucGFyc2UodXJpLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVZpZXcoKGRpZmZFbnRpdHlPcHRpb25zOiBhbnkpKTtcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICBpZiAoIXN0YXRlIHx8ICFzdGF0ZS5hY3RpdmVGaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFdhaXQgZm9yIGFsbCBzb3VyY2UgY29udHJvbCBwcm92aWRlcnMgdG8gcmVnaXN0ZXIuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQobnVjbGlkZUZlYXR1cmVzLm9uRGlkQWN0aXZhdGVJbml0aWFsRmVhdHVyZXMoKCkgPT4ge1xuICAgICAgaW52YXJpYW50KHN0YXRlKTtcbiAgICAgIGNvbnN0IHthY3RpdmVGaWxlUGF0aH0gPSBzdGF0ZTtcblxuICAgICAgLy8gSWYgaXQncyBhIGxvY2FsIGRpcmVjdG9yeSwgaXQgbXVzdCBiZSBsb2FkZWQgd2l0aCBwYWNrYWdlcyBhY3RpdmF0aW9uLlxuICAgICAgaWYgKHByb2plY3RzQ29udGFpblBhdGgoYWN0aXZlRmlsZVBhdGgpKSB7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZm9ybWF0RGlmZlZpZXdVcmwoe2ZpbGU6IGFjdGl2ZUZpbGVQYXRofSkpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBJZiBpdCdzIGEgcmVtb3RlIGRpcmVjdG9yeSwgaXQgc2hvdWxkIGNvbWUgb24gYSBwYXRoIGNoYW5nZSBldmVudC5cbiAgICAgIC8vIFRoZSBjaGFuZ2UgaGFuZGxlciBpcyBkZWxheWVkIHRvIGJyZWFrIHRoZSByYWNlIHdpdGggdGhlIGBEaWZmVmlld01vZGVsYCBzdWJzY3JpcHRpb24uXG4gICAgICBjb25zdCBjaGFuZ2VQYXRoc1N1YnNjcmlwdGlvbiA9IGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKCgpID0+IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAvLyB0cnkvY2F0Y2ggaGVyZSBiZWNhdXNlIGluIGNhc2Ugb2YgYW55IGVycm9yLCBBdG9tIHN0b3BzIGRpc3BhdGNoaW5nIGV2ZW50cyB0byB0aGVcbiAgICAgICAgLy8gcmVzdCBvZiB0aGUgbGlzdGVuZXJzLCB3aGljaCBjYW4gc3RvcCB0aGUgcmVtb3RlIGVkaXRpbmcgZnJvbSBiZWluZyBmdW5jdGlvbmFsLlxuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChwcm9qZWN0c0NvbnRhaW5QYXRoKGFjdGl2ZUZpbGVQYXRoKSkge1xuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbihmb3JtYXREaWZmVmlld1VybCh7ZmlsZTogYWN0aXZlRmlsZVBhdGh9KSk7XG4gICAgICAgICAgICBjaGFuZ2VQYXRoc1N1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgICBpbnZhcmlhbnQoc3Vic2NyaXB0aW9ucyk7XG4gICAgICAgICAgICBzdWJzY3JpcHRpb25zLnJlbW92ZShjaGFuZ2VQYXRoc1N1YnNjcmlwdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoJ0RpZmZWaWV3IHJlc3RvcmUgZXJyb3InLCBlKTtcbiAgICAgICAgfVxuICAgICAgfSwgMTApKTtcbiAgICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKGNoYW5nZVBhdGhzU3Vic2NyaXB0aW9uKTtcbiAgICB9KSk7XG4gIH0sXG5cbiAgY29uc3VtZU91dHB1dFNlcnZpY2UoYXBpOiBPdXRwdXRTZXJ2aWNlKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiBhcGkucmVnaXN0ZXJPdXRwdXRQcm92aWRlcih7XG4gICAgICBzb3VyY2U6ICdkaWZmIHZpZXcnLFxuICAgICAgbWVzc2FnZXM6IGdldERpZmZWaWV3TW9kZWwoKS5nZXRNZXNzYWdlcygpLFxuICAgIH0pO1xuICB9LFxuXG4gIGNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXI6IChncm91cDogc3RyaW5nKSA9PiBPYmplY3QpOiB2b2lkIHtcbiAgICB0b29sQmFyID0gZ2V0VG9vbEJhcignbnVjbGlkZS1kaWZmLXZpZXcnKTtcbiAgICBjb25zdCBidXR0b24gPSB0b29sQmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiAnZ2l0LWJyYW5jaCcsXG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtZGlmZi12aWV3Om9wZW4nLFxuICAgICAgdG9vbHRpcDogJ09wZW4gRGlmZiBWaWV3JyxcbiAgICAgIHByaW9yaXR5OiAzMDAsXG4gICAgfSlbMF07XG4gICAgY29uc3QgZGlmZk1vZGVsID0gZ2V0RGlmZlZpZXdNb2RlbCgpO1xuICAgIHVwZGF0ZVRvb2xiYXJDb3VudChidXR0b24sIGRpZmZNb2RlbC5nZXRTdGF0ZSgpLmRpcnR5RmlsZUNoYW5nZXMuc2l6ZSk7XG4gICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGRpZmZNb2RlbC5vbkRpZFVwZGF0ZVN0YXRlKCgpID0+IHtcbiAgICAgIHVwZGF0ZVRvb2xiYXJDb3VudChidXR0b24sIGRpZmZNb2RlbC5nZXRTdGF0ZSgpLmRpcnR5RmlsZUNoYW5nZXMuc2l6ZSk7XG4gICAgfSkpO1xuICB9LFxuXG4gIGdldEhvbWVGcmFnbWVudHMoKTogSG9tZUZyYWdtZW50cyB7XG4gICAgY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZlYXR1cmU6IHtcbiAgICAgICAgdGl0bGU6ICdEaWZmIFZpZXcnLFxuICAgICAgICBpY29uOiAnZ2l0LWJyYW5jaCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAoXG4gICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICBMYXVuY2hlcyBhbiBlZGl0YWJsZSBzaWRlLWJ5LXNpZGUgdmlldyBvZiB0aGUgb3V0cHV0IG9mIHRoZSBNZXJjdXJpYWxcbiAgICAgICAgICAgIDxjb2RlPmhnIGRpZmY8L2NvZGU+IGNvbW1hbmQsIHNob3dpbmcgcGVuZGluZyBjaGFuZ2VzIHRvIGJlIGNvbW1pdHRlZC5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICksXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWRpZmYtdmlldzpvcGVuJyxcbiAgICAgIH0sXG4gICAgICBwcmlvcml0eTogMyxcbiAgICB9O1xuICB9LFxuXG4gIHNlcmlhbGl6ZSgpOiA/T2JqZWN0IHtcbiAgICBpZiAoIWFjdGl2ZURpZmZWaWV3IHx8ICFkaWZmVmlld01vZGVsKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSBkaWZmVmlld01vZGVsLmdldEFjdGl2ZUZpbGVTdGF0ZSgpO1xuICAgIHJldHVybiB7XG4gICAgICBhY3RpdmVGaWxlUGF0aDogZmlsZVBhdGgsXG4gICAgfTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIHVpUHJvdmlkZXJzLnNwbGljZSgwKTtcbiAgICBpZiAoc3Vic2NyaXB0aW9ucyAhPSBudWxsKSB7XG4gICAgICBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHN1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoZGlmZlZpZXdNb2RlbCAhPSBudWxsKSB7XG4gICAgICBkaWZmVmlld01vZGVsLmRpc3Bvc2UoKTtcbiAgICAgIGRpZmZWaWV3TW9kZWwgPSBudWxsO1xuICAgIH1cbiAgICBhY3RpdmVEaWZmVmlldyA9IG51bGw7XG4gICAgaWYgKHRvb2xCYXIgIT0gbnVsbCkge1xuICAgICAgdG9vbEJhci5yZW1vdmVJdGVtcygpO1xuICAgICAgdG9vbEJhciA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBUaGUgZGlmZi12aWV3IHBhY2thZ2UgY2FuIGNvbnN1bWUgcHJvdmlkZXJzIHRoYXQgcmV0dXJuIFJlYWN0IGNvbXBvbmVudHMgdG9cbiAgICogYmUgcmVuZGVyZWQgaW5saW5lLlxuICAgKiBBIHVpUHJvdmlkZXIgbXVzdCBoYXZlIGEgbWV0aG9kIGNvbXBvc2VVaUVsZW1lbnRzIHdpdGggdGhlIGZvbGxvd2luZyBzcGVjOlxuICAgKiBAcGFyYW0gZmlsZVBhdGggVGhlIHBhdGggb2YgdGhlIGZpbGUgdGhlIGRpZmYgdmlldyBpcyBvcGVuZWQgZm9yXG4gICAqIEByZXR1cm4gQW4gYXJyYXkgb2YgSW5saW5lQ29tbWVudHMgKGRlZmluZWQgYWJvdmUpIHRvIGJlIHJlbmRlcmVkIGludG8gdGhlXG4gICAqICAgICAgICAgZGlmZiB2aWV3XG4gICAqL1xuICBjb25zdW1lUHJvdmlkZXIocHJvdmlkZXI6IE9iamVjdCkge1xuICAgIC8vIFRPRE8obW9zdCk6IEZpeCBVSSByZW5kZXJpbmcgYW5kIHJlLWludHJvZHVjZTogdDgxNzQzMzJcbiAgICAvLyB1aVByb3ZpZGVycy5wdXNoKHByb3ZpZGVyKTtcbiAgICByZXR1cm47XG4gIH0sXG5cbiAgY29uc3VtZUN3ZEFwaShhcGk6IEN3ZEFwaSk6IHZvaWQge1xuICAgIGN3ZEFwaSA9IGFwaTtcbiAgfSxcblxuICBnZXQgX190ZXN0RGlmZlZpZXcoKSB7XG4gICAgcmV0dXJuIGFjdGl2ZURpZmZWaWV3O1xuICB9LFxufTtcbiJdfQ==