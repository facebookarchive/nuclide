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

    function getTargetFromEvent(event) {
      // Event target isn't necessarily an HTMLElement,

      var target = event.currentTarget;
      return target.classList.contains('name') ? target : target.querySelector('.name');
    }

    // Listen for file tree context menu file item events to open the diff view.
    subscriptions.add(atom.commands.add('.tree-view .entry.file.list-item', 'nuclide-diff-view:open-context', function (event) {
      var target = getTargetFromEvent(event);
      atom.workspace.open(NUCLIDE_DIFF_VIEW_URI + (target.dataset.path || ''));
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
      var changePathsSubscription = atom.project.onDidChangePaths(function () {
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
// but that's guranteed in the usages here.
//# sourceMappingURL=data:application/json;base64,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RSxXQUFXO0FBQ2xCLFlBQUksRUFBRSxZQUFZO0FBQ2xCLG1CQUFXLEVBQ1Q7Ozs7VUFFRTs7OztXQUFvQjs7U0FDZixBQUNSO0FBQ0QsZUFBTyxFQUFFLHdCQUF3QjtPQUNsQztBQUNELGNBQVEsRUFBRSxDQUFDO0tBQ1osQ0FBQztHQUNIOztBQUVELFdBQVMsRUFBQSxxQkFBWTtBQUNuQixRQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3JDLGFBQU8sRUFBRSxDQUFDO0tBQ1g7OzRDQUNrQixhQUFhLENBQUMsa0JBQWtCLEVBQUU7O1FBQTlDLFFBQVEscUNBQVIsUUFBUTs7QUFDZixXQUFPO0FBQ0wsb0JBQWMsRUFBRSxRQUFRO0tBQ3pCLENBQUM7R0FDSDs7QUFFRCxZQUFVLEVBQUEsc0JBQVM7QUFDakIsZUFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QixRQUFJLGFBQWEsSUFBSSxJQUFJLEVBQUU7QUFDekIsbUJBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN4QixtQkFBYSxHQUFHLElBQUksQ0FBQztLQUN0QjtBQUNELFFBQUksYUFBYSxJQUFJLElBQUksRUFBRTtBQUN6QixtQkFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3hCLG1CQUFhLEdBQUcsSUFBSSxDQUFDO0tBQ3RCO0FBQ0Qsa0JBQWMsR0FBRyxJQUFJLENBQUM7QUFDdEIsUUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO0FBQ25CLGFBQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN0QixhQUFPLEdBQUcsSUFBSSxDQUFDO0tBQ2hCO0dBQ0Y7Ozs7Ozs7Ozs7QUFVRCxpQkFBZSxFQUFBLHlCQUFDLFFBQWdCLEVBQUU7OztBQUdoQyxXQUFPO0dBQ1I7Q0FDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SG9tZUZyYWdtZW50c30gZnJvbSAnLi4vLi4vaG9tZS1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWxUeXBlIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgbnVjbGlkZUZlYXR1cmVzIGZyb20gJy4uLy4uLy4uLy4uL2xpYi9udWNsaWRlRmVhdHVyZXMnO1xuXG5sZXQgZGlmZlZpZXdNb2RlbDogP0RpZmZWaWV3TW9kZWxUeXBlID0gbnVsbDtcbmxldCBhY3RpdmVEaWZmVmlldzogP3tcbiAgY29tcG9uZW50OiBSZWFjdENvbXBvbmVudDtcbiAgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG59ICA9IG51bGw7XG5cbi8vIFRoaXMgdXJsIHN0eWxlIGlzIHRoZSBvbmUgQXRvbSB1c2VzIGZvciB0aGUgd2VsY29tZSBhbmQgc2V0dGluZ3MgcGFnZXMuXG5jb25zdCBOVUNMSURFX0RJRkZfVklFV19VUkkgPSAnYXRvbTovL251Y2xpZGUvZGlmZi12aWV3JztcbmNvbnN0IHVpUHJvdmlkZXJzID0gW107XG5cbmxldCBzdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZSA9IG51bGw7XG5sZXQgdG9vbEJhcjogP2FueSA9IG51bGw7XG5sZXQgY2hhbmdlQ291bnRFbGVtZW50OiA/SFRNTEVsZW1lbnQgPSBudWxsO1xubGV0IGxvZ2dlciA9IG51bGw7XG5cbmZ1bmN0aW9uIGdldExvZ2dlcigpIHtcbiAgcmV0dXJuIGxvZ2dlciB8fCAobG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpKTtcbn1cblxuLy8gVG8gYWRkIGEgVmlldyBhcyBhbiBBdG9tIHdvcmtzcGFjZSBwYW5lLCB3ZSByZXR1cm4gYERpZmZWaWV3RWxlbWVudGAgd2hpY2ggZXh0ZW5kcyBgSFRNTEVsZW1lbnRgLlxuLy8gVGhpcyBwYXR0ZXRuIGlzIGFsc28gZm9sbG93ZWQgd2l0aCBhdG9tJ3MgVGV4dEVkaXRvci5cbmZ1bmN0aW9uIGNyZWF0ZVZpZXcoZW50cnlQYXRoOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB7XG4gIGlmIChhY3RpdmVEaWZmVmlldykge1xuICAgIGFjdGl2YXRlRmlsZVBhdGgoZW50cnlQYXRoKTtcbiAgICByZXR1cm4gYWN0aXZlRGlmZlZpZXcuZWxlbWVudDtcbiAgfVxuXG4gIGNvbnN0IHtcbiAgICBSZWFjdCxcbiAgICBSZWFjdERPTSxcbiAgfSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG4gIGNvbnN0IERpZmZWaWV3RWxlbWVudCA9IHJlcXVpcmUoJy4vRGlmZlZpZXdFbGVtZW50Jyk7XG4gIGNvbnN0IERpZmZWaWV3Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9EaWZmVmlld0NvbXBvbmVudCcpO1xuXG4gIGNvbnN0IGRpZmZNb2RlbCA9IGdldERpZmZWaWV3TW9kZWwoKTtcbiAgY29uc3QgaG9zdEVsZW1lbnQgPSBuZXcgRGlmZlZpZXdFbGVtZW50KCkuaW5pdGlhbGl6ZShkaWZmTW9kZWwsIE5VQ0xJREVfRElGRl9WSUVXX1VSSSk7XG4gIGNvbnN0IGNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICA8RGlmZlZpZXdDb21wb25lbnQgZGlmZk1vZGVsPXtkaWZmTW9kZWx9Lz4sXG4gICAgaG9zdEVsZW1lbnQsXG4gICk7XG4gIGFjdGl2ZURpZmZWaWV3ID0ge1xuICAgIGNvbXBvbmVudCxcbiAgICBlbGVtZW50OiBob3N0RWxlbWVudCxcbiAgfTtcbiAgZGlmZk1vZGVsLmFjdGl2YXRlKCk7XG4gIGFjdGl2YXRlRmlsZVBhdGgoZW50cnlQYXRoKTtcblxuICBjb25zdCBkZXN0cm95U3Vic2NyaXB0aW9uID0gaG9zdEVsZW1lbnQub25EaWREZXN0cm95KCgpID0+IHtcbiAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKGhvc3RFbGVtZW50KTtcbiAgICBkaWZmTW9kZWwuZGVhY3RpdmF0ZSgpO1xuICAgIGRlc3Ryb3lTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgICBzdWJzY3JpcHRpb25zLnJlbW92ZShkZXN0cm95U3Vic2NyaXB0aW9uKTtcbiAgICBhY3RpdmVEaWZmVmlldyA9IG51bGw7XG4gIH0pO1xuXG4gIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAgc3Vic2NyaXB0aW9ucy5hZGQoZGVzdHJveVN1YnNjcmlwdGlvbik7XG5cbiAgY29uc3Qge3RyYWNrfSA9IHJlcXVpcmUoJy4uLy4uL2FuYWx5dGljcycpO1xuICB0cmFjaygnZGlmZi12aWV3LW9wZW4nKTtcblxuICByZXR1cm4gaG9zdEVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGdldERpZmZWaWV3TW9kZWwoKTogRGlmZlZpZXdNb2RlbFR5cGUge1xuICBpZiAoIWRpZmZWaWV3TW9kZWwpIHtcbiAgICBjb25zdCBEaWZmVmlld01vZGVsID0gcmVxdWlyZSgnLi9EaWZmVmlld01vZGVsJyk7XG4gICAgZGlmZlZpZXdNb2RlbCA9IG5ldyBEaWZmVmlld01vZGVsKHVpUHJvdmlkZXJzKTtcbiAgICBpbnZhcmlhbnQoc3Vic2NyaXB0aW9ucyk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoZGlmZlZpZXdNb2RlbCk7XG4gIH1cbiAgcmV0dXJuIGRpZmZWaWV3TW9kZWw7XG59XG5cbmZ1bmN0aW9uIGFjdGl2YXRlRmlsZVBhdGgoZmlsZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICBpZiAoIWZpbGVQYXRoLmxlbmd0aCB8fCAhZGlmZlZpZXdNb2RlbCkge1xuICAgIC8vIFRoZSBEaWZmIFZpZXcgY291bGQgYmUgb3BlbmVkIHdpdGggbm8gcGF0aCBhdCBhbGwuXG4gICAgcmV0dXJuO1xuICB9XG4gIGRpZmZWaWV3TW9kZWwuYWN0aXZhdGVGaWxlKGZpbGVQYXRoKTtcbn1cblxuZnVuY3Rpb24gcHJvamVjdHNDb250YWluUGF0aChjaGVja1BhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCB7aXNSZW1vdGV9ID0gcmVxdWlyZSgnLi4vLi4vcmVtb3RlLXVyaScpO1xuICBjb25zdCB7RGlyZWN0b3J5fSA9IHJlcXVpcmUoJ2F0b20nKTtcbiAgcmV0dXJuIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLnNvbWUoZGlyZWN0b3J5ID0+IHtcbiAgICBjb25zdCBkaXJlY3RvcnlQYXRoID0gZGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgICBpZiAoIWNoZWNrUGF0aC5zdGFydHNXaXRoKGRpcmVjdG9yeVBhdGgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIElmIHRoZSByZW1vdGUgZGlyZWN0b3J5IGhhc24ndCB5ZXQgbG9hZGVkLlxuICAgIGlmIChpc1JlbW90ZShjaGVja1BhdGgpICYmIGRpcmVjdG9yeSBpbnN0YW5jZW9mIERpcmVjdG9yeSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVRvb2xiYXJDb3VudChkaWZmVmlld0J1dHRvbjogSFRNTEVsZW1lbnQsIGNvdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgaWYgKCFjaGFuZ2VDb3VudEVsZW1lbnQpIHtcbiAgICBjaGFuZ2VDb3VudEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgY2hhbmdlQ291bnRFbGVtZW50LmNsYXNzTmFtZSA9ICdkaWZmLXZpZXctY291bnQnO1xuICAgIGRpZmZWaWV3QnV0dG9uLmFwcGVuZENoaWxkKGNoYW5nZUNvdW50RWxlbWVudCk7XG4gIH1cbiAgaWYgKGNvdW50ID4gMCkge1xuICAgIGRpZmZWaWV3QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3Bvc2l0aXZlLWNvdW50Jyk7XG4gIH0gZWxzZSB7XG4gICAgZGlmZlZpZXdCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgncG9zaXRpdmUtY291bnQnKTtcbiAgfVxuICBjb25zdCB7XG4gICAgUmVhY3QsXG4gICAgUmVhY3RET00sXG4gIH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuICBjb25zdCBEaWZmQ291bnRDb21wb25lbnQgPSByZXF1aXJlKCcuL0RpZmZDb3VudENvbXBvbmVudCcpO1xuICBSZWFjdERPTS5yZW5kZXIoPERpZmZDb3VudENvbXBvbmVudCBjb3VudD17Y291bnR9Lz4sIGNoYW5nZUNvdW50RWxlbWVudCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGFjdGl2YXRlKHN0YXRlOiA/YW55KTogdm9pZCB7XG4gICAgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgLy8gTGlzdGVuIGZvciBtZW51IGl0ZW0gd29ya3NwYWNlIGRpZmYgdmlldyBvcGVuIGNvbW1hbmQuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ251Y2xpZGUtZGlmZi12aWV3Om9wZW4nLFxuICAgICAgKCkgPT4gYXRvbS53b3Jrc3BhY2Uub3BlbihOVUNMSURFX0RJRkZfVklFV19VUkkpXG4gICAgKSk7XG4gICAgLy8gTGlzdGVuIGZvciBpbi1lZGl0b3IgY29udGV4dCBtZW51IGl0ZW0gZGlmZiB2aWV3IG9wZW4gY29tbWFuZC5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdudWNsaWRlLWRpZmYtdmlldzpvcGVuJyxcbiAgICAgICgpID0+IHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgICBpZiAoIWVkaXRvcikge1xuICAgICAgICAgIHJldHVybiBnZXRMb2dnZXIoKS53YXJuKCdObyBhY3RpdmUgdGV4dCBlZGl0b3IgZm9yIGRpZmYgdmlldyEnKTtcbiAgICAgICAgfVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKE5VQ0xJREVfRElGRl9WSUVXX1VSSSArIChlZGl0b3IuZ2V0UGF0aCgpIHx8ICcnKSk7XG4gICAgICB9XG4gICAgKSk7XG5cbiAgICBmdW5jdGlvbiBnZXRUYXJnZXRGcm9tRXZlbnQoZXZlbnQ6IEV2ZW50KTogSFRNTEVsZW1lbnQge1xuICAgICAgLy8gRXZlbnQgdGFyZ2V0IGlzbid0IG5lY2Vzc2FyaWx5IGFuIEhUTUxFbGVtZW50LFxuICAgICAgLy8gYnV0IHRoYXQncyBndXJhbnRlZWQgaW4gdGhlIHVzYWdlcyBoZXJlLlxuICAgICAgY29uc3QgdGFyZ2V0OiBIVE1MRWxlbWVudCA9IChldmVudC5jdXJyZW50VGFyZ2V0OiBhbnkpO1xuICAgICAgcmV0dXJuIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ25hbWUnKVxuICAgICAgICA/IHRhcmdldFxuICAgICAgICA6IHRhcmdldC5xdWVyeVNlbGVjdG9yKCcubmFtZScpO1xuICAgIH1cblxuICAgIC8vIExpc3RlbiBmb3IgZmlsZSB0cmVlIGNvbnRleHQgbWVudSBmaWxlIGl0ZW0gZXZlbnRzIHRvIG9wZW4gdGhlIGRpZmYgdmlldy5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICcudHJlZS12aWV3IC5lbnRyeS5maWxlLmxpc3QtaXRlbScsXG4gICAgICAnbnVjbGlkZS1kaWZmLXZpZXc6b3Blbi1jb250ZXh0JyxcbiAgICAgIChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBnZXRUYXJnZXRGcm9tRXZlbnQoZXZlbnQpO1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKE5VQ0xJREVfRElGRl9WSUVXX1VSSSArICh0YXJnZXQuZGF0YXNldC5wYXRoIHx8ICcnKSk7XG4gICAgICB9XG4gICAgKSk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgJy50cmVlLXZpZXcgLmVudHJ5LmZpbGUubGlzdC1pdGVtJzogW1xuICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdPcGVuIGluIERpZmYgVmlldycsXG4gICAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZGlmZi12aWV3Om9wZW4tY29udGV4dCcsXG4gICAgICAgIH0sXG4gICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICBdLFxuICAgIH0pKTtcblxuICAgIC8vIExpc3RlbiBmb3IgZmlsZSB0cmVlIGNvbnRleHQgbWVudSBkaXJlY3RvcnkgaXRlbSBldmVudHMgdG8gb3BlbiB0aGUgZGlmZiB2aWV3LlxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJy50cmVlLXZpZXcgLmVudHJ5LmRpcmVjdG9yeS5saXN0LW5lc3RlZC1pdGVtJyxcbiAgICAgICdudWNsaWRlLWRpZmYtdmlldzpvcGVuLWNvbnRleHQnLFxuICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oTlVDTElERV9ESUZGX1ZJRVdfVVJJKTtcbiAgICAgIH1cbiAgICApKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbnRleHRNZW51LmFkZCh7XG4gICAgICAnLnRyZWUtdmlldyAuZW50cnkuZGlyZWN0b3J5Lmxpc3QtbmVzdGVkLWl0ZW0nOiBbXG4gICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRGlmZiBWaWV3JyxcbiAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXZpZXc6b3Blbi1jb250ZXh0JyxcbiAgICAgICAgfSxcbiAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgLy8gVGhlIERpZmYgVmlldyB3aWxsIG9wZW4gaXRzIG1haW4gVUkgaW4gYSB0YWIsIGxpa2UgQXRvbSdzIHByZWZlcmVuY2VzIGFuZCB3ZWxjb21lIHBhZ2VzLlxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLmFkZE9wZW5lcih1cmkgPT4ge1xuICAgICAgaWYgKHVyaS5zdGFydHNXaXRoKE5VQ0xJREVfRElGRl9WSUVXX1VSSSkpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVZpZXcodXJpLnNsaWNlKE5VQ0xJREVfRElGRl9WSUVXX1VSSS5sZW5ndGgpKTtcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICBpZiAoIXN0YXRlIHx8ICFzdGF0ZS5hY3RpdmVGaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFdhaXQgZm9yIGFsbCBzb3VyY2UgY29udHJvbCBwcm92aWRlcnMgdG8gcmVnaXN0ZXIuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQobnVjbGlkZUZlYXR1cmVzLm9uRGlkQWN0aXZhdGVJbml0aWFsRmVhdHVyZXMoKCkgPT4ge1xuICAgICAgaW52YXJpYW50KHN0YXRlKTtcbiAgICAgIGNvbnN0IHthY3RpdmVGaWxlUGF0aH0gPSBzdGF0ZTtcblxuICAgICAgLy8gSWYgaXQncyBhIGxvY2FsIGRpcmVjdG9yeSwgaXQgbXVzdCBiZSBsb2FkZWQgd2l0aCBwYWNrYWdlcyBhY3RpdmF0aW9uLlxuICAgICAgaWYgKHByb2plY3RzQ29udGFpblBhdGgoYWN0aXZlRmlsZVBhdGgpKSB7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oTlVDTElERV9ESUZGX1ZJRVdfVVJJICsgYWN0aXZlRmlsZVBhdGgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBJZiBpdCdzIGEgcmVtb3RlIGRpcmVjdG9yeSwgaXQgc2hvdWxkIGNvbWUgb24gYSBwYXRoIGNoYW5nZSBldmVudC5cbiAgICAgIGNvbnN0IGNoYW5nZVBhdGhzU3Vic2NyaXB0aW9uID0gYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT4ge1xuICAgICAgICAvLyB0cnkvY2F0Y2ggaGVyZSBiZWNhdXNlIGluIGNhc2Ugb2YgYW55IGVycm9yLCBBdG9tIHN0b3BzIGRpc3BhdGNoaW5nIGV2ZW50cyB0byB0aGVcbiAgICAgICAgLy8gcmVzdCBvZiB0aGUgbGlzdGVuZXJzLCB3aGljaCBjYW4gc3RvcCB0aGUgcmVtb3RlIGVkaXRpbmcgZnJvbSBiZWluZyBmdW5jdGlvbmFsLlxuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChwcm9qZWN0c0NvbnRhaW5QYXRoKGFjdGl2ZUZpbGVQYXRoKSkge1xuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihOVUNMSURFX0RJRkZfVklFV19VUkkgKyBhY3RpdmVGaWxlUGF0aCk7XG4gICAgICAgICAgICBjaGFuZ2VQYXRoc1N1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgICBpbnZhcmlhbnQoc3Vic2NyaXB0aW9ucyk7XG4gICAgICAgICAgICBzdWJzY3JpcHRpb25zLnJlbW92ZShjaGFuZ2VQYXRoc1N1YnNjcmlwdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoJ0RpZmZWaWV3IHJlc3RvcmUgZXJyb3InLCBlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpbnZhcmlhbnQoc3Vic2NyaXB0aW9ucyk7XG4gICAgICBzdWJzY3JpcHRpb25zLmFkZChjaGFuZ2VQYXRoc1N1YnNjcmlwdGlvbik7XG4gICAgfSkpO1xuICB9LFxuXG4gIGNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXI6IChncm91cDogc3RyaW5nKSA9PiBPYmplY3QpOiB2b2lkIHtcbiAgICB0b29sQmFyID0gZ2V0VG9vbEJhcignbnVjbGlkZS1kaWZmLXZpZXcnKTtcbiAgICBjb25zdCBidXR0b24gPSB0b29sQmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiAnZ2l0LWJyYW5jaCcsXG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtZGlmZi12aWV3Om9wZW4nLFxuICAgICAgdG9vbHRpcDogJ09wZW4gRGlmZiBWaWV3JyxcbiAgICAgIHByaW9yaXR5OiAzMDAsXG4gICAgfSlbMF07XG4gICAgY29uc3QgZGlmZk1vZGVsID0gZ2V0RGlmZlZpZXdNb2RlbCgpO1xuICAgIHVwZGF0ZVRvb2xiYXJDb3VudChidXR0b24sIGRpZmZNb2RlbC5nZXREaXJ0eUZpbGVDaGFuZ2VzKCkuc2l6ZSk7XG4gICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGRpZmZNb2RlbC5vbkRpZENoYW5nZURpcnR5U3RhdHVzKGRpcnR5RmlsZUNoYW5nZXMgPT4ge1xuICAgICAgdXBkYXRlVG9vbGJhckNvdW50KGJ1dHRvbiwgZGlydHlGaWxlQ2hhbmdlcy5zaXplKTtcbiAgICB9KSk7XG4gIH0sXG5cbiAgZ2V0SG9tZUZyYWdtZW50cygpOiBIb21lRnJhZ21lbnRzIHtcbiAgICBjb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbiAgICByZXR1cm4ge1xuICAgICAgZmVhdHVyZToge1xuICAgICAgICB0aXRsZTogJ0RpZmYgVmlldycsXG4gICAgICAgIGljb246ICdnaXQtYnJhbmNoJyxcbiAgICAgICAgZGVzY3JpcHRpb246IChcbiAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIExhdW5jaGVzIGFuIGVkaXRhYmxlIHNpZGUtYnktc2lkZSB2aWV3IG9mIHRoZSBvdXRwdXQgb2YgdGhlIE1lcmN1cmlhbFxuICAgICAgICAgICAgPGNvZGU+aGcgZGlmZjwvY29kZT4gY29tbWFuZCwgc2hvd2luZyBwZW5kaW5nIGNoYW5nZXMgdG8gYmUgY29tbWl0dGVkLlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKSxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZGlmZi12aWV3Om9wZW4nLFxuICAgICAgfSxcbiAgICAgIHByaW9yaXR5OiAzLFxuICAgIH07XG4gIH0sXG5cbiAgc2VyaWFsaXplKCk6ID9PYmplY3Qge1xuICAgIGlmICghYWN0aXZlRGlmZlZpZXcgfHwgIWRpZmZWaWV3TW9kZWwpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IGRpZmZWaWV3TW9kZWwuZ2V0QWN0aXZlRmlsZVN0YXRlKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFjdGl2ZUZpbGVQYXRoOiBmaWxlUGF0aCxcbiAgICB9O1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdWlQcm92aWRlcnMuc3BsaWNlKDApO1xuICAgIGlmIChzdWJzY3JpcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICAgIGlmIChkaWZmVmlld01vZGVsICE9IG51bGwpIHtcbiAgICAgIGRpZmZWaWV3TW9kZWwuZGlzcG9zZSgpO1xuICAgICAgZGlmZlZpZXdNb2RlbCA9IG51bGw7XG4gICAgfVxuICAgIGFjdGl2ZURpZmZWaWV3ID0gbnVsbDtcbiAgICBpZiAodG9vbEJhciAhPSBudWxsKSB7XG4gICAgICB0b29sQmFyLnJlbW92ZUl0ZW1zKCk7XG4gICAgICB0b29sQmFyID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFRoZSBkaWZmLXZpZXcgcGFja2FnZSBjYW4gY29uc3VtZSBwcm92aWRlcnMgdGhhdCByZXR1cm4gUmVhY3QgY29tcG9uZW50cyB0b1xuICAgKiBiZSByZW5kZXJlZCBpbmxpbmUuXG4gICAqIEEgdWlQcm92aWRlciBtdXN0IGhhdmUgYSBtZXRob2QgY29tcG9zZVVpRWxlbWVudHMgd2l0aCB0aGUgZm9sbG93aW5nIHNwZWM6XG4gICAqIEBwYXJhbSBmaWxlUGF0aCBUaGUgcGF0aCBvZiB0aGUgZmlsZSB0aGUgZGlmZiB2aWV3IGlzIG9wZW5lZCBmb3JcbiAgICogQHJldHVybiBBbiBhcnJheSBvZiBJbmxpbmVDb21tZW50cyAoZGVmaW5lZCBhYm92ZSkgdG8gYmUgcmVuZGVyZWQgaW50byB0aGVcbiAgICogICAgICAgICBkaWZmIHZpZXdcbiAgICovXG4gIGNvbnN1bWVQcm92aWRlcihwcm92aWRlcjogT2JqZWN0KSB7XG4gICAgLy8gVE9ETyhtb3N0KTogRml4IFVJIHJlbmRlcmluZyBhbmQgcmUtaW50cm9kdWNlOiB0ODE3NDMzMlxuICAgIC8vIHVpUHJvdmlkZXJzLnB1c2gocHJvdmlkZXIpO1xuICAgIHJldHVybjtcbiAgfSxcbn07XG4iXX0=