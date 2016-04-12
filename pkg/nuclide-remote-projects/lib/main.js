Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

var createEditorForNuclide = _asyncToGenerator(function* (uri) {
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

exports.activate = activate;
exports.consumeStatusBar = consumeStatusBar;
exports.serialize = serialize;
exports.deactivate = deactivate;
exports.createRemoteDirectoryProvider = createRemoteDirectoryProvider;
exports.createRemoteDirectorySearcher = createRemoteDirectorySearcher;
exports.getHomeFragments = getHomeFragments;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

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
    var closeConnection = function closeConnection(shutdownIfLast) {
      connection.close(shutdownIfLast);
    };

    if (!connection.isOnlyConnection()) {
      logger.info('Remaining remote projects using Nuclide Server - no prompt to shutdown');
      var shutdownIfLast = false;
      closeConnection(shutdownIfLast);
      return;
    }

    var buttons = ['Keep It', 'Shutdown'];
    var buttonToActions = new Map();

    buttonToActions.set(buttons[0], function () {
      return closeConnection( /* shutdownIfLast */false);
    });
    buttonToActions.set(buttons[1], function () {
      return closeConnection( /* shutdownIfLast */true);
    });

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

function activate(state) {
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
      if (connection && uri === connection.getUriForInitialWorkingDirectory()) {
        return;
      }
      if (pendingFiles[uri]) {
        return pendingFiles[uri];
      }
      var textEditorPromise = pendingFiles[uri] = createEditorForNuclide(uri);
      var removeFromCache = function removeFromCache() {
        return delete pendingFiles[uri];
      };
      textEditorPromise.then(removeFromCache, removeFromCache);
      return textEditorPromise;
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
}

function consumeStatusBar(statusBar) {
  if (controller) {
    controller.consumeStatusBar(statusBar);
  }
}

// TODO: All of the elements of the array are non-null, but it does not seem possible to convince
// Flow of that.

function serialize() {
  var remoteProjectsConfig = getRemoteRootDirectories().map(function (directory) {
    var connection = _nuclideRemoteConnection.RemoteConnection.getForUri(directory.getPath());
    return connection ? createSerializableRemoteConnectionConfiguration(connection.getConfig()) : null;
  }).filter(function (config) {
    return config != null;
  });
  return {
    remoteProjectsConfig: remoteProjectsConfig
  };
}

function deactivate() {
  if (packageSubscriptions) {
    packageSubscriptions.dispose();
    packageSubscriptions = null;
  }

  if (controller != null) {
    controller.destroy();
    controller = null;
  }
}

function createRemoteDirectoryProvider() {
  var RemoteDirectoryProvider = require('./RemoteDirectoryProvider');
  return new RemoteDirectoryProvider();
}

function createRemoteDirectorySearcher() {
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
}

function getHomeFragments() {
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
//# sourceMappingURL=data:application/json;base64,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QXNCLGFBQXRCLHNCQUFzQjs7a0JBQ0gsT0FBTyxDQUFDLGlDQUFpQyxDQUFDOztNQUE3RCxlQUFlLGFBQWYsZUFBZTs7QUFDdEIsTUFBTSx1QkFBdUIsR0FBRyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUNyRSxTQUFPLElBQUksdUJBQXVCLENBQUMsVUFBQyxHQUFHLEVBQXNCO0FBQzNELFFBQU0sT0FBTyxHQUFHLHNCQUFzQixDQUFDLHNCQUFzQixFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQzlFLDZCQUFVLE9BQU8sQ0FBQyxDQUFDO0FBQ25CLFdBQVEsT0FBTyxDQUF3QjtHQUN4QyxDQUFDLENBQUM7Q0FDSjs7QUFFTSxTQUFTLGdCQUFnQixHQUFrQjtBQUNoRCxTQUFPO0FBQ0wsV0FBTyxFQUFFO0FBQ1AsV0FBSyxFQUFFLG1CQUFtQjtBQUMxQixVQUFJLEVBQUUsY0FBYztBQUNwQixpQkFBVyxFQUFFLDJDQUEyQztBQUN4RCxhQUFPLEVBQUUsaUNBQWlDO0tBQzNDO0FBQ0QsWUFBUSxFQUFFLENBQUM7R0FDWixDQUFDO0NBQ0giLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIb21lRnJhZ21lbnRzfSBmcm9tICcuLi8uLi9udWNsaWRlLWhvbWUtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7XG4gIFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uL2xpYi9SZW1vdGVDb25uZWN0aW9uJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUgUmVtb3RlRGlyZWN0b3J5UHJvdmlkZXJUIGZyb20gJy4vUmVtb3RlRGlyZWN0b3J5UHJvdmlkZXInO1xuaW1wb3J0IHR5cGUgUmVtb3RlRGlyZWN0b3J5U2VhcmNoZXJUIGZyb20gJy4vUmVtb3RlRGlyZWN0b3J5U2VhcmNoZXInO1xuaW1wb3J0IHR5cGUgUmVtb3RlUHJvamVjdHNDb250cm9sbGVyVCBmcm9tICcuL1JlbW90ZVByb2plY3RzQ29udHJvbGxlcic7XG5pbXBvcnQgdHlwZW9mICogYXMgRmluZEluUHJvamVjdFNlcnZpY2UgZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtc2VhcmNoJztcblxuaW1wb3J0IHtjcmVhdGVUZXh0RWRpdG9yLCBsb2FkQnVmZmVyRm9yVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcbmltcG9ydCB7Z2V0T3BlbkZpbGVFZGl0b3JGb3JSZW1vdGVQcm9qZWN0fSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7UmVtb3RlQ29ubmVjdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbic7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG4vKipcbiAqIFN0b3JlcyB0aGUgaG9zdCBhbmQgY3dkIG9mIGEgcmVtb3RlIGNvbm5lY3Rpb24uXG4gKi9cbnR5cGUgU2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24gPSB7XG4gIGhvc3Q6IHN0cmluZztcbiAgY3dkOiBzdHJpbmc7XG4gIGRpc3BsYXlUaXRsZTogc3RyaW5nO1xufTtcblxubGV0IHBhY2thZ2VTdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZSA9IG51bGw7XG5sZXQgY29udHJvbGxlcjogP1JlbW90ZVByb2plY3RzQ29udHJvbGxlclQgPSBudWxsO1xuXG5jb25zdCBDTE9TRV9QUk9KRUNUX0RFTEFZX01TID0gMTAwO1xuY29uc3QgcGVuZGluZ0ZpbGVzID0ge307XG5cbmZ1bmN0aW9uIGNyZWF0ZVNlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uKFxuICBjb25maWc6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uLFxuKTogU2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24ge1xuICByZXR1cm4ge1xuICAgIGhvc3Q6IGNvbmZpZy5ob3N0LFxuICAgIGN3ZDogY29uZmlnLmN3ZCxcbiAgICBkaXNwbGF5VGl0bGU6IGNvbmZpZy5kaXNwbGF5VGl0bGUsXG4gIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVJlbW90ZUNvbm5lY3Rpb24oXG4gIHJlbW90ZVByb2plY3RDb25maWc6IFNlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uLFxuKTogUHJvbWlzZTw/UmVtb3RlQ29ubmVjdGlvbj4ge1xuICBjb25zdCB7aG9zdCwgY3dkLCBkaXNwbGF5VGl0bGV9ID0gcmVtb3RlUHJvamVjdENvbmZpZztcbiAgbGV0IGNvbm5lY3Rpb24gPSBSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWVBbmRQYXRoKGhvc3QsIGN3ZCk7XG4gIGlmIChjb25uZWN0aW9uICE9IG51bGwpIHtcbiAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgfVxuXG4gIGNvbm5lY3Rpb24gPSBhd2FpdCBSZW1vdGVDb25uZWN0aW9uLmNyZWF0ZUNvbm5lY3Rpb25CeVNhdmVkQ29uZmlnKGhvc3QsIGN3ZCwgZGlzcGxheVRpdGxlKTtcbiAgaWYgKGNvbm5lY3Rpb24gIT0gbnVsbCkge1xuICAgIHJldHVybiBjb25uZWN0aW9uO1xuICB9XG5cbiAgLy8gSWYgY29ubmVjdGlvbiBmYWlscyB1c2luZyBzYXZlZCBjb25maWcsIG9wZW4gY29ubmVjdCBkaWFsb2cuXG4gIGNvbnN0IHtvcGVuQ29ubmVjdGlvbkRpYWxvZ30gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXNzaC1kaWFsb2cnKTtcbiAgcmV0dXJuIG9wZW5Db25uZWN0aW9uRGlhbG9nKHtcbiAgICBpbml0aWFsU2VydmVyOiByZW1vdGVQcm9qZWN0Q29uZmlnLmhvc3QsXG4gICAgaW5pdGlhbEN3ZDogcmVtb3RlUHJvamVjdENvbmZpZy5jd2QsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRSZW1vdGVGb2xkZXJUb1Byb2plY3QoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbikge1xuICBjb25zdCB3b3JraW5nRGlyZWN0b3J5VXJpID0gY29ubmVjdGlvbi5nZXRVcmlGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpO1xuICAvLyBJZiByZXN0b3Jpbmcgc3RhdGUsIHRoZW4gdGhlIHByb2plY3QgYWxyZWFkeSBleGlzdHMgd2l0aCBsb2NhbCBkaXJlY3RvcnkgYW5kIHdyb25nIHJlcG9cbiAgLy8gaW5zdGFuY2VzLiBIZW5jZSwgd2UgcmVtb3ZlIGl0IGhlcmUsIGlmIGV4aXN0aW5nLCBhbmQgYWRkIHRoZSBuZXcgcGF0aCBmb3Igd2hpY2ggd2UgYWRkZWQgYVxuICAvLyB3b3Jrc3BhY2Ugb3BlbmVyIGhhbmRsZXIuXG4gIGF0b20ucHJvamVjdC5yZW1vdmVQYXRoKHdvcmtpbmdEaXJlY3RvcnlVcmkpO1xuXG4gIGF0b20ucHJvamVjdC5hZGRQYXRoKHdvcmtpbmdEaXJlY3RvcnlVcmkpO1xuXG4gIGNvbnN0IHN1YnNjcmlwdGlvbiA9IGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKCgpID0+IHtcbiAgICAvLyBEZWxheSBjbG9zaW5nIHRoZSB1bmRlcmx5aW5nIHNvY2tldCBjb25uZWN0aW9uIHVudGlsIHJlZ2lzdGVyZWQgc3Vic2NyaXB0aW9ucyBoYXZlIGNsb3NlZC5cbiAgICAvLyBXZSBzaG91bGQgbmV2ZXIgZGVwZW5kIG9uIHRoZSBvcmRlciBvZiByZWdpc3RyYXRpb24gb2YgdGhlIGBvbkRpZENoYW5nZVBhdGhzYCBldmVudCxcbiAgICAvLyB3aGljaCBhbHNvIGRpc3Bvc2UgY29uc3VtZWQgc2VydmljZSdzIHJlc291cmNlcy5cbiAgICBzZXRUaW1lb3V0KGNoZWNrQ2xvc2VkUHJvamVjdCwgQ0xPU0VfUFJPSkVDVF9ERUxBWV9NUyk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGNoZWNrQ2xvc2VkUHJvamVjdCgpIHtcbiAgICAvLyBUaGUgcHJvamVjdCBwYXRocyBtYXkgaGF2ZSBjaGFuZ2VkIGR1cmluZyB0aGUgZGVsYXkgdGltZS5cbiAgICAvLyBIZW5jZSwgdGhlIGxhdGVzdCBwcm9qZWN0IHBhdGhzIGFyZSBmZXRjaGVkIGhlcmUuXG4gICAgY29uc3QgcGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKTtcbiAgICBpZiAocGF0aHMuaW5kZXhPZih3b3JraW5nRGlyZWN0b3J5VXJpKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gVGhlIHByb2plY3Qgd2FzIHJlbW92ZWQgZnJvbSB0aGUgdHJlZS5cbiAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuXG4gICAgY2xvc2VPcGVuRmlsZXNGb3JSZW1vdGVQcm9qZWN0KGNvbm5lY3Rpb24uZ2V0Q29uZmlnKCkpO1xuXG4gICAgY29uc3QgaG9zdG5hbWUgPSBjb25uZWN0aW9uLmdldFJlbW90ZUhvc3RuYW1lKCk7XG4gICAgY29uc3QgY2xvc2VDb25uZWN0aW9uID0gKHNodXRkb3duSWZMYXN0OiBib29sZWFuKSA9PiB7XG4gICAgICBjb25uZWN0aW9uLmNsb3NlKHNodXRkb3duSWZMYXN0KTtcbiAgICB9O1xuXG4gICAgaWYgKCFjb25uZWN0aW9uLmlzT25seUNvbm5lY3Rpb24oKSkge1xuICAgICAgbG9nZ2VyLmluZm8oJ1JlbWFpbmluZyByZW1vdGUgcHJvamVjdHMgdXNpbmcgTnVjbGlkZSBTZXJ2ZXIgLSBubyBwcm9tcHQgdG8gc2h1dGRvd24nKTtcbiAgICAgIGNvbnN0IHNodXRkb3duSWZMYXN0ID0gZmFsc2U7XG4gICAgICBjbG9zZUNvbm5lY3Rpb24oc2h1dGRvd25JZkxhc3QpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1dHRvbnMgPSBbJ0tlZXAgSXQnLCAnU2h1dGRvd24nXTtcbiAgICBjb25zdCBidXR0b25Ub0FjdGlvbnMgPSBuZXcgTWFwKCk7XG5cbiAgICBidXR0b25Ub0FjdGlvbnMuc2V0KGJ1dHRvbnNbMF0sICgpID0+IGNsb3NlQ29ubmVjdGlvbigvKiBzaHV0ZG93bklmTGFzdCAqLyBmYWxzZSkpO1xuICAgIGJ1dHRvblRvQWN0aW9ucy5zZXQoYnV0dG9uc1sxXSwgKCkgPT4gY2xvc2VDb25uZWN0aW9uKC8qIHNodXRkb3duSWZMYXN0ICovIHRydWUpKTtcblxuICAgIGlmIChmZWF0dXJlQ29uZmlnLmdldChcbiAgICAgICdudWNsaWRlLXJlbW90ZS1wcm9qZWN0cy5zaHV0ZG93blNlcnZlckFmdGVyRGlzY29ubmVjdGlvbicsXG4gICAgKSkge1xuICAgICAgLy8gQXRvbSB0YWtlcyB0aGUgZmlyc3QgYnV0dG9uIGluIHRoZSBsaXN0IGFzIGRlZmF1bHQgb3B0aW9uLlxuICAgICAgYnV0dG9ucy5yZXZlcnNlKCk7XG4gICAgfVxuXG4gICAgY29uc3QgY2hvaWNlID0gZ2xvYmFsLmF0b20uY29uZmlybSh7XG4gICAgICBtZXNzYWdlOiAnTm8gbW9yZSByZW1vdGUgcHJvamVjdHMgb24gdGhlIGhvc3Q6IFxcJycgKyBob3N0bmFtZSArXG4gICAgICAgICdcXCcuIFdvdWxkIHlvdSBsaWtlIHRvIHNodXRkb3duIE51Y2xpZGUgc2VydmVyIHRoZXJlPycsXG4gICAgICBidXR0b25zLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYWN0aW9uID0gYnV0dG9uVG9BY3Rpb25zLmdldChidXR0b25zW2Nob2ljZV0pO1xuICAgIGludmFyaWFudChhY3Rpb24pO1xuICAgIGFjdGlvbigpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNsb3NlT3BlbkZpbGVzRm9yUmVtb3RlUHJvamVjdChyZW1vdGVQcm9qZWN0Q29uZmlnOiBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbik6IHZvaWQge1xuICBjb25zdCBvcGVuSW5zdGFuY2VzID0gZ2V0T3BlbkZpbGVFZGl0b3JGb3JSZW1vdGVQcm9qZWN0KHJlbW90ZVByb2plY3RDb25maWcpO1xuICBmb3IgKGNvbnN0IG9wZW5JbnN0YW5jZSBvZiBvcGVuSW5zdGFuY2VzKSB7XG4gICAgY29uc3Qge2VkaXRvciwgcGFuZX0gPSBvcGVuSW5zdGFuY2U7XG4gICAgcGFuZS5yZW1vdmVJdGVtKGVkaXRvcik7XG4gICAgZWRpdG9yLmRlc3Ryb3koKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRSZW1vdGVSb290RGlyZWN0b3JpZXMoKTogQXJyYXk8YXRvbSREaXJlY3Rvcnk+IHtcbiAgLy8gVE9ETzogVXNlIG51Y2xpZGUtcmVtb3RlLXVyaSBpbnN0ZWFkLlxuICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCkuZmlsdGVyKFxuICAgIGRpcmVjdG9yeSA9PiBkaXJlY3RvcnkuZ2V0UGF0aCgpLnN0YXJ0c1dpdGgoJ251Y2xpZGU6JykpO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYW55IERpcmVjdG9yeSAobm90IFJlbW90ZURpcmVjdG9yeSkgb2JqZWN0cyB0aGF0IGhhdmUgTnVjbGlkZVxuICogcmVtb3RlIFVSSXMuXG4gKi9cbmZ1bmN0aW9uIGRlbGV0ZUR1bW15UmVtb3RlUm9vdERpcmVjdG9yaWVzKCkge1xuICBjb25zdCB7UmVtb3RlRGlyZWN0b3J5fSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24nKTtcbiAgY29uc3Qge2lzUmVtb3RlfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaScpO1xuICBmb3IgKGNvbnN0IGRpcmVjdG9yeSBvZiBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKSkge1xuICAgIGlmIChpc1JlbW90ZShkaXJlY3RvcnkuZ2V0UGF0aCgpKSAmJlxuICAgICAgICAhKFJlbW90ZURpcmVjdG9yeS5pc1JlbW90ZURpcmVjdG9yeShkaXJlY3RvcnkpKSkge1xuICAgICAgYXRvbS5wcm9qZWN0LnJlbW92ZVBhdGgoZGlyZWN0b3J5LmdldFBhdGgoKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogVGhlIHNhbWUgVGV4dEVkaXRvciBtdXN0IGJlIHJldHVybmVkIHRvIHByZXZlbnQgQXRvbSBmcm9tIGNyZWF0aW5nIG11bHRpcGxlIHRhYnNcbiAqIGZvciB0aGUgc2FtZSBmaWxlLCBiZWNhdXNlIEF0b20gZG9lc24ndCBjYWNoZSBwZW5kaW5nIG9wZW5lciBwcm9taXNlcy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlRWRpdG9yRm9yTnVjbGlkZShcbiAgdXJpOiBOdWNsaWRlVXJpLFxuKTogUHJvbWlzZTxUZXh0RWRpdG9yPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgYnVmZmVyID0gYXdhaXQgbG9hZEJ1ZmZlckZvclVyaSh1cmkpO1xuICAgIHJldHVybiBjcmVhdGVUZXh0RWRpdG9yKHtidWZmZXJ9KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgbG9nZ2VyLndhcm4oJ2J1ZmZlciBsb2FkIGlzc3VlOicsIGVycik7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBGYWlsZWQgdG8gb3BlbiAke3VyaX06ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgdGhyb3cgZXJyO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHJlbW90ZSBidWZmZXIgaGFzIGFscmVhZHkgYmVlbiBpbml0aWFsaXplZCBpbiBlZGl0b3IuXG4gKiBUaGlzIGNoZWNrcyBpZiB0aGUgYnVmZmVyIGlzIGluc3RhbmNlIG9mIE51Y2xpZGVUZXh0QnVmZmVyLlxuICovXG5mdW5jdGlvbiBpc1JlbW90ZUJ1ZmZlckluaXRpYWxpemVkKGVkaXRvcjogVGV4dEVkaXRvcik6IGJvb2xlYW4ge1xuICBjb25zdCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKCk7XG4gIC8vICRGbG93SXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9mbG93L2lzc3Vlcy8xMzc1XG4gIGlmIChidWZmZXIgJiYgYnVmZmVyLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdOdWNsaWRlVGV4dEJ1ZmZlcicpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlbG9hZFJlbW90ZVByb2plY3RzKFxuICByZW1vdGVQcm9qZWN0czogQXJyYXk8U2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24+LFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIC8vIFRoaXMgaXMgaW50ZW50aW9uYWxseSBzZXJpYWwuXG4gIC8vIFRoZSA5MCUgdXNlIGNhc2UgaXMgdG8gaGF2ZSBtdWx0aXBsZSByZW1vdGUgcHJvamVjdHMgZm9yIGEgc2luZ2xlIGNvbm5lY3Rpb247XG4gIC8vIGFmdGVyIHRoZSBmaXJzdCBvbmUgc3VjY2VlZHMgdGhlIHJlc3Qgc2hvdWxkIHJlcXVpcmUgbm8gdXNlciBhY3Rpb24uXG4gIGZvciAoY29uc3QgY29uZmlnIG9mIHJlbW90ZVByb2plY3RzKSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcCAqL1xuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCBjcmVhdGVSZW1vdGVDb25uZWN0aW9uKGNvbmZpZyk7XG4gICAgaWYgKCFjb25uZWN0aW9uKSB7XG4gICAgICBsb2dnZXIuaW5mbyhcbiAgICAgICAgJ05vIFJlbW90ZUNvbm5lY3Rpb24gcmV0dXJuZWQgb24gcmVzdG9yZSBzdGF0ZSB0cmlhbDonLFxuICAgICAgICBjb25maWcuaG9zdCxcbiAgICAgICAgY29uZmlnLmN3ZCxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEl0J3MgZmluZSB0aGUgdXNlciBjb25uZWN0ZWQgdG8gYSBkaWZmZXJlbnQgcHJvamVjdCBvbiB0aGUgc2FtZSBob3N0OlxuICAgICAgLy8gd2Ugc2hvdWxkIHN0aWxsIGJlIGFibGUgdG8gcmVzdG9yZSB0aGlzIHVzaW5nIHRoZSBuZXcgY29ubmVjdGlvbi5cbiAgICAgIGNvbnN0IHtjd2QsIGhvc3QsIGRpc3BsYXlUaXRsZX0gPSBjb25maWc7XG4gICAgICBpZiAoY29ubmVjdGlvbi5nZXRQYXRoRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKSAhPT0gY3dkICYmXG4gICAgICAgICAgY29ubmVjdGlvbi5nZXRSZW1vdGVIb3N0bmFtZSgpID09PSBob3N0KSB7XG4gICAgICAgIGF3YWl0IFJlbW90ZUNvbm5lY3Rpb24uY3JlYXRlQ29ubmVjdGlvbkJ5U2F2ZWRDb25maWcoaG9zdCwgY3dkLCBkaXNwbGF5VGl0bGUpO1xuICAgICAgfVxuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoXG4gIHN0YXRlOiA/e3JlbW90ZVByb2plY3RzQ29uZmlnOiBTZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbltdfSxcbik6IHZvaWQge1xuICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICBjb25zdCBSZW1vdGVQcm9qZWN0c0NvbnRyb2xsZXIgPSByZXF1aXJlKCcuL1JlbW90ZVByb2plY3RzQ29udHJvbGxlcicpO1xuICBjb250cm9sbGVyID0gbmV3IFJlbW90ZVByb2plY3RzQ29udHJvbGxlcigpO1xuXG4gIHN1YnNjcmlwdGlvbnMuYWRkKFJlbW90ZUNvbm5lY3Rpb24ub25EaWRBZGRSZW1vdGVDb25uZWN0aW9uKGNvbm5lY3Rpb24gPT4ge1xuICAgIGFkZFJlbW90ZUZvbGRlclRvUHJvamVjdChjb25uZWN0aW9uKTtcblxuXG4gICAgLy8gT24gQXRvbSByZXN0YXJ0LCBpdCB0cmllcyB0byBvcGVuIHVyaSBwYXRocyBhcyBsb2NhbCBgVGV4dEVkaXRvcmAgcGFuZSBpdGVtcy5cbiAgICAvLyBIZXJlLCBOdWNsaWRlIHJlbG9hZHMgdGhlIHJlbW90ZSBwcm9qZWN0IGZpbGVzIHRoYXQgaGF2ZSBlbXB0eSB0ZXh0IGVkaXRvcnMgb3Blbi5cbiAgICBjb25zdCBjb25maWcgPSBjb25uZWN0aW9uLmdldENvbmZpZygpO1xuICAgIGNvbnN0IG9wZW5JbnN0YW5jZXMgPSBnZXRPcGVuRmlsZUVkaXRvckZvclJlbW90ZVByb2plY3QoY29uZmlnKTtcbiAgICBmb3IgKGNvbnN0IG9wZW5JbnN0YW5jZSBvZiBvcGVuSW5zdGFuY2VzKSB7XG4gICAgICAvLyBLZWVwIHRoZSBvcmlnaW5hbCBvcGVuIGVkaXRvciBpdGVtIHdpdGggYSB1bmlxdWUgbmFtZSB1bnRpbCB0aGUgcmVtb3RlIGJ1ZmZlciBpcyBsb2FkZWQsXG4gICAgICAvLyBUaGVuLCB3ZSBhcmUgcmVhZHkgdG8gcmVwbGFjZSBpdCB3aXRoIHRoZSByZW1vdGUgdGFiIGluIHRoZSBzYW1lIHBhbmUuXG4gICAgICBjb25zdCB7cGFuZSwgZWRpdG9yLCB1cmksIGZpbGVQYXRofSA9IG9wZW5JbnN0YW5jZTtcblxuICAgICAgLy8gU2tpcCByZXN0b3JpbmcgdGhlIGVkaXRlciB3aG8gaGFzIHJlbW90ZSBjb250ZW50IGxvYWRlZC5cbiAgICAgIGlmIChpc1JlbW90ZUJ1ZmZlckluaXRpYWxpemVkKGVkaXRvcikpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIEhlcmUsIGEgdW5pcXVlIHVyaSBpcyBwaWNrZWQgdG8gdGhlIHBlbmRpbmcgb3BlbiBwYW5lIGl0ZW0gdG8gbWFpbnRhaW4gdGhlIHBhbmUgbGF5b3V0LlxuICAgICAgLy8gT3RoZXJ3aXNlLCB0aGUgb3BlbiB3b24ndCBiZSBjb21wbGV0ZWQgYmVjYXVzZSB0aGVyZSBleGlzdHMgYSBwYW5lIGl0ZW0gd2l0aCB0aGUgc2FtZVxuICAgICAgLy8gdXJpLlxuICAgICAgLyogJEZsb3dGaXhNZSAqL1xuICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLmZpbGUucGF0aCA9IGAke3VyaX0udG8tY2xvc2VgO1xuICAgICAgLy8gQ2xlYW51cCB0aGUgb2xkIHBhbmUgaXRlbSBvbiBzdWNjZXNzZnVsIG9wZW5pbmcgb3Igd2hlbiBubyBjb25uZWN0aW9uIGNvdWxkIGJlXG4gICAgICAvLyBlc3RhYmxpc2hlZC5cbiAgICAgIGNvbnN0IGNsZWFudXBCdWZmZXIgPSAoKSA9PiB7XG4gICAgICAgIHBhbmUucmVtb3ZlSXRlbShlZGl0b3IpO1xuICAgICAgICBlZGl0b3IuZGVzdHJveSgpO1xuICAgICAgfTtcbiAgICAgIGlmIChmaWxlUGF0aCA9PT0gY29uZmlnLmN3ZCkge1xuICAgICAgICBjbGVhbnVwQnVmZmVyKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZiB3ZSBjbGVhbiB1cCB0aGUgYnVmZmVyIGJlZm9yZSB0aGUgYG9wZW5VcmlJblBhbmVgIGZpbmlzaGVzLFxuICAgICAgICAvLyB0aGUgcGFuZSB3aWxsIGJlIGNsb3NlZCwgYmVjYXVzZSBpdCBjb3VsZCBoYXZlIG5vIG90aGVyIGl0ZW1zLlxuICAgICAgICAvLyBTbyB3ZSBtdXN0IGNsZWFuIHVwIGFmdGVyLlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuVVJJSW5QYW5lKHVyaSwgcGFuZSkudGhlbihjbGVhbnVwQnVmZmVyLCBjbGVhbnVwQnVmZmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pKTtcblxuICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAnbnVjbGlkZS1yZW1vdGUtcHJvamVjdHM6Y29ubmVjdCcsXG4gICAgICAoKSA9PiByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXNzaC1kaWFsb2cnKS5vcGVuQ29ubmVjdGlvbkRpYWxvZygpXG4gICkpO1xuXG4gIC8vIFN1YnNjcmliZSBvcGVuZXIgYmVmb3JlIHJlc3RvcmluZyB0aGUgcmVtb3RlIHByb2plY3RzLlxuICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIoKHVyaSA9ICcnKSA9PiB7XG4gICAgaWYgKHVyaS5zdGFydHNXaXRoKCdudWNsaWRlOicpKSB7XG4gICAgICBjb25zdCBjb25uZWN0aW9uID0gUmVtb3RlQ29ubmVjdGlvbi5nZXRGb3JVcmkodXJpKTtcbiAgICAgIC8vIE9uIEF0b20gcmVzdGFydCwgaXQgdHJpZXMgdG8gb3BlbiB0aGUgdXJpIHBhdGggYXMgYSBmaWxlIHRhYiBiZWNhdXNlIGl0J3Mgbm90IGEgbG9jYWxcbiAgICAgIC8vIGRpcmVjdG9yeS4gV2UgY2FuJ3QgbGV0IHRoYXQgY3JlYXRlIGEgZmlsZSB3aXRoIHRoZSBpbml0aWFsIHdvcmtpbmcgZGlyZWN0b3J5IHBhdGguXG4gICAgICBpZiAoY29ubmVjdGlvbiAmJiB1cmkgPT09IGNvbm5lY3Rpb24uZ2V0VXJpRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocGVuZGluZ0ZpbGVzW3VyaV0pIHtcbiAgICAgICAgcmV0dXJuIHBlbmRpbmdGaWxlc1t1cmldO1xuICAgICAgfVxuICAgICAgY29uc3QgdGV4dEVkaXRvclByb21pc2UgPSBwZW5kaW5nRmlsZXNbdXJpXSA9IGNyZWF0ZUVkaXRvckZvck51Y2xpZGUodXJpKTtcbiAgICAgIGNvbnN0IHJlbW92ZUZyb21DYWNoZSA9ICgpID0+IGRlbGV0ZSBwZW5kaW5nRmlsZXNbdXJpXTtcbiAgICAgIHRleHRFZGl0b3JQcm9taXNlLnRoZW4ocmVtb3ZlRnJvbUNhY2hlLCByZW1vdmVGcm9tQ2FjaGUpO1xuICAgICAgcmV0dXJuIHRleHRFZGl0b3JQcm9taXNlO1xuICAgIH1cbiAgfSkpO1xuXG4gIC8vIElmIFJlbW90ZURpcmVjdG9yeVByb3ZpZGVyIGlzIGNhbGxlZCBiZWZvcmUgdGhpcywgYW5kIGl0IGZhaWxlZFxuICAvLyB0byBwcm92aWRlIGEgUmVtb3RlRGlyZWN0b3J5IGZvciBhXG4gIC8vIGdpdmVuIFVSSSwgQXRvbSB3aWxsIGNyZWF0ZSBhIGdlbmVyaWMgRGlyZWN0b3J5IHRvIHdyYXAgdGhhdC4gV2Ugd2FudFxuICAvLyB0byBkZWxldGUgdGhlc2UgaW5zdGVhZCwgYmVjYXVzZSB0aG9zZSBkaXJlY3RvcmllcyBhcmVuJ3QgdmFsaWQvdXNlZnVsXG4gIC8vIGlmIHRoZXkgYXJlIG5vdCB0cnVlIFJlbW90ZURpcmVjdG9yeSBvYmplY3RzIChjb25uZWN0ZWQgdG8gYSByZWFsXG4gIC8vIHJlYWwgcmVtb3RlIGZvbGRlcikuXG4gIGRlbGV0ZUR1bW15UmVtb3RlUm9vdERpcmVjdG9yaWVzKCk7XG5cbiAgLy8gQXR0ZW1wdCB0byByZWxvYWQgcHJldmlvdXNseSBvcGVuIHByb2plY3RzLlxuICBjb25zdCByZW1vdGVQcm9qZWN0c0NvbmZpZyA9IHN0YXRlICYmIHN0YXRlLnJlbW90ZVByb2plY3RzQ29uZmlnO1xuICBpZiAocmVtb3RlUHJvamVjdHNDb25maWcgIT0gbnVsbCkge1xuICAgIHJlbG9hZFJlbW90ZVByb2plY3RzKHJlbW90ZVByb2plY3RzQ29uZmlnKTtcbiAgfVxuICBwYWNrYWdlU3Vic2NyaXB0aW9ucyA9IHN1YnNjcmlwdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lU3RhdHVzQmFyKHN0YXR1c0JhcjogYXRvbSRTdGF0dXNCYXIpOiB2b2lkIHtcbiAgaWYgKGNvbnRyb2xsZXIpIHtcbiAgICBjb250cm9sbGVyLmNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyKTtcbiAgfVxufVxuXG4vLyBUT0RPOiBBbGwgb2YgdGhlIGVsZW1lbnRzIG9mIHRoZSBhcnJheSBhcmUgbm9uLW51bGwsIGJ1dCBpdCBkb2VzIG5vdCBzZWVtIHBvc3NpYmxlIHRvIGNvbnZpbmNlXG4vLyBGbG93IG9mIHRoYXQuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplKFxuKToge3JlbW90ZVByb2plY3RzQ29uZmlnOiBBcnJheTw/U2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24+fSB7XG4gIGNvbnN0IHJlbW90ZVByb2plY3RzQ29uZmlnOiBBcnJheTw/U2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24+ID1cbiAgICBnZXRSZW1vdGVSb290RGlyZWN0b3JpZXMoKVxuICAgICAgLm1hcCgoZGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSk6ID9TZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbiA9PiB7XG4gICAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBSZW1vdGVDb25uZWN0aW9uLmdldEZvclVyaShkaXJlY3RvcnkuZ2V0UGF0aCgpKTtcbiAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb24gP1xuICAgICAgICAgIGNyZWF0ZVNlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uKGNvbm5lY3Rpb24uZ2V0Q29uZmlnKCkpIDogbnVsbDtcbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKChjb25maWc6ID9TZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbikgPT4gY29uZmlnICE9IG51bGwpO1xuICByZXR1cm4ge1xuICAgIHJlbW90ZVByb2plY3RzQ29uZmlnLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgaWYgKHBhY2thZ2VTdWJzY3JpcHRpb25zKSB7XG4gICAgcGFja2FnZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIHBhY2thZ2VTdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgfVxuXG4gIGlmIChjb250cm9sbGVyICE9IG51bGwpIHtcbiAgICBjb250cm9sbGVyLmRlc3Ryb3koKTtcbiAgICBjb250cm9sbGVyID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVtb3RlRGlyZWN0b3J5UHJvdmlkZXIoKTogUmVtb3RlRGlyZWN0b3J5UHJvdmlkZXJUIHtcbiAgY29uc3QgUmVtb3RlRGlyZWN0b3J5UHJvdmlkZXIgPSByZXF1aXJlKCcuL1JlbW90ZURpcmVjdG9yeVByb3ZpZGVyJyk7XG4gIHJldHVybiBuZXcgUmVtb3RlRGlyZWN0b3J5UHJvdmlkZXIoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlbW90ZURpcmVjdG9yeVNlYXJjaGVyKCk6IFJlbW90ZURpcmVjdG9yeVNlYXJjaGVyVCB7XG4gIGNvbnN0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY2xpZW50Jyk7XG4gIGNvbnN0IHtSZW1vdGVEaXJlY3Rvcnl9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbicpO1xuICBjb25zdCBSZW1vdGVEaXJlY3RvcnlTZWFyY2hlciA9IHJlcXVpcmUoJy4vUmVtb3RlRGlyZWN0b3J5U2VhcmNoZXInKTtcbiAgcmV0dXJuIG5ldyBSZW1vdGVEaXJlY3RvcnlTZWFyY2hlcigoZGlyOiBSZW1vdGVEaXJlY3RvcnkpID0+IHtcbiAgICBjb25zdCBzZXJ2aWNlID0gZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnRmluZEluUHJvamVjdFNlcnZpY2UnLCBkaXIuZ2V0UGF0aCgpKTtcbiAgICBpbnZhcmlhbnQoc2VydmljZSk7XG4gICAgcmV0dXJuIChzZXJ2aWNlOiBGaW5kSW5Qcm9qZWN0U2VydmljZSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SG9tZUZyYWdtZW50cygpOiBIb21lRnJhZ21lbnRzIHtcbiAgcmV0dXJuIHtcbiAgICBmZWF0dXJlOiB7XG4gICAgICB0aXRsZTogJ1JlbW90ZSBDb25uZWN0aW9uJyxcbiAgICAgIGljb246ICdjbG91ZC11cGxvYWQnLFxuICAgICAgZGVzY3JpcHRpb246ICdDb25uZWN0IHRvIGEgcmVtb3RlIHNlcnZlciB0byBlZGl0IGZpbGVzLicsXG4gICAgICBjb21tYW5kOiAnbnVjbGlkZS1yZW1vdGUtcHJvamVjdHM6Y29ubmVjdCcsXG4gICAgfSxcbiAgICBwcmlvcml0eTogOCxcbiAgfTtcbn1cbiJdfQ==