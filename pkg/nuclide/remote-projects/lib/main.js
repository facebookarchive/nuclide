var createRemoteConnection = _asyncToGenerator(function* (remoteProjectConfig) {
  var host = remoteProjectConfig.host;
  var cwd = remoteProjectConfig.cwd;

  var connection = _remoteConnection.RemoteConnection.getByHostnameAndPath(host, cwd);
  if (connection != null) {
    return connection;
  }

  connection = yield _remoteConnection.RemoteConnection.createConnectionBySavedConfig(host, cwd);
  if (connection != null) {
    return connection;
  }

  // If connection fails using saved config, open connect dialog.

  var _require = require('../../ssh-dialog');

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
    var buffer = yield (0, _atomHelpers.loadBufferForUri)(uri);
    return (0, _atomHelpers.createTextEditor)({ buffer: buffer });
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

      if (connection.getPathForInitialWorkingDirectory() !== _cwd && connection.getRemoteHostname() === _host) {
        yield _remoteConnection.RemoteConnection.createConnectionBySavedConfig(_host, _cwd);
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

var _atomHelpers = require('../../atom-helpers');

var _logging = require('../../logging');

var _utils = require('./utils');

var _featureConfig = require('../../feature-config');

var _featureConfig2 = _interopRequireDefault(_featureConfig);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _remoteConnection = require('../../remote-connection');

var logger = (0, _logging.getLogger)();

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
    cwd: config.cwd
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
    if (_remoteConnection.RemoteConnection.getByHostname(hostname).length > 1) {
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

    if (_featureConfig2['default'].get('nuclide-remote-projects.shutdownServerAfterDisconnection')) {
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
  var _require2 = require('../../remote-connection');

  var RemoteDirectory = _require2.RemoteDirectory;

  var _require3 = require('../../remote-uri');

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

    subscriptions.add(_remoteConnection.RemoteConnection.onDidAddRemoteConnection(function (connection) {
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
      return require('../../ssh-dialog').openConnectionDialog();
    }));

    // Subscribe opener before restoring the remote projects.
    subscriptions.add(atom.workspace.addOpener(function () {
      var uri = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      if (uri.startsWith('nuclide:')) {
        var connection = _remoteConnection.RemoteConnection.getForUri(uri);
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
      var connection = _remoteConnection.RemoteConnection.getForUri(directory.getPath());
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
    var _require4 = require('../../client');

    var getServiceByNuclideUri = _require4.getServiceByNuclideUri;

    var _require5 = require('../../remote-connection');

    var RemoteDirectory = _require5.RemoteDirectory;

    var RemoteDirectorySearcher = require('./RemoteDirectorySearcher');
    return new RemoteDirectorySearcher(function (dir) {
      return getServiceByNuclideUri('FindInProjectService', dir.getPath());
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
//# sourceMappingURL=data:application/json;base64,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QUM7QUFDckUsV0FBTyxJQUFJLHVCQUF1QixDQUFDLFVBQUMsR0FBRzthQUNwQyxzQkFBc0IsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7S0FBdUIsQ0FBQyxDQUFDO0dBQzFGOztBQUVELGtCQUFnQixFQUFBLDRCQUFrQjtBQUNoQyxXQUFPO0FBQ0wsYUFBTyxFQUFFO0FBQ1AsYUFBSyxFQUFFLG1CQUFtQjtBQUMxQixZQUFJLEVBQUUsY0FBYztBQUNwQixtQkFBVyxFQUFFLDJDQUEyQztBQUN4RCxlQUFPLEVBQUUsaUNBQWlDO09BQzNDO0FBQ0QsY0FBUSxFQUFFLENBQUM7S0FDWixDQUFDO0dBQ0g7O0NBRUYsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hvbWVGcmFnbWVudHN9IGZyb20gJy4uLy4uL2hvbWUtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7XG4gIFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uLFxufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbi9saWIvUmVtb3RlQ29ubmVjdGlvbic7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSBSZW1vdGVEaXJlY3RvcnlQcm92aWRlclQgZnJvbSAnLi9SZW1vdGVEaXJlY3RvcnlQcm92aWRlcic7XG5pbXBvcnQgdHlwZSBSZW1vdGVEaXJlY3RvcnlTZWFyY2hlclQgZnJvbSAnLi9SZW1vdGVEaXJlY3RvcnlTZWFyY2hlcic7XG5pbXBvcnQgdHlwZSBSZW1vdGVQcm9qZWN0c0NvbnRyb2xsZXJUIGZyb20gJy4vUmVtb3RlUHJvamVjdHNDb250cm9sbGVyJztcbmltcG9ydCB0eXBlb2YgKiBhcyBGaW5kSW5Qcm9qZWN0U2VydmljZSBmcm9tICcuLi8uLi9yZW1vdGUtc2VhcmNoJztcblxuaW1wb3J0IHtjcmVhdGVUZXh0RWRpdG9yLCBsb2FkQnVmZmVyRm9yVXJpfSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuaW1wb3J0IHtnZXRPcGVuRmlsZUVkaXRvckZvclJlbW90ZVByb2plY3R9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7UmVtb3RlQ29ubmVjdGlvbn0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuLyoqXG4gKiBTdG9yZXMgdGhlIGhvc3QgYW5kIGN3ZCBvZiBhIHJlbW90ZSBjb25uZWN0aW9uLlxuICovXG50eXBlIFNlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uID0ge1xuICBob3N0OiBzdHJpbmc7XG4gIGN3ZDogc3RyaW5nO1xufVxuXG5sZXQgcGFja2FnZVN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlID0gbnVsbDtcbmxldCBjb250cm9sbGVyOiA/UmVtb3RlUHJvamVjdHNDb250cm9sbGVyVCA9IG51bGw7XG5cbmNvbnN0IENMT1NFX1BST0pFQ1RfREVMQVlfTVMgPSAxMDA7XG5jb25zdCBwZW5kaW5nRmlsZXMgPSB7fTtcblxuZnVuY3Rpb24gY3JlYXRlU2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24oXG4gIGNvbmZpZzogUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24sXG4pOiBTZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbiB7XG4gIHJldHVybiB7XG4gICAgaG9zdDogY29uZmlnLmhvc3QsXG4gICAgY3dkOiBjb25maWcuY3dkLFxuICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVSZW1vdGVDb25uZWN0aW9uKFxuICByZW1vdGVQcm9qZWN0Q29uZmlnOiBTZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbixcbik6IFByb21pc2U8P1JlbW90ZUNvbm5lY3Rpb24+IHtcbiAgY29uc3Qge2hvc3QsIGN3ZH0gPSByZW1vdGVQcm9qZWN0Q29uZmlnO1xuICBsZXQgY29ubmVjdGlvbiA9IFJlbW90ZUNvbm5lY3Rpb24uZ2V0QnlIb3N0bmFtZUFuZFBhdGgoaG9zdCwgY3dkKTtcbiAgaWYgKGNvbm5lY3Rpb24gIT0gbnVsbCkge1xuICAgIHJldHVybiBjb25uZWN0aW9uO1xuICB9XG5cbiAgY29ubmVjdGlvbiA9IGF3YWl0IFJlbW90ZUNvbm5lY3Rpb24uY3JlYXRlQ29ubmVjdGlvbkJ5U2F2ZWRDb25maWcoaG9zdCwgY3dkKTtcbiAgaWYgKGNvbm5lY3Rpb24gIT0gbnVsbCkge1xuICAgIHJldHVybiBjb25uZWN0aW9uO1xuICB9XG5cbiAgLy8gSWYgY29ubmVjdGlvbiBmYWlscyB1c2luZyBzYXZlZCBjb25maWcsIG9wZW4gY29ubmVjdCBkaWFsb2cuXG4gIGNvbnN0IHtvcGVuQ29ubmVjdGlvbkRpYWxvZ30gPSByZXF1aXJlKCcuLi8uLi9zc2gtZGlhbG9nJyk7XG4gIHJldHVybiBvcGVuQ29ubmVjdGlvbkRpYWxvZyh7XG4gICAgaW5pdGlhbFNlcnZlcjogcmVtb3RlUHJvamVjdENvbmZpZy5ob3N0LFxuICAgIGluaXRpYWxDd2Q6IHJlbW90ZVByb2plY3RDb25maWcuY3dkLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkUmVtb3RlRm9sZGVyVG9Qcm9qZWN0KGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pIHtcbiAgY29uc3Qgd29ya2luZ0RpcmVjdG9yeVVyaSA9IGNvbm5lY3Rpb24uZ2V0VXJpRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKTtcbiAgLy8gSWYgcmVzdG9yaW5nIHN0YXRlLCB0aGVuIHRoZSBwcm9qZWN0IGFscmVhZHkgZXhpc3RzIHdpdGggbG9jYWwgZGlyZWN0b3J5IGFuZCB3cm9uZyByZXBvXG4gIC8vIGluc3RhbmNlcy4gSGVuY2UsIHdlIHJlbW92ZSBpdCBoZXJlLCBpZiBleGlzdGluZywgYW5kIGFkZCB0aGUgbmV3IHBhdGggZm9yIHdoaWNoIHdlIGFkZGVkIGFcbiAgLy8gd29ya3NwYWNlIG9wZW5lciBoYW5kbGVyLlxuICBhdG9tLnByb2plY3QucmVtb3ZlUGF0aCh3b3JraW5nRGlyZWN0b3J5VXJpKTtcblxuICBhdG9tLnByb2plY3QuYWRkUGF0aCh3b3JraW5nRGlyZWN0b3J5VXJpKTtcblxuICBjb25zdCBzdWJzY3JpcHRpb24gPSBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB7XG4gICAgLy8gRGVsYXkgY2xvc2luZyB0aGUgdW5kZXJseWluZyBzb2NrZXQgY29ubmVjdGlvbiB1bnRpbCByZWdpc3RlcmVkIHN1YnNjcmlwdGlvbnMgaGF2ZSBjbG9zZWQuXG4gICAgLy8gV2Ugc2hvdWxkIG5ldmVyIGRlcGVuZCBvbiB0aGUgb3JkZXIgb2YgcmVnaXN0cmF0aW9uIG9mIHRoZSBgb25EaWRDaGFuZ2VQYXRoc2AgZXZlbnQsXG4gICAgLy8gd2hpY2ggYWxzbyBkaXNwb3NlIGNvbnN1bWVkIHNlcnZpY2UncyByZXNvdXJjZXMuXG4gICAgc2V0VGltZW91dChjaGVja0Nsb3NlZFByb2plY3QsIENMT1NFX1BST0pFQ1RfREVMQVlfTVMpO1xuICB9KTtcblxuICBmdW5jdGlvbiBjaGVja0Nsb3NlZFByb2plY3QoKSB7XG4gICAgLy8gVGhlIHByb2plY3QgcGF0aHMgbWF5IGhhdmUgY2hhbmdlZCBkdXJpbmcgdGhlIGRlbGF5IHRpbWUuXG4gICAgLy8gSGVuY2UsIHRoZSBsYXRlc3QgcHJvamVjdCBwYXRocyBhcmUgZmV0Y2hlZCBoZXJlLlxuICAgIGNvbnN0IHBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG4gICAgaWYgKHBhdGhzLmluZGV4T2Yod29ya2luZ0RpcmVjdG9yeVVyaSkgIT09IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFRoZSBwcm9qZWN0IHdhcyByZW1vdmVkIGZyb20gdGhlIHRyZWUuXG4gICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcblxuICAgIGNsb3NlT3BlbkZpbGVzRm9yUmVtb3RlUHJvamVjdChjb25uZWN0aW9uLmdldENvbmZpZygpKTtcblxuICAgIGNvbnN0IGhvc3RuYW1lID0gY29ubmVjdGlvbi5nZXRSZW1vdGVIb3N0bmFtZSgpO1xuICAgIGlmIChSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWUoaG9zdG5hbWUpLmxlbmd0aCA+IDEpIHtcbiAgICAgIGxvZ2dlci5pbmZvKCdSZW1haW5pbmcgcmVtb3RlIHByb2plY3RzIHVzaW5nIE51Y2xpZGUgU2VydmVyIC0gbm8gcHJvbXB0IHRvIHNodXRkb3duJyk7XG4gICAgICBjb25uZWN0aW9uLmNsb3NlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYnV0dG9ucyA9IFsnS2VlcCBJdCcsICdTaHV0ZG93biddO1xuICAgIGNvbnN0IGJ1dHRvblRvQWN0aW9ucyA9IG5ldyBNYXAoKTtcblxuICAgIGJ1dHRvblRvQWN0aW9ucy5zZXQoYnV0dG9uc1swXSwgKCkgPT4gY29ubmVjdGlvbi5jbG9zZSgpKTtcbiAgICBidXR0b25Ub0FjdGlvbnMuc2V0KGJ1dHRvbnNbMV0sIGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IGNvbm5lY3Rpb24uZ2V0U2VydmljZSgnSW5mb1NlcnZpY2UnKS5zaHV0ZG93blNlcnZlcigpO1xuICAgICAgY29ubmVjdGlvbi5jbG9zZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH0pO1xuXG4gICAgaWYgKGZlYXR1cmVDb25maWcuZ2V0KFxuICAgICAgJ251Y2xpZGUtcmVtb3RlLXByb2plY3RzLnNodXRkb3duU2VydmVyQWZ0ZXJEaXNjb25uZWN0aW9uJyxcbiAgICApKSB7XG4gICAgICAvLyBBdG9tIHRha2VzIHRoZSBmaXJzdCBidXR0b24gaW4gdGhlIGxpc3QgYXMgZGVmYXVsdCBvcHRpb24uXG4gICAgICBidXR0b25zLnJldmVyc2UoKTtcbiAgICB9XG5cbiAgICBjb25zdCBjaG9pY2UgPSBnbG9iYWwuYXRvbS5jb25maXJtKHtcbiAgICAgIG1lc3NhZ2U6ICdObyBtb3JlIHJlbW90ZSBwcm9qZWN0cyBvbiB0aGUgaG9zdDogXFwnJyArIGhvc3RuYW1lICtcbiAgICAgICAgJ1xcJy4gV291bGQgeW91IGxpa2UgdG8gc2h1dGRvd24gTnVjbGlkZSBzZXJ2ZXIgdGhlcmU/JyxcbiAgICAgIGJ1dHRvbnMsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhY3Rpb24gPSBidXR0b25Ub0FjdGlvbnMuZ2V0KGJ1dHRvbnNbY2hvaWNlXSk7XG4gICAgaW52YXJpYW50KGFjdGlvbik7XG4gICAgYWN0aW9uKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xvc2VPcGVuRmlsZXNGb3JSZW1vdGVQcm9qZWN0KHJlbW90ZVByb2plY3RDb25maWc6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uKTogdm9pZCB7XG4gIGNvbnN0IG9wZW5JbnN0YW5jZXMgPSBnZXRPcGVuRmlsZUVkaXRvckZvclJlbW90ZVByb2plY3QocmVtb3RlUHJvamVjdENvbmZpZyk7XG4gIGZvciAoY29uc3Qgb3Blbkluc3RhbmNlIG9mIG9wZW5JbnN0YW5jZXMpIHtcbiAgICBjb25zdCB7ZWRpdG9yLCBwYW5lfSA9IG9wZW5JbnN0YW5jZTtcbiAgICBwYW5lLnJlbW92ZUl0ZW0oZWRpdG9yKTtcbiAgICBlZGl0b3IuZGVzdHJveSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFJlbW90ZVJvb3REaXJlY3RvcmllcygpOiBBcnJheTxhdG9tJERpcmVjdG9yeT4ge1xuICAvLyBUT0RPOiBVc2UgbnVjbGlkZS1yZW1vdGUtdXJpIGluc3RlYWQuXG4gIHJldHVybiBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5maWx0ZXIoXG4gICAgZGlyZWN0b3J5ID0+IGRpcmVjdG9yeS5nZXRQYXRoKCkuc3RhcnRzV2l0aCgnbnVjbGlkZTonKSk7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhbnkgRGlyZWN0b3J5IChub3QgUmVtb3RlRGlyZWN0b3J5KSBvYmplY3RzIHRoYXQgaGF2ZSBOdWNsaWRlXG4gKiByZW1vdGUgVVJJcy5cbiAqL1xuZnVuY3Rpb24gZGVsZXRlRHVtbXlSZW1vdGVSb290RGlyZWN0b3JpZXMoKSB7XG4gIGNvbnN0IHtSZW1vdGVEaXJlY3Rvcnl9ID0gcmVxdWlyZSgnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nKTtcbiAgY29uc3Qge2lzUmVtb3RlfSA9IHJlcXVpcmUoJy4uLy4uL3JlbW90ZS11cmknKTtcbiAgZm9yIChjb25zdCBkaXJlY3Rvcnkgb2YgYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCkpIHtcbiAgICBpZiAoaXNSZW1vdGUoZGlyZWN0b3J5LmdldFBhdGgoKSkgJiZcbiAgICAgICAgIShSZW1vdGVEaXJlY3RvcnkuaXNSZW1vdGVEaXJlY3RvcnkoZGlyZWN0b3J5KSkpIHtcbiAgICAgIGF0b20ucHJvamVjdC5yZW1vdmVQYXRoKGRpcmVjdG9yeS5nZXRQYXRoKCkpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFRoZSBzYW1lIFRleHRFZGl0b3IgbXVzdCBiZSByZXR1cm5lZCB0byBwcmV2ZW50IEF0b20gZnJvbSBjcmVhdGluZyBtdWx0aXBsZSB0YWJzXG4gKiBmb3IgdGhlIHNhbWUgZmlsZSwgYmVjYXVzZSBBdG9tIGRvZXNuJ3QgY2FjaGUgcGVuZGluZyBvcGVuZXIgcHJvbWlzZXMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUVkaXRvckZvck51Y2xpZGUoXG4gIGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24sXG4gIHVyaTogTnVjbGlkZVVyaSxcbik6IFByb21pc2U8VGV4dEVkaXRvcj4ge1xuICB0cnkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGxvYWRCdWZmZXJGb3JVcmkodXJpKTtcbiAgICByZXR1cm4gY3JlYXRlVGV4dEVkaXRvcih7YnVmZmVyfSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGxvZ2dlci53YXJuKCdidWZmZXIgbG9hZCBpc3N1ZTonLCBlcnIpO1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgRmFpbGVkIHRvIG9wZW4gJHt1cml9OiAke2Vyci5tZXNzYWdlfWApO1xuICAgIHRocm93IGVycjtcbiAgfVxufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSByZW1vdGUgYnVmZmVyIGhhcyBhbHJlYWR5IGJlZW4gaW5pdGlhbGl6ZWQgaW4gZWRpdG9yLlxuICogVGhpcyBjaGVja3MgaWYgdGhlIGJ1ZmZlciBpcyBpbnN0YW5jZSBvZiBOdWNsaWRlVGV4dEJ1ZmZlci5cbiAqL1xuZnVuY3Rpb24gaXNSZW1vdGVCdWZmZXJJbml0aWFsaXplZChlZGl0b3I6IFRleHRFZGl0b3IpOiBib29sZWFuIHtcbiAgY29uc3QgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAvLyAkRmxvd0lzc3VlOiBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvMTM3NVxuICBpZiAoYnVmZmVyICYmIGJ1ZmZlci5jb25zdHJ1Y3Rvci5uYW1lID09PSAnTnVjbGlkZVRleHRCdWZmZXInKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWxvYWRSZW1vdGVQcm9qZWN0cyhcbiAgcmVtb3RlUHJvamVjdHM6IEFycmF5PFNlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uPixcbik6IFByb21pc2U8dm9pZD4ge1xuICAvLyBUaGlzIGlzIGludGVudGlvbmFsbHkgc2VyaWFsLlxuICAvLyBUaGUgOTAlIHVzZSBjYXNlIGlzIHRvIGhhdmUgbXVsdGlwbGUgcmVtb3RlIHByb2plY3RzIGZvciBhIHNpbmdsZSBjb25uZWN0aW9uO1xuICAvLyBhZnRlciB0aGUgZmlyc3Qgb25lIHN1Y2NlZWRzIHRoZSByZXN0IHNob3VsZCByZXF1aXJlIG5vIHVzZXIgYWN0aW9uLlxuICBmb3IgKGNvbnN0IGNvbmZpZyBvZiByZW1vdGVQcm9qZWN0cykge1xuICAgIC8qIGVzbGludC1kaXNhYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgY3JlYXRlUmVtb3RlQ29ubmVjdGlvbihjb25maWcpO1xuICAgIGlmICghY29ubmVjdGlvbikge1xuICAgICAgbG9nZ2VyLmluZm8oXG4gICAgICAgICdObyBSZW1vdGVDb25uZWN0aW9uIHJldHVybmVkIG9uIHJlc3RvcmUgc3RhdGUgdHJpYWw6JyxcbiAgICAgICAgY29uZmlnLmhvc3QsXG4gICAgICAgIGNvbmZpZy5jd2QsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJdCdzIGZpbmUgdGhlIHVzZXIgY29ubmVjdGVkIHRvIGEgZGlmZmVyZW50IHByb2plY3Qgb24gdGhlIHNhbWUgaG9zdDpcbiAgICAgIC8vIHdlIHNob3VsZCBzdGlsbCBiZSBhYmxlIHRvIHJlc3RvcmUgdGhpcyB1c2luZyB0aGUgbmV3IGNvbm5lY3Rpb24uXG4gICAgICBjb25zdCB7Y3dkLCBob3N0fSA9IGNvbmZpZztcbiAgICAgIGlmIChjb25uZWN0aW9uLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpICE9PSBjd2QgJiZcbiAgICAgICAgICBjb25uZWN0aW9uLmdldFJlbW90ZUhvc3RuYW1lKCkgPT09IGhvc3QpIHtcbiAgICAgICAgYXdhaXQgUmVtb3RlQ29ubmVjdGlvbi5jcmVhdGVDb25uZWN0aW9uQnlTYXZlZENvbmZpZyhob3N0LCBjd2QpO1xuICAgICAgfVxuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aXZhdGUoc3RhdGU6ID97cmVtb3RlUHJvamVjdHNDb25maWc6IFNlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uW119KTogdm9pZCB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICBjb25zdCBSZW1vdGVQcm9qZWN0c0NvbnRyb2xsZXIgPSByZXF1aXJlKCcuL1JlbW90ZVByb2plY3RzQ29udHJvbGxlcicpO1xuICAgIGNvbnRyb2xsZXIgPSBuZXcgUmVtb3RlUHJvamVjdHNDb250cm9sbGVyKCk7XG5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChSZW1vdGVDb25uZWN0aW9uLm9uRGlkQWRkUmVtb3RlQ29ubmVjdGlvbihjb25uZWN0aW9uID0+IHtcbiAgICAgIGFkZFJlbW90ZUZvbGRlclRvUHJvamVjdChjb25uZWN0aW9uKTtcblxuXG4gICAgICAvLyBPbiBBdG9tIHJlc3RhcnQsIGl0IHRyaWVzIHRvIG9wZW4gdXJpIHBhdGhzIGFzIGxvY2FsIGBUZXh0RWRpdG9yYCBwYW5lIGl0ZW1zLlxuICAgICAgLy8gSGVyZSwgTnVjbGlkZSByZWxvYWRzIHRoZSByZW1vdGUgcHJvamVjdCBmaWxlcyB0aGF0IGhhdmUgZW1wdHkgdGV4dCBlZGl0b3JzIG9wZW4uXG4gICAgICBjb25zdCBjb25maWcgPSBjb25uZWN0aW9uLmdldENvbmZpZygpO1xuICAgICAgY29uc3Qgb3Blbkluc3RhbmNlcyA9IGdldE9wZW5GaWxlRWRpdG9yRm9yUmVtb3RlUHJvamVjdChjb25maWcpO1xuICAgICAgZm9yIChjb25zdCBvcGVuSW5zdGFuY2Ugb2Ygb3Blbkluc3RhbmNlcykge1xuICAgICAgICAvLyBLZWVwIHRoZSBvcmlnaW5hbCBvcGVuIGVkaXRvciBpdGVtIHdpdGggYSB1bmlxdWUgbmFtZSB1bnRpbCB0aGUgcmVtb3RlIGJ1ZmZlciBpcyBsb2FkZWQsXG4gICAgICAgIC8vIFRoZW4sIHdlIGFyZSByZWFkeSB0byByZXBsYWNlIGl0IHdpdGggdGhlIHJlbW90ZSB0YWIgaW4gdGhlIHNhbWUgcGFuZS5cbiAgICAgICAgY29uc3Qge3BhbmUsIGVkaXRvciwgdXJpLCBmaWxlUGF0aH0gPSBvcGVuSW5zdGFuY2U7XG5cbiAgICAgICAgLy8gU2tpcCByZXN0b3JpbmcgdGhlIGVkaXRlciB3aG8gaGFzIHJlbW90ZSBjb250ZW50IGxvYWRlZC5cbiAgICAgICAgaWYgKGlzUmVtb3RlQnVmZmVySW5pdGlhbGl6ZWQoZWRpdG9yKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSGVyZSwgYSB1bmlxdWUgdXJpIGlzIHBpY2tlZCB0byB0aGUgcGVuZGluZyBvcGVuIHBhbmUgaXRlbSB0byBtYWludGFpbiB0aGUgcGFuZSBsYXlvdXQuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgdGhlIG9wZW4gd29uJ3QgYmUgY29tcGxldGVkIGJlY2F1c2UgdGhlcmUgZXhpc3RzIGEgcGFuZSBpdGVtIHdpdGggdGhlIHNhbWVcbiAgICAgICAgLy8gdXJpLlxuICAgICAgICAvKiAkRmxvd0ZpeE1lICovXG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5maWxlLnBhdGggPSBgJHt1cml9LnRvLWNsb3NlYDtcbiAgICAgICAgLy8gQ2xlYW51cCB0aGUgb2xkIHBhbmUgaXRlbSBvbiBzdWNjZXNzZnVsIG9wZW5pbmcgb3Igd2hlbiBubyBjb25uZWN0aW9uIGNvdWxkIGJlXG4gICAgICAgIC8vIGVzdGFibGlzaGVkLlxuICAgICAgICBjb25zdCBjbGVhbnVwQnVmZmVyID0gKCkgPT4ge1xuICAgICAgICAgIHBhbmUucmVtb3ZlSXRlbShlZGl0b3IpO1xuICAgICAgICAgIGVkaXRvci5kZXN0cm95KCk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChmaWxlUGF0aCA9PT0gY29uZmlnLmN3ZCkge1xuICAgICAgICAgIGNsZWFudXBCdWZmZXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiB3ZSBjbGVhbiB1cCB0aGUgYnVmZmVyIGJlZm9yZSB0aGUgYG9wZW5VcmlJblBhbmVgIGZpbmlzaGVzLFxuICAgICAgICAgIC8vIHRoZSBwYW5lIHdpbGwgYmUgY2xvc2VkLCBiZWNhdXNlIGl0IGNvdWxkIGhhdmUgbm8gb3RoZXIgaXRlbXMuXG4gICAgICAgICAgLy8gU28gd2UgbXVzdCBjbGVhbiB1cCBhZnRlci5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuVVJJSW5QYW5lKHVyaSwgcGFuZSkudGhlbihjbGVhbnVwQnVmZmVyLCBjbGVhbnVwQnVmZmVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgICAnbnVjbGlkZS1yZW1vdGUtcHJvamVjdHM6Y29ubmVjdCcsXG4gICAgICAgICgpID0+IHJlcXVpcmUoJy4uLy4uL3NzaC1kaWFsb2cnKS5vcGVuQ29ubmVjdGlvbkRpYWxvZygpXG4gICAgKSk7XG5cbiAgICAvLyBTdWJzY3JpYmUgb3BlbmVyIGJlZm9yZSByZXN0b3JpbmcgdGhlIHJlbW90ZSBwcm9qZWN0cy5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIoKHVyaSA9ICcnKSA9PiB7XG4gICAgICBpZiAodXJpLnN0YXJ0c1dpdGgoJ251Y2xpZGU6JykpIHtcbiAgICAgICAgY29uc3QgY29ubmVjdGlvbiA9IFJlbW90ZUNvbm5lY3Rpb24uZ2V0Rm9yVXJpKHVyaSk7XG4gICAgICAgIC8vIE9uIEF0b20gcmVzdGFydCwgaXQgdHJpZXMgdG8gb3BlbiB0aGUgdXJpIHBhdGggYXMgYSBmaWxlIHRhYiBiZWNhdXNlIGl0J3Mgbm90IGEgbG9jYWxcbiAgICAgICAgLy8gZGlyZWN0b3J5LiBXZSBjYW4ndCBsZXQgdGhhdCBjcmVhdGUgYSBmaWxlIHdpdGggdGhlIGluaXRpYWwgd29ya2luZyBkaXJlY3RvcnkgcGF0aC5cbiAgICAgICAgaWYgKGNvbm5lY3Rpb24gJiYgdXJpICE9PSBjb25uZWN0aW9uLmdldFVyaUZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICBpZiAocGVuZGluZ0ZpbGVzW3VyaV0pIHtcbiAgICAgICAgICAgIHJldHVybiBwZW5kaW5nRmlsZXNbdXJpXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgdGV4dEVkaXRvclByb21pc2UgPSBwZW5kaW5nRmlsZXNbdXJpXSA9IGNyZWF0ZUVkaXRvckZvck51Y2xpZGUoY29ubmVjdGlvbiwgdXJpKTtcbiAgICAgICAgICBjb25zdCByZW1vdmVGcm9tQ2FjaGUgPSAoKSA9PiBkZWxldGUgcGVuZGluZ0ZpbGVzW3VyaV07XG4gICAgICAgICAgdGV4dEVkaXRvclByb21pc2UudGhlbihyZW1vdmVGcm9tQ2FjaGUsIHJlbW92ZUZyb21DYWNoZSk7XG4gICAgICAgICAgcmV0dXJuIHRleHRFZGl0b3JQcm9taXNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgLy8gSWYgUmVtb3RlRGlyZWN0b3J5UHJvdmlkZXIgaXMgY2FsbGVkIGJlZm9yZSB0aGlzLCBhbmQgaXQgZmFpbGVkXG4gICAgLy8gdG8gcHJvdmlkZSBhIFJlbW90ZURpcmVjdG9yeSBmb3IgYVxuICAgIC8vIGdpdmVuIFVSSSwgQXRvbSB3aWxsIGNyZWF0ZSBhIGdlbmVyaWMgRGlyZWN0b3J5IHRvIHdyYXAgdGhhdC4gV2Ugd2FudFxuICAgIC8vIHRvIGRlbGV0ZSB0aGVzZSBpbnN0ZWFkLCBiZWNhdXNlIHRob3NlIGRpcmVjdG9yaWVzIGFyZW4ndCB2YWxpZC91c2VmdWxcbiAgICAvLyBpZiB0aGV5IGFyZSBub3QgdHJ1ZSBSZW1vdGVEaXJlY3Rvcnkgb2JqZWN0cyAoY29ubmVjdGVkIHRvIGEgcmVhbFxuICAgIC8vIHJlYWwgcmVtb3RlIGZvbGRlcikuXG4gICAgZGVsZXRlRHVtbXlSZW1vdGVSb290RGlyZWN0b3JpZXMoKTtcblxuICAgIC8vIEF0dGVtcHQgdG8gcmVsb2FkIHByZXZpb3VzbHkgb3BlbiBwcm9qZWN0cy5cbiAgICBjb25zdCByZW1vdGVQcm9qZWN0c0NvbmZpZyA9IHN0YXRlICYmIHN0YXRlLnJlbW90ZVByb2plY3RzQ29uZmlnO1xuICAgIGlmIChyZW1vdGVQcm9qZWN0c0NvbmZpZyAhPSBudWxsKSB7XG4gICAgICByZWxvYWRSZW1vdGVQcm9qZWN0cyhyZW1vdGVQcm9qZWN0c0NvbmZpZyk7XG4gICAgfVxuICAgIHBhY2thZ2VTdWJzY3JpcHRpb25zID0gc3Vic2NyaXB0aW9ucztcbiAgfSxcblxuICBjb25zdW1lU3RhdHVzQmFyKHN0YXR1c0JhcjogYXRvbSRTdGF0dXNCYXIpOiB2b2lkIHtcbiAgICBpZiAoY29udHJvbGxlcikge1xuICAgICAgY29udHJvbGxlci5jb25zdW1lU3RhdHVzQmFyKHN0YXR1c0Jhcik7XG4gICAgfVxuICB9LFxuXG4gIC8vIFRPRE86IEFsbCBvZiB0aGUgZWxlbWVudHMgb2YgdGhlIGFycmF5IGFyZSBub24tbnVsbCwgYnV0IGl0IGRvZXMgbm90IHNlZW0gcG9zc2libGUgdG8gY29udmluY2VcbiAgLy8gRmxvdyBvZiB0aGF0LlxuICBzZXJpYWxpemUoKToge3JlbW90ZVByb2plY3RzQ29uZmlnOiBBcnJheTw/U2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24+fSB7XG4gICAgY29uc3QgcmVtb3RlUHJvamVjdHNDb25maWc6IEFycmF5PD9TZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbj4gPVxuICAgICAgZ2V0UmVtb3RlUm9vdERpcmVjdG9yaWVzKClcbiAgICAgICAgLm1hcCgoZGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSk6ID9TZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbiA9PiB7XG4gICAgICAgICAgY29uc3QgY29ubmVjdGlvbiA9IFJlbW90ZUNvbm5lY3Rpb24uZ2V0Rm9yVXJpKGRpcmVjdG9yeS5nZXRQYXRoKCkpO1xuICAgICAgICAgIHJldHVybiBjb25uZWN0aW9uID9cbiAgICAgICAgICAgIGNyZWF0ZVNlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uKGNvbm5lY3Rpb24uZ2V0Q29uZmlnKCkpIDogbnVsbDtcbiAgICAgICAgfSlcbiAgICAgICAgLmZpbHRlcigoY29uZmlnOiA/U2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pID0+IGNvbmZpZyAhPSBudWxsKTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVtb3RlUHJvamVjdHNDb25maWcsXG4gICAgfTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGlmIChwYWNrYWdlU3Vic2NyaXB0aW9ucykge1xuICAgICAgcGFja2FnZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgcGFja2FnZVN1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChjb250cm9sbGVyICE9IG51bGwpIHtcbiAgICAgIGNvbnRyb2xsZXIuZGVzdHJveSgpO1xuICAgICAgY29udHJvbGxlciA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gIGNyZWF0ZVJlbW90ZURpcmVjdG9yeVByb3ZpZGVyKCk6IFJlbW90ZURpcmVjdG9yeVByb3ZpZGVyVCB7XG4gICAgY29uc3QgUmVtb3RlRGlyZWN0b3J5UHJvdmlkZXIgPSByZXF1aXJlKCcuL1JlbW90ZURpcmVjdG9yeVByb3ZpZGVyJyk7XG4gICAgcmV0dXJuIG5ldyBSZW1vdGVEaXJlY3RvcnlQcm92aWRlcigpO1xuICB9LFxuXG4gIGNyZWF0ZVJlbW90ZURpcmVjdG9yeVNlYXJjaGVyKCk6IFJlbW90ZURpcmVjdG9yeVNlYXJjaGVyVCB7XG4gICAgY29uc3Qge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9ID0gcmVxdWlyZSgnLi4vLi4vY2xpZW50Jyk7XG4gICAgY29uc3Qge1JlbW90ZURpcmVjdG9yeX0gPSByZXF1aXJlKCcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbicpO1xuICAgIGNvbnN0IFJlbW90ZURpcmVjdG9yeVNlYXJjaGVyID0gcmVxdWlyZSgnLi9SZW1vdGVEaXJlY3RvcnlTZWFyY2hlcicpO1xuICAgIHJldHVybiBuZXcgUmVtb3RlRGlyZWN0b3J5U2VhcmNoZXIoKGRpcjogUmVtb3RlRGlyZWN0b3J5KSA9PlxuICAgICAgKGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0ZpbmRJblByb2plY3RTZXJ2aWNlJywgZGlyLmdldFBhdGgoKSk6IEZpbmRJblByb2plY3RTZXJ2aWNlKSk7XG4gIH0sXG5cbiAgZ2V0SG9tZUZyYWdtZW50cygpOiBIb21lRnJhZ21lbnRzIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmVhdHVyZToge1xuICAgICAgICB0aXRsZTogJ1JlbW90ZSBDb25uZWN0aW9uJyxcbiAgICAgICAgaWNvbjogJ2Nsb3VkLXVwbG9hZCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ29ubmVjdCB0byBhIHJlbW90ZSBzZXJ2ZXIgdG8gZWRpdCBmaWxlcy4nLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1yZW1vdGUtcHJvamVjdHM6Y29ubmVjdCcsXG4gICAgICB9LFxuICAgICAgcHJpb3JpdHk6IDgsXG4gICAgfTtcbiAgfSxcblxufTtcbiJdfQ==