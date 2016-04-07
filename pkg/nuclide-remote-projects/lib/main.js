var createRemoteConnection = _asyncToGenerator(function* (remoteProjectConfig) {
  var host = remoteProjectConfig.host;
  var cwd = remoteProjectConfig.cwd;
  var displayTitle = remoteProjectConfig.displayTitle;

  var connection = _nuclideRemoteConnection.RemoteConnection.getByHostnameAndPath(host, cwd);
  if (connection != null) {
    return connection;
  }

  connection = yield _nuclideRemoteConnection.RemoteConnection.createConnectionBySavedConfig(host, cwd, displayTitle);
  if (connection != null) {
    return connection;
  }

  // If connection fails using saved config, open connect dialog.

  var _require = require('../../nuclide-ssh-dialog');

  var openConnectionDialog = _require.openConnectionDialog;

  return openConnectionDialog({
    initialServer: remoteProjectConfig.host,
    initialCwd: remoteProjectConfig.cwd
  });
});

/**
 * The same TextEditor must be returned to prevent Atom from creating multiple tabs
 * for the same file, because Atom doesn't cache pending opener promises.
 */

var createEditorForNuclide = _asyncToGenerator(function* (connection, uri) {
  try {
    var buffer = yield (0, _nuclideAtomHelpers.loadBufferForUri)(uri);
    return (0, _nuclideAtomHelpers.createTextEditor)({ buffer: buffer });
  } catch (err) {
    logger.warn('buffer load issue:', err);
    atom.notifications.addError('Failed to open ' + uri + ': ' + err.message);
    throw err;
  }
}

/**
 * Check if the remote buffer has already been initialized in editor.
 * This checks if the buffer is instance of NuclideTextBuffer.
 */
);

var reloadRemoteProjects = _asyncToGenerator(function* (remoteProjects) {
  // This is intentionally serial.
  // The 90% use case is to have multiple remote projects for a single connection;
  // after the first one succeeds the rest should require no user action.
  for (var config of remoteProjects) {
    /* eslint-disable babel/no-await-in-loop */
    var connection = yield createRemoteConnection(config);
    if (!connection) {
      logger.info('No RemoteConnection returned on restore state trial:', config.host, config.cwd);
    } else {
      // It's fine the user connected to a different project on the same host:
      // we should still be able to restore this using the new connection.
      var _cwd = config.cwd;
      var _host = config.host;
      var _displayTitle = config.displayTitle;

      if (connection.getPathForInitialWorkingDirectory() !== _cwd && connection.getRemoteHostname() === _host) {
        yield _nuclideRemoteConnection.RemoteConnection.createConnectionBySavedConfig(_host, _cwd, _displayTitle);
      }
    }
    /* eslint-enable babel/no-await-in-loop */
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _nuclideLogging = require('../../nuclide-logging');

var _utils = require('./utils');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

var logger = (0, _nuclideLogging.getLogger)();

/**
 * Stores the host and cwd of a remote connection.
 */

var packageSubscriptions = null;
var controller = null;

var CLOSE_PROJECT_DELAY_MS = 100;
var pendingFiles = {};

function createSerializableRemoteConnectionConfiguration(config) {
  return {
    host: config.host,
    cwd: config.cwd,
    displayTitle: config.displayTitle
  };
}

function addRemoteFolderToProject(connection) {
  var workingDirectoryUri = connection.getUriForInitialWorkingDirectory();
  // If restoring state, then the project already exists with local directory and wrong repo
  // instances. Hence, we remove it here, if existing, and add the new path for which we added a
  // workspace opener handler.
  atom.project.removePath(workingDirectoryUri);

  atom.project.addPath(workingDirectoryUri);

  var subscription = atom.project.onDidChangePaths(function () {
    // Delay closing the underlying socket connection until registered subscriptions have closed.
    // We should never depend on the order of registration of the `onDidChangePaths` event,
    // which also dispose consumed service's resources.
    setTimeout(checkClosedProject, CLOSE_PROJECT_DELAY_MS);
  });

  function checkClosedProject() {
    // The project paths may have changed during the delay time.
    // Hence, the latest project paths are fetched here.
    var paths = atom.project.getPaths();
    if (paths.indexOf(workingDirectoryUri) !== -1) {
      return;
    }
    // The project was removed from the tree.
    subscription.dispose();

    closeOpenFilesForRemoteProject(connection.getConfig());

    var hostname = connection.getRemoteHostname();
    if (_nuclideRemoteConnection.RemoteConnection.getByHostname(hostname).length > 1) {
      logger.info('Remaining remote projects using Nuclide Server - no prompt to shutdown');
      connection.close();
      return;
    }

    var buttons = ['Keep It', 'Shutdown'];
    var buttonToActions = new Map();

    buttonToActions.set(buttons[0], function () {
      return connection.close();
    });
    buttonToActions.set(buttons[1], _asyncToGenerator(function* () {
      yield connection.getService('InfoService').shutdownServer();
      connection.close();
      return;
    }));

    if (_nuclideFeatureConfig2['default'].get('nuclide-remote-projects.shutdownServerAfterDisconnection')) {
      // Atom takes the first button in the list as default option.
      buttons.reverse();
    }

    var choice = global.atom.confirm({
      message: 'No more remote projects on the host: \'' + hostname + '\'. Would you like to shutdown Nuclide server there?',
      buttons: buttons
    });

    var action = buttonToActions.get(buttons[choice]);
    (0, _assert2['default'])(action);
    action();
  }
}

function closeOpenFilesForRemoteProject(remoteProjectConfig) {
  var openInstances = (0, _utils.getOpenFileEditorForRemoteProject)(remoteProjectConfig);
  for (var openInstance of openInstances) {
    var editor = openInstance.editor;
    var pane = openInstance.pane;

    pane.removeItem(editor);
    editor.destroy();
  }
}

function getRemoteRootDirectories() {
  // TODO: Use nuclide-remote-uri instead.
  return atom.project.getDirectories().filter(function (directory) {
    return directory.getPath().startsWith('nuclide:');
  });
}

/**
 * Removes any Directory (not RemoteDirectory) objects that have Nuclide
 * remote URIs.
 */
function deleteDummyRemoteRootDirectories() {
  var _require2 = require('../../nuclide-remote-connection');

  var RemoteDirectory = _require2.RemoteDirectory;

  var _require3 = require('../../nuclide-remote-uri');

  var isRemote = _require3.isRemote;

  for (var directory of atom.project.getDirectories()) {
    if (isRemote(directory.getPath()) && !RemoteDirectory.isRemoteDirectory(directory)) {
      atom.project.removePath(directory.getPath());
    }
  }
}function isRemoteBufferInitialized(editor) {
  var buffer = editor.getBuffer();
  // $FlowIssue: https://github.com/facebook/flow/issues/1375
  if (buffer && buffer.constructor.name === 'NuclideTextBuffer') {
    return true;
  }
  return false;
}

module.exports = {
  activate: function activate(state) {
    var subscriptions = new _atom.CompositeDisposable();

    var RemoteProjectsController = require('./RemoteProjectsController');
    controller = new RemoteProjectsController();

    subscriptions.add(_nuclideRemoteConnection.RemoteConnection.onDidAddRemoteConnection(function (connection) {
      addRemoteFolderToProject(connection);

      // On Atom restart, it tries to open uri paths as local `TextEditor` pane items.
      // Here, Nuclide reloads the remote project files that have empty text editors open.
      var config = connection.getConfig();
      var openInstances = (0, _utils.getOpenFileEditorForRemoteProject)(config);

      var _loop = function (openInstance) {
        // Keep the original open editor item with a unique name until the remote buffer is loaded,
        // Then, we are ready to replace it with the remote tab in the same pane.
        var pane = openInstance.pane;
        var editor = openInstance.editor;
        var uri = openInstance.uri;
        var filePath = openInstance.filePath;

        // Skip restoring the editer who has remote content loaded.
        if (isRemoteBufferInitialized(editor)) {
          return 'continue';
        }

        // Here, a unique uri is picked to the pending open pane item to maintain the pane layout.
        // Otherwise, the open won't be completed because there exists a pane item with the same
        // uri.
        /* $FlowFixMe */
        editor.getBuffer().file.path = uri + '.to-close';
        // Cleanup the old pane item on successful opening or when no connection could be
        // established.
        var cleanupBuffer = function cleanupBuffer() {
          pane.removeItem(editor);
          editor.destroy();
        };
        if (filePath === config.cwd) {
          cleanupBuffer();
        } else {
          // If we clean up the buffer before the `openUriInPane` finishes,
          // the pane will be closed, because it could have no other items.
          // So we must clean up after.
          atom.workspace.openURIInPane(uri, pane).then(cleanupBuffer, cleanupBuffer);
        }
      };

      for (var openInstance of openInstances) {
        var _ret = _loop(openInstance);

        if (_ret === 'continue') continue;
      }
    }));

    subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-remote-projects:connect', function () {
      return require('../../nuclide-ssh-dialog').openConnectionDialog();
    }));

    // Subscribe opener before restoring the remote projects.
    subscriptions.add(atom.workspace.addOpener(function () {
      var uri = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      if (uri.startsWith('nuclide:')) {
        var connection = _nuclideRemoteConnection.RemoteConnection.getForUri(uri);
        // On Atom restart, it tries to open the uri path as a file tab because it's not a local
        // directory. We can't let that create a file with the initial working directory path.
        if (connection && uri !== connection.getUriForInitialWorkingDirectory()) {
          if (pendingFiles[uri]) {
            return pendingFiles[uri];
          }
          var textEditorPromise = pendingFiles[uri] = createEditorForNuclide(connection, uri);
          var removeFromCache = function removeFromCache() {
            return delete pendingFiles[uri];
          };
          textEditorPromise.then(removeFromCache, removeFromCache);
          return textEditorPromise;
        }
      }
    }));

    // If RemoteDirectoryProvider is called before this, and it failed
    // to provide a RemoteDirectory for a
    // given URI, Atom will create a generic Directory to wrap that. We want
    // to delete these instead, because those directories aren't valid/useful
    // if they are not true RemoteDirectory objects (connected to a real
    // real remote folder).
    deleteDummyRemoteRootDirectories();

    // Attempt to reload previously open projects.
    var remoteProjectsConfig = state && state.remoteProjectsConfig;
    if (remoteProjectsConfig != null) {
      reloadRemoteProjects(remoteProjectsConfig);
    }
    packageSubscriptions = subscriptions;
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    if (controller) {
      controller.consumeStatusBar(statusBar);
    }
  },

  // TODO: All of the elements of the array are non-null, but it does not seem possible to convince
  // Flow of that.
  serialize: function serialize() {
    var remoteProjectsConfig = getRemoteRootDirectories().map(function (directory) {
      var connection = _nuclideRemoteConnection.RemoteConnection.getForUri(directory.getPath());
      return connection ? createSerializableRemoteConnectionConfiguration(connection.getConfig()) : null;
    }).filter(function (config) {
      return config != null;
    });
    return {
      remoteProjectsConfig: remoteProjectsConfig
    };
  },

  deactivate: function deactivate() {
    if (packageSubscriptions) {
      packageSubscriptions.dispose();
      packageSubscriptions = null;
    }

    if (controller != null) {
      controller.destroy();
      controller = null;
    }
  },

  createRemoteDirectoryProvider: function createRemoteDirectoryProvider() {
    var RemoteDirectoryProvider = require('./RemoteDirectoryProvider');
    return new RemoteDirectoryProvider();
  },

  createRemoteDirectorySearcher: function createRemoteDirectorySearcher() {
    var _require4 = require('../../nuclide-client');

    var getServiceByNuclideUri = _require4.getServiceByNuclideUri;

    var _require5 = require('../../nuclide-remote-connection');

    var RemoteDirectory = _require5.RemoteDirectory;

    var RemoteDirectorySearcher = require('./RemoteDirectorySearcher');
    return new RemoteDirectorySearcher(function (dir) {
      var service = getServiceByNuclideUri('FindInProjectService', dir.getPath());
      (0, _assert2['default'])(service);
      return service;
    });
  },

  getHomeFragments: function getHomeFragments() {
    return {
      feature: {
        title: 'Remote Connection',
        icon: 'cloud-upload',
        description: 'Connect to a remote server to edit files.',
        command: 'nuclide-remote-projects:connect'
      },
      priority: 8
    };
  }

};
//# sourceMappingURL=data:application/json;base64,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QUF6RCxzQkFBc0IsYUFBdEIsc0JBQXNCOztvQkFDSCxPQUFPLENBQUMsaUNBQWlDLENBQUM7O1FBQTdELGVBQWUsYUFBZixlQUFlOztBQUN0QixRQUFNLHVCQUF1QixHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQ3JFLFdBQU8sSUFBSSx1QkFBdUIsQ0FBQyxVQUFDLEdBQUcsRUFBc0I7QUFDM0QsVUFBTSxPQUFPLEdBQUcsc0JBQXNCLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDOUUsK0JBQVUsT0FBTyxDQUFDLENBQUM7QUFDbkIsYUFBUSxPQUFPLENBQXdCO0tBQ3hDLENBQUMsQ0FBQztHQUNKOztBQUVELGtCQUFnQixFQUFBLDRCQUFrQjtBQUNoQyxXQUFPO0FBQ0wsYUFBTyxFQUFFO0FBQ1AsYUFBSyxFQUFFLG1CQUFtQjtBQUMxQixZQUFJLEVBQUUsY0FBYztBQUNwQixtQkFBVyxFQUFFLDJDQUEyQztBQUN4RCxlQUFPLEVBQUUsaUNBQWlDO09BQzNDO0FBQ0QsY0FBUSxFQUFFLENBQUM7S0FDWixDQUFDO0dBQ0g7O0NBRUYsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hvbWVGcmFnbWVudHN9IGZyb20gJy4uLy4uL251Y2xpZGUtaG9tZS1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtcbiAgUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24sXG59IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24vbGliL1JlbW90ZUNvbm5lY3Rpb24nO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSBSZW1vdGVEaXJlY3RvcnlQcm92aWRlclQgZnJvbSAnLi9SZW1vdGVEaXJlY3RvcnlQcm92aWRlcic7XG5pbXBvcnQgdHlwZSBSZW1vdGVEaXJlY3RvcnlTZWFyY2hlclQgZnJvbSAnLi9SZW1vdGVEaXJlY3RvcnlTZWFyY2hlcic7XG5pbXBvcnQgdHlwZSBSZW1vdGVQcm9qZWN0c0NvbnRyb2xsZXJUIGZyb20gJy4vUmVtb3RlUHJvamVjdHNDb250cm9sbGVyJztcbmltcG9ydCB0eXBlb2YgKiBhcyBGaW5kSW5Qcm9qZWN0U2VydmljZSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1zZWFyY2gnO1xuXG5pbXBvcnQge2NyZWF0ZVRleHRFZGl0b3IsIGxvYWRCdWZmZXJGb3JVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuaW1wb3J0IHtnZXRPcGVuRmlsZUVkaXRvckZvclJlbW90ZVByb2plY3R9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vbnVjbGlkZS1mZWF0dXJlLWNvbmZpZyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtSZW1vdGVDb25uZWN0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbi8qKlxuICogU3RvcmVzIHRoZSBob3N0IGFuZCBjd2Qgb2YgYSByZW1vdGUgY29ubmVjdGlvbi5cbiAqL1xudHlwZSBTZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbiA9IHtcbiAgaG9zdDogc3RyaW5nO1xuICBjd2Q6IHN0cmluZztcbiAgZGlzcGxheVRpdGxlOiBzdHJpbmc7XG59XG5cbmxldCBwYWNrYWdlU3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGUgPSBudWxsO1xubGV0IGNvbnRyb2xsZXI6ID9SZW1vdGVQcm9qZWN0c0NvbnRyb2xsZXJUID0gbnVsbDtcblxuY29uc3QgQ0xPU0VfUFJPSkVDVF9ERUxBWV9NUyA9IDEwMDtcbmNvbnN0IHBlbmRpbmdGaWxlcyA9IHt9O1xuXG5mdW5jdGlvbiBjcmVhdGVTZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbihcbiAgY29uZmlnOiBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbixcbik6IFNlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uIHtcbiAgcmV0dXJuIHtcbiAgICBob3N0OiBjb25maWcuaG9zdCxcbiAgICBjd2Q6IGNvbmZpZy5jd2QsXG4gICAgZGlzcGxheVRpdGxlOiBjb25maWcuZGlzcGxheVRpdGxlLFxuICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVSZW1vdGVDb25uZWN0aW9uKFxuICByZW1vdGVQcm9qZWN0Q29uZmlnOiBTZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbixcbik6IFByb21pc2U8P1JlbW90ZUNvbm5lY3Rpb24+IHtcbiAgY29uc3Qge2hvc3QsIGN3ZCwgZGlzcGxheVRpdGxlfSA9IHJlbW90ZVByb2plY3RDb25maWc7XG4gIGxldCBjb25uZWN0aW9uID0gUmVtb3RlQ29ubmVjdGlvbi5nZXRCeUhvc3RuYW1lQW5kUGF0aChob3N0LCBjd2QpO1xuICBpZiAoY29ubmVjdGlvbiAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gIH1cblxuICBjb25uZWN0aW9uID0gYXdhaXQgUmVtb3RlQ29ubmVjdGlvbi5jcmVhdGVDb25uZWN0aW9uQnlTYXZlZENvbmZpZyhob3N0LCBjd2QsIGRpc3BsYXlUaXRsZSk7XG4gIGlmIChjb25uZWN0aW9uICE9IG51bGwpIHtcbiAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgfVxuXG4gIC8vIElmIGNvbm5lY3Rpb24gZmFpbHMgdXNpbmcgc2F2ZWQgY29uZmlnLCBvcGVuIGNvbm5lY3QgZGlhbG9nLlxuICBjb25zdCB7b3BlbkNvbm5lY3Rpb25EaWFsb2d9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1zc2gtZGlhbG9nJyk7XG4gIHJldHVybiBvcGVuQ29ubmVjdGlvbkRpYWxvZyh7XG4gICAgaW5pdGlhbFNlcnZlcjogcmVtb3RlUHJvamVjdENvbmZpZy5ob3N0LFxuICAgIGluaXRpYWxDd2Q6IHJlbW90ZVByb2plY3RDb25maWcuY3dkLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkUmVtb3RlRm9sZGVyVG9Qcm9qZWN0KGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pIHtcbiAgY29uc3Qgd29ya2luZ0RpcmVjdG9yeVVyaSA9IGNvbm5lY3Rpb24uZ2V0VXJpRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKTtcbiAgLy8gSWYgcmVzdG9yaW5nIHN0YXRlLCB0aGVuIHRoZSBwcm9qZWN0IGFscmVhZHkgZXhpc3RzIHdpdGggbG9jYWwgZGlyZWN0b3J5IGFuZCB3cm9uZyByZXBvXG4gIC8vIGluc3RhbmNlcy4gSGVuY2UsIHdlIHJlbW92ZSBpdCBoZXJlLCBpZiBleGlzdGluZywgYW5kIGFkZCB0aGUgbmV3IHBhdGggZm9yIHdoaWNoIHdlIGFkZGVkIGFcbiAgLy8gd29ya3NwYWNlIG9wZW5lciBoYW5kbGVyLlxuICBhdG9tLnByb2plY3QucmVtb3ZlUGF0aCh3b3JraW5nRGlyZWN0b3J5VXJpKTtcblxuICBhdG9tLnByb2plY3QuYWRkUGF0aCh3b3JraW5nRGlyZWN0b3J5VXJpKTtcblxuICBjb25zdCBzdWJzY3JpcHRpb24gPSBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB7XG4gICAgLy8gRGVsYXkgY2xvc2luZyB0aGUgdW5kZXJseWluZyBzb2NrZXQgY29ubmVjdGlvbiB1bnRpbCByZWdpc3RlcmVkIHN1YnNjcmlwdGlvbnMgaGF2ZSBjbG9zZWQuXG4gICAgLy8gV2Ugc2hvdWxkIG5ldmVyIGRlcGVuZCBvbiB0aGUgb3JkZXIgb2YgcmVnaXN0cmF0aW9uIG9mIHRoZSBgb25EaWRDaGFuZ2VQYXRoc2AgZXZlbnQsXG4gICAgLy8gd2hpY2ggYWxzbyBkaXNwb3NlIGNvbnN1bWVkIHNlcnZpY2UncyByZXNvdXJjZXMuXG4gICAgc2V0VGltZW91dChjaGVja0Nsb3NlZFByb2plY3QsIENMT1NFX1BST0pFQ1RfREVMQVlfTVMpO1xuICB9KTtcblxuICBmdW5jdGlvbiBjaGVja0Nsb3NlZFByb2plY3QoKSB7XG4gICAgLy8gVGhlIHByb2plY3QgcGF0aHMgbWF5IGhhdmUgY2hhbmdlZCBkdXJpbmcgdGhlIGRlbGF5IHRpbWUuXG4gICAgLy8gSGVuY2UsIHRoZSBsYXRlc3QgcHJvamVjdCBwYXRocyBhcmUgZmV0Y2hlZCBoZXJlLlxuICAgIGNvbnN0IHBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG4gICAgaWYgKHBhdGhzLmluZGV4T2Yod29ya2luZ0RpcmVjdG9yeVVyaSkgIT09IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFRoZSBwcm9qZWN0IHdhcyByZW1vdmVkIGZyb20gdGhlIHRyZWUuXG4gICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcblxuICAgIGNsb3NlT3BlbkZpbGVzRm9yUmVtb3RlUHJvamVjdChjb25uZWN0aW9uLmdldENvbmZpZygpKTtcblxuICAgIGNvbnN0IGhvc3RuYW1lID0gY29ubmVjdGlvbi5nZXRSZW1vdGVIb3N0bmFtZSgpO1xuICAgIGlmIChSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWUoaG9zdG5hbWUpLmxlbmd0aCA+IDEpIHtcbiAgICAgIGxvZ2dlci5pbmZvKCdSZW1haW5pbmcgcmVtb3RlIHByb2plY3RzIHVzaW5nIE51Y2xpZGUgU2VydmVyIC0gbm8gcHJvbXB0IHRvIHNodXRkb3duJyk7XG4gICAgICBjb25uZWN0aW9uLmNsb3NlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYnV0dG9ucyA9IFsnS2VlcCBJdCcsICdTaHV0ZG93biddO1xuICAgIGNvbnN0IGJ1dHRvblRvQWN0aW9ucyA9IG5ldyBNYXAoKTtcblxuICAgIGJ1dHRvblRvQWN0aW9ucy5zZXQoYnV0dG9uc1swXSwgKCkgPT4gY29ubmVjdGlvbi5jbG9zZSgpKTtcbiAgICBidXR0b25Ub0FjdGlvbnMuc2V0KGJ1dHRvbnNbMV0sIGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IGNvbm5lY3Rpb24uZ2V0U2VydmljZSgnSW5mb1NlcnZpY2UnKS5zaHV0ZG93blNlcnZlcigpO1xuICAgICAgY29ubmVjdGlvbi5jbG9zZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH0pO1xuXG4gICAgaWYgKGZlYXR1cmVDb25maWcuZ2V0KFxuICAgICAgJ251Y2xpZGUtcmVtb3RlLXByb2plY3RzLnNodXRkb3duU2VydmVyQWZ0ZXJEaXNjb25uZWN0aW9uJyxcbiAgICApKSB7XG4gICAgICAvLyBBdG9tIHRha2VzIHRoZSBmaXJzdCBidXR0b24gaW4gdGhlIGxpc3QgYXMgZGVmYXVsdCBvcHRpb24uXG4gICAgICBidXR0b25zLnJldmVyc2UoKTtcbiAgICB9XG5cbiAgICBjb25zdCBjaG9pY2UgPSBnbG9iYWwuYXRvbS5jb25maXJtKHtcbiAgICAgIG1lc3NhZ2U6ICdObyBtb3JlIHJlbW90ZSBwcm9qZWN0cyBvbiB0aGUgaG9zdDogXFwnJyArIGhvc3RuYW1lICtcbiAgICAgICAgJ1xcJy4gV291bGQgeW91IGxpa2UgdG8gc2h1dGRvd24gTnVjbGlkZSBzZXJ2ZXIgdGhlcmU/JyxcbiAgICAgIGJ1dHRvbnMsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhY3Rpb24gPSBidXR0b25Ub0FjdGlvbnMuZ2V0KGJ1dHRvbnNbY2hvaWNlXSk7XG4gICAgaW52YXJpYW50KGFjdGlvbik7XG4gICAgYWN0aW9uKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xvc2VPcGVuRmlsZXNGb3JSZW1vdGVQcm9qZWN0KHJlbW90ZVByb2plY3RDb25maWc6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uKTogdm9pZCB7XG4gIGNvbnN0IG9wZW5JbnN0YW5jZXMgPSBnZXRPcGVuRmlsZUVkaXRvckZvclJlbW90ZVByb2plY3QocmVtb3RlUHJvamVjdENvbmZpZyk7XG4gIGZvciAoY29uc3Qgb3Blbkluc3RhbmNlIG9mIG9wZW5JbnN0YW5jZXMpIHtcbiAgICBjb25zdCB7ZWRpdG9yLCBwYW5lfSA9IG9wZW5JbnN0YW5jZTtcbiAgICBwYW5lLnJlbW92ZUl0ZW0oZWRpdG9yKTtcbiAgICBlZGl0b3IuZGVzdHJveSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFJlbW90ZVJvb3REaXJlY3RvcmllcygpOiBBcnJheTxhdG9tJERpcmVjdG9yeT4ge1xuICAvLyBUT0RPOiBVc2UgbnVjbGlkZS1yZW1vdGUtdXJpIGluc3RlYWQuXG4gIHJldHVybiBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5maWx0ZXIoXG4gICAgZGlyZWN0b3J5ID0+IGRpcmVjdG9yeS5nZXRQYXRoKCkuc3RhcnRzV2l0aCgnbnVjbGlkZTonKSk7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhbnkgRGlyZWN0b3J5IChub3QgUmVtb3RlRGlyZWN0b3J5KSBvYmplY3RzIHRoYXQgaGF2ZSBOdWNsaWRlXG4gKiByZW1vdGUgVVJJcy5cbiAqL1xuZnVuY3Rpb24gZGVsZXRlRHVtbXlSZW1vdGVSb290RGlyZWN0b3JpZXMoKSB7XG4gIGNvbnN0IHtSZW1vdGVEaXJlY3Rvcnl9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbicpO1xuICBjb25zdCB7aXNSZW1vdGV9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJyk7XG4gIGZvciAoY29uc3QgZGlyZWN0b3J5IG9mIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpKSB7XG4gICAgaWYgKGlzUmVtb3RlKGRpcmVjdG9yeS5nZXRQYXRoKCkpICYmXG4gICAgICAgICEoUmVtb3RlRGlyZWN0b3J5LmlzUmVtb3RlRGlyZWN0b3J5KGRpcmVjdG9yeSkpKSB7XG4gICAgICBhdG9tLnByb2plY3QucmVtb3ZlUGF0aChkaXJlY3RvcnkuZ2V0UGF0aCgpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgc2FtZSBUZXh0RWRpdG9yIG11c3QgYmUgcmV0dXJuZWQgdG8gcHJldmVudCBBdG9tIGZyb20gY3JlYXRpbmcgbXVsdGlwbGUgdGFic1xuICogZm9yIHRoZSBzYW1lIGZpbGUsIGJlY2F1c2UgQXRvbSBkb2Vzbid0IGNhY2hlIHBlbmRpbmcgb3BlbmVyIHByb21pc2VzLlxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVFZGl0b3JGb3JOdWNsaWRlKFxuICBjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uLFxuICB1cmk6IE51Y2xpZGVVcmksXG4pOiBQcm9taXNlPFRleHRFZGl0b3I+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBidWZmZXIgPSBhd2FpdCBsb2FkQnVmZmVyRm9yVXJpKHVyaSk7XG4gICAgcmV0dXJuIGNyZWF0ZVRleHRFZGl0b3Ioe2J1ZmZlcn0pO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBsb2dnZXIud2FybignYnVmZmVyIGxvYWQgaXNzdWU6JywgZXJyKTtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYEZhaWxlZCB0byBvcGVuICR7dXJpfTogJHtlcnIubWVzc2FnZX1gKTtcbiAgICB0aHJvdyBlcnI7XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgcmVtb3RlIGJ1ZmZlciBoYXMgYWxyZWFkeSBiZWVuIGluaXRpYWxpemVkIGluIGVkaXRvci5cbiAqIFRoaXMgY2hlY2tzIGlmIHRoZSBidWZmZXIgaXMgaW5zdGFuY2Ugb2YgTnVjbGlkZVRleHRCdWZmZXIuXG4gKi9cbmZ1bmN0aW9uIGlzUmVtb3RlQnVmZmVySW5pdGlhbGl6ZWQoZWRpdG9yOiBUZXh0RWRpdG9yKTogYm9vbGVhbiB7XG4gIGNvbnN0IGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKTtcbiAgLy8gJEZsb3dJc3N1ZTogaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL2Zsb3cvaXNzdWVzLzEzNzVcbiAgaWYgKGJ1ZmZlciAmJiBidWZmZXIuY29uc3RydWN0b3IubmFtZSA9PT0gJ051Y2xpZGVUZXh0QnVmZmVyJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcmVsb2FkUmVtb3RlUHJvamVjdHMoXG4gIHJlbW90ZVByb2plY3RzOiBBcnJheTxTZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbj4sXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgLy8gVGhpcyBpcyBpbnRlbnRpb25hbGx5IHNlcmlhbC5cbiAgLy8gVGhlIDkwJSB1c2UgY2FzZSBpcyB0byBoYXZlIG11bHRpcGxlIHJlbW90ZSBwcm9qZWN0cyBmb3IgYSBzaW5nbGUgY29ubmVjdGlvbjtcbiAgLy8gYWZ0ZXIgdGhlIGZpcnN0IG9uZSBzdWNjZWVkcyB0aGUgcmVzdCBzaG91bGQgcmVxdWlyZSBubyB1c2VyIGFjdGlvbi5cbiAgZm9yIChjb25zdCBjb25maWcgb2YgcmVtb3RlUHJvamVjdHMpIHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IGNyZWF0ZVJlbW90ZUNvbm5lY3Rpb24oY29uZmlnKTtcbiAgICBpZiAoIWNvbm5lY3Rpb24pIHtcbiAgICAgIGxvZ2dlci5pbmZvKFxuICAgICAgICAnTm8gUmVtb3RlQ29ubmVjdGlvbiByZXR1cm5lZCBvbiByZXN0b3JlIHN0YXRlIHRyaWFsOicsXG4gICAgICAgIGNvbmZpZy5ob3N0LFxuICAgICAgICBjb25maWcuY3dkLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSXQncyBmaW5lIHRoZSB1c2VyIGNvbm5lY3RlZCB0byBhIGRpZmZlcmVudCBwcm9qZWN0IG9uIHRoZSBzYW1lIGhvc3Q6XG4gICAgICAvLyB3ZSBzaG91bGQgc3RpbGwgYmUgYWJsZSB0byByZXN0b3JlIHRoaXMgdXNpbmcgdGhlIG5ldyBjb25uZWN0aW9uLlxuICAgICAgY29uc3Qge2N3ZCwgaG9zdCwgZGlzcGxheVRpdGxlfSA9IGNvbmZpZztcbiAgICAgIGlmIChjb25uZWN0aW9uLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpICE9PSBjd2QgJiZcbiAgICAgICAgICBjb25uZWN0aW9uLmdldFJlbW90ZUhvc3RuYW1lKCkgPT09IGhvc3QpIHtcbiAgICAgICAgYXdhaXQgUmVtb3RlQ29ubmVjdGlvbi5jcmVhdGVDb25uZWN0aW9uQnlTYXZlZENvbmZpZyhob3N0LCBjd2QsIGRpc3BsYXlUaXRsZSk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qIGVzbGludC1lbmFibGUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcCAqL1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY3RpdmF0ZShzdGF0ZTogP3tyZW1vdGVQcm9qZWN0c0NvbmZpZzogU2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb25bXX0pOiB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIGNvbnN0IFJlbW90ZVByb2plY3RzQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vUmVtb3RlUHJvamVjdHNDb250cm9sbGVyJyk7XG4gICAgY29udHJvbGxlciA9IG5ldyBSZW1vdGVQcm9qZWN0c0NvbnRyb2xsZXIoKTtcblxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKFJlbW90ZUNvbm5lY3Rpb24ub25EaWRBZGRSZW1vdGVDb25uZWN0aW9uKGNvbm5lY3Rpb24gPT4ge1xuICAgICAgYWRkUmVtb3RlRm9sZGVyVG9Qcm9qZWN0KGNvbm5lY3Rpb24pO1xuXG5cbiAgICAgIC8vIE9uIEF0b20gcmVzdGFydCwgaXQgdHJpZXMgdG8gb3BlbiB1cmkgcGF0aHMgYXMgbG9jYWwgYFRleHRFZGl0b3JgIHBhbmUgaXRlbXMuXG4gICAgICAvLyBIZXJlLCBOdWNsaWRlIHJlbG9hZHMgdGhlIHJlbW90ZSBwcm9qZWN0IGZpbGVzIHRoYXQgaGF2ZSBlbXB0eSB0ZXh0IGVkaXRvcnMgb3Blbi5cbiAgICAgIGNvbnN0IGNvbmZpZyA9IGNvbm5lY3Rpb24uZ2V0Q29uZmlnKCk7XG4gICAgICBjb25zdCBvcGVuSW5zdGFuY2VzID0gZ2V0T3BlbkZpbGVFZGl0b3JGb3JSZW1vdGVQcm9qZWN0KGNvbmZpZyk7XG4gICAgICBmb3IgKGNvbnN0IG9wZW5JbnN0YW5jZSBvZiBvcGVuSW5zdGFuY2VzKSB7XG4gICAgICAgIC8vIEtlZXAgdGhlIG9yaWdpbmFsIG9wZW4gZWRpdG9yIGl0ZW0gd2l0aCBhIHVuaXF1ZSBuYW1lIHVudGlsIHRoZSByZW1vdGUgYnVmZmVyIGlzIGxvYWRlZCxcbiAgICAgICAgLy8gVGhlbiwgd2UgYXJlIHJlYWR5IHRvIHJlcGxhY2UgaXQgd2l0aCB0aGUgcmVtb3RlIHRhYiBpbiB0aGUgc2FtZSBwYW5lLlxuICAgICAgICBjb25zdCB7cGFuZSwgZWRpdG9yLCB1cmksIGZpbGVQYXRofSA9IG9wZW5JbnN0YW5jZTtcblxuICAgICAgICAvLyBTa2lwIHJlc3RvcmluZyB0aGUgZWRpdGVyIHdobyBoYXMgcmVtb3RlIGNvbnRlbnQgbG9hZGVkLlxuICAgICAgICBpZiAoaXNSZW1vdGVCdWZmZXJJbml0aWFsaXplZChlZGl0b3IpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIZXJlLCBhIHVuaXF1ZSB1cmkgaXMgcGlja2VkIHRvIHRoZSBwZW5kaW5nIG9wZW4gcGFuZSBpdGVtIHRvIG1haW50YWluIHRoZSBwYW5lIGxheW91dC5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCB0aGUgb3BlbiB3b24ndCBiZSBjb21wbGV0ZWQgYmVjYXVzZSB0aGVyZSBleGlzdHMgYSBwYW5lIGl0ZW0gd2l0aCB0aGUgc2FtZVxuICAgICAgICAvLyB1cmkuXG4gICAgICAgIC8qICRGbG93Rml4TWUgKi9cbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLmZpbGUucGF0aCA9IGAke3VyaX0udG8tY2xvc2VgO1xuICAgICAgICAvLyBDbGVhbnVwIHRoZSBvbGQgcGFuZSBpdGVtIG9uIHN1Y2Nlc3NmdWwgb3BlbmluZyBvciB3aGVuIG5vIGNvbm5lY3Rpb24gY291bGQgYmVcbiAgICAgICAgLy8gZXN0YWJsaXNoZWQuXG4gICAgICAgIGNvbnN0IGNsZWFudXBCdWZmZXIgPSAoKSA9PiB7XG4gICAgICAgICAgcGFuZS5yZW1vdmVJdGVtKGVkaXRvcik7XG4gICAgICAgICAgZWRpdG9yLmRlc3Ryb3koKTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGZpbGVQYXRoID09PSBjb25maWcuY3dkKSB7XG4gICAgICAgICAgY2xlYW51cEJ1ZmZlcigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElmIHdlIGNsZWFuIHVwIHRoZSBidWZmZXIgYmVmb3JlIHRoZSBgb3BlblVyaUluUGFuZWAgZmluaXNoZXMsXG4gICAgICAgICAgLy8gdGhlIHBhbmUgd2lsbCBiZSBjbG9zZWQsIGJlY2F1c2UgaXQgY291bGQgaGF2ZSBubyBvdGhlciBpdGVtcy5cbiAgICAgICAgICAvLyBTbyB3ZSBtdXN0IGNsZWFuIHVwIGFmdGVyLlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUodXJpLCBwYW5lKS50aGVuKGNsZWFudXBCdWZmZXIsIGNsZWFudXBCdWZmZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAgICdudWNsaWRlLXJlbW90ZS1wcm9qZWN0czpjb25uZWN0JyxcbiAgICAgICAgKCkgPT4gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1zc2gtZGlhbG9nJykub3BlbkNvbm5lY3Rpb25EaWFsb2coKVxuICAgICkpO1xuXG4gICAgLy8gU3Vic2NyaWJlIG9wZW5lciBiZWZvcmUgcmVzdG9yaW5nIHRoZSByZW1vdGUgcHJvamVjdHMuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKCh1cmkgPSAnJykgPT4ge1xuICAgICAgaWYgKHVyaS5zdGFydHNXaXRoKCdudWNsaWRlOicpKSB7XG4gICAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBSZW1vdGVDb25uZWN0aW9uLmdldEZvclVyaSh1cmkpO1xuICAgICAgICAvLyBPbiBBdG9tIHJlc3RhcnQsIGl0IHRyaWVzIHRvIG9wZW4gdGhlIHVyaSBwYXRoIGFzIGEgZmlsZSB0YWIgYmVjYXVzZSBpdCdzIG5vdCBhIGxvY2FsXG4gICAgICAgIC8vIGRpcmVjdG9yeS4gV2UgY2FuJ3QgbGV0IHRoYXQgY3JlYXRlIGEgZmlsZSB3aXRoIHRoZSBpbml0aWFsIHdvcmtpbmcgZGlyZWN0b3J5IHBhdGguXG4gICAgICAgIGlmIChjb25uZWN0aW9uICYmIHVyaSAhPT0gY29ubmVjdGlvbi5nZXRVcmlGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgaWYgKHBlbmRpbmdGaWxlc1t1cmldKSB7XG4gICAgICAgICAgICByZXR1cm4gcGVuZGluZ0ZpbGVzW3VyaV07XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHRleHRFZGl0b3JQcm9taXNlID0gcGVuZGluZ0ZpbGVzW3VyaV0gPSBjcmVhdGVFZGl0b3JGb3JOdWNsaWRlKGNvbm5lY3Rpb24sIHVyaSk7XG4gICAgICAgICAgY29uc3QgcmVtb3ZlRnJvbUNhY2hlID0gKCkgPT4gZGVsZXRlIHBlbmRpbmdGaWxlc1t1cmldO1xuICAgICAgICAgIHRleHRFZGl0b3JQcm9taXNlLnRoZW4ocmVtb3ZlRnJvbUNhY2hlLCByZW1vdmVGcm9tQ2FjaGUpO1xuICAgICAgICAgIHJldHVybiB0ZXh0RWRpdG9yUHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIC8vIElmIFJlbW90ZURpcmVjdG9yeVByb3ZpZGVyIGlzIGNhbGxlZCBiZWZvcmUgdGhpcywgYW5kIGl0IGZhaWxlZFxuICAgIC8vIHRvIHByb3ZpZGUgYSBSZW1vdGVEaXJlY3RvcnkgZm9yIGFcbiAgICAvLyBnaXZlbiBVUkksIEF0b20gd2lsbCBjcmVhdGUgYSBnZW5lcmljIERpcmVjdG9yeSB0byB3cmFwIHRoYXQuIFdlIHdhbnRcbiAgICAvLyB0byBkZWxldGUgdGhlc2UgaW5zdGVhZCwgYmVjYXVzZSB0aG9zZSBkaXJlY3RvcmllcyBhcmVuJ3QgdmFsaWQvdXNlZnVsXG4gICAgLy8gaWYgdGhleSBhcmUgbm90IHRydWUgUmVtb3RlRGlyZWN0b3J5IG9iamVjdHMgKGNvbm5lY3RlZCB0byBhIHJlYWxcbiAgICAvLyByZWFsIHJlbW90ZSBmb2xkZXIpLlxuICAgIGRlbGV0ZUR1bW15UmVtb3RlUm9vdERpcmVjdG9yaWVzKCk7XG5cbiAgICAvLyBBdHRlbXB0IHRvIHJlbG9hZCBwcmV2aW91c2x5IG9wZW4gcHJvamVjdHMuXG4gICAgY29uc3QgcmVtb3RlUHJvamVjdHNDb25maWcgPSBzdGF0ZSAmJiBzdGF0ZS5yZW1vdGVQcm9qZWN0c0NvbmZpZztcbiAgICBpZiAocmVtb3RlUHJvamVjdHNDb25maWcgIT0gbnVsbCkge1xuICAgICAgcmVsb2FkUmVtb3RlUHJvamVjdHMocmVtb3RlUHJvamVjdHNDb25maWcpO1xuICAgIH1cbiAgICBwYWNrYWdlU3Vic2NyaXB0aW9ucyA9IHN1YnNjcmlwdGlvbnM7XG4gIH0sXG5cbiAgY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXI6IGF0b20kU3RhdHVzQmFyKTogdm9pZCB7XG4gICAgaWYgKGNvbnRyb2xsZXIpIHtcbiAgICAgIGNvbnRyb2xsZXIuY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXIpO1xuICAgIH1cbiAgfSxcblxuICAvLyBUT0RPOiBBbGwgb2YgdGhlIGVsZW1lbnRzIG9mIHRoZSBhcnJheSBhcmUgbm9uLW51bGwsIGJ1dCBpdCBkb2VzIG5vdCBzZWVtIHBvc3NpYmxlIHRvIGNvbnZpbmNlXG4gIC8vIEZsb3cgb2YgdGhhdC5cbiAgc2VyaWFsaXplKCk6IHtyZW1vdGVQcm9qZWN0c0NvbmZpZzogQXJyYXk8P1NlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uPn0ge1xuICAgIGNvbnN0IHJlbW90ZVByb2plY3RzQ29uZmlnOiBBcnJheTw/U2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24+ID1cbiAgICAgIGdldFJlbW90ZVJvb3REaXJlY3RvcmllcygpXG4gICAgICAgIC5tYXAoKGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkpOiA/U2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24gPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBSZW1vdGVDb25uZWN0aW9uLmdldEZvclVyaShkaXJlY3RvcnkuZ2V0UGF0aCgpKTtcbiAgICAgICAgICByZXR1cm4gY29ubmVjdGlvbiA/XG4gICAgICAgICAgICBjcmVhdGVTZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbihjb25uZWN0aW9uLmdldENvbmZpZygpKSA6IG51bGw7XG4gICAgICAgIH0pXG4gICAgICAgIC5maWx0ZXIoKGNvbmZpZzogP1NlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiBjb25maWcgIT0gbnVsbCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW90ZVByb2plY3RzQ29uZmlnLFxuICAgIH07XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAocGFja2FnZVN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHBhY2thZ2VTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHBhY2thZ2VTdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoY29udHJvbGxlciAhPSBudWxsKSB7XG4gICAgICBjb250cm9sbGVyLmRlc3Ryb3koKTtcbiAgICAgIGNvbnRyb2xsZXIgPSBudWxsO1xuICAgIH1cbiAgfSxcblxuICBjcmVhdGVSZW1vdGVEaXJlY3RvcnlQcm92aWRlcigpOiBSZW1vdGVEaXJlY3RvcnlQcm92aWRlclQge1xuICAgIGNvbnN0IFJlbW90ZURpcmVjdG9yeVByb3ZpZGVyID0gcmVxdWlyZSgnLi9SZW1vdGVEaXJlY3RvcnlQcm92aWRlcicpO1xuICAgIHJldHVybiBuZXcgUmVtb3RlRGlyZWN0b3J5UHJvdmlkZXIoKTtcbiAgfSxcblxuICBjcmVhdGVSZW1vdGVEaXJlY3RvcnlTZWFyY2hlcigpOiBSZW1vdGVEaXJlY3RvcnlTZWFyY2hlclQge1xuICAgIGNvbnN0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY2xpZW50Jyk7XG4gICAgY29uc3Qge1JlbW90ZURpcmVjdG9yeX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJyk7XG4gICAgY29uc3QgUmVtb3RlRGlyZWN0b3J5U2VhcmNoZXIgPSByZXF1aXJlKCcuL1JlbW90ZURpcmVjdG9yeVNlYXJjaGVyJyk7XG4gICAgcmV0dXJuIG5ldyBSZW1vdGVEaXJlY3RvcnlTZWFyY2hlcigoZGlyOiBSZW1vdGVEaXJlY3RvcnkpID0+IHtcbiAgICAgIGNvbnN0IHNlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdGaW5kSW5Qcm9qZWN0U2VydmljZScsIGRpci5nZXRQYXRoKCkpO1xuICAgICAgaW52YXJpYW50KHNlcnZpY2UpO1xuICAgICAgcmV0dXJuIChzZXJ2aWNlOiBGaW5kSW5Qcm9qZWN0U2VydmljZSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgZ2V0SG9tZUZyYWdtZW50cygpOiBIb21lRnJhZ21lbnRzIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmVhdHVyZToge1xuICAgICAgICB0aXRsZTogJ1JlbW90ZSBDb25uZWN0aW9uJyxcbiAgICAgICAgaWNvbjogJ2Nsb3VkLXVwbG9hZCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ29ubmVjdCB0byBhIHJlbW90ZSBzZXJ2ZXIgdG8gZWRpdCBmaWxlcy4nLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1yZW1vdGUtcHJvamVjdHM6Y29ubmVjdCcsXG4gICAgICB9LFxuICAgICAgcHJpb3JpdHk6IDgsXG4gICAgfTtcbiAgfSxcblxufTtcbiJdfQ==