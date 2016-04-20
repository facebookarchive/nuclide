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
    return atom.workspace.buildTextEditor({ buffer: buffer });
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
//# sourceMappingURL=data:application/json;base64,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LHNCQUFzQixDQUFDOztNQUF6RCxzQkFBc0IsYUFBdEIsc0JBQXNCOztrQkFDSCxPQUFPLENBQUMsaUNBQWlDLENBQUM7O01BQTdELGVBQWUsYUFBZixlQUFlOztBQUN0QixNQUFNLHVCQUF1QixHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQ3JFLFNBQU8sSUFBSSx1QkFBdUIsQ0FBQyxVQUFDLEdBQUcsRUFBc0I7QUFDM0QsUUFBTSxPQUFPLEdBQUcsc0JBQXNCLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDOUUsNkJBQVUsT0FBTyxDQUFDLENBQUM7QUFDbkIsV0FBUSxPQUFPLENBQXdCO0dBQ3hDLENBQUMsQ0FBQztDQUNKOztBQUVNLFNBQVMsZ0JBQWdCLEdBQWtCO0FBQ2hELFNBQU87QUFDTCxXQUFPLEVBQUU7QUFDUCxXQUFLLEVBQUUsbUJBQW1CO0FBQzFCLFVBQUksRUFBRSxjQUFjO0FBQ3BCLGlCQUFXLEVBQUUsMkNBQTJDO0FBQ3hELGFBQU8sRUFBRSxpQ0FBaUM7S0FDM0M7QUFDRCxZQUFRLEVBQUUsQ0FBQztHQUNaLENBQUM7Q0FDSCIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hvbWVGcmFnbWVudHN9IGZyb20gJy4uLy4uL251Y2xpZGUtaG9tZS1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtcbiAgUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24sXG59IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24vbGliL1JlbW90ZUNvbm5lY3Rpb24nO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSBSZW1vdGVEaXJlY3RvcnlQcm92aWRlclQgZnJvbSAnLi9SZW1vdGVEaXJlY3RvcnlQcm92aWRlcic7XG5pbXBvcnQgdHlwZSBSZW1vdGVEaXJlY3RvcnlTZWFyY2hlclQgZnJvbSAnLi9SZW1vdGVEaXJlY3RvcnlTZWFyY2hlcic7XG5pbXBvcnQgdHlwZSBSZW1vdGVQcm9qZWN0c0NvbnRyb2xsZXJUIGZyb20gJy4vUmVtb3RlUHJvamVjdHNDb250cm9sbGVyJztcbmltcG9ydCB0eXBlb2YgKiBhcyBGaW5kSW5Qcm9qZWN0U2VydmljZSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1zZWFyY2gnO1xuXG5pbXBvcnQge2xvYWRCdWZmZXJGb3JVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuaW1wb3J0IHtnZXRPcGVuRmlsZUVkaXRvckZvclJlbW90ZVByb2plY3R9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vbnVjbGlkZS1mZWF0dXJlLWNvbmZpZyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtSZW1vdGVDb25uZWN0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbi8qKlxuICogU3RvcmVzIHRoZSBob3N0IGFuZCBjd2Qgb2YgYSByZW1vdGUgY29ubmVjdGlvbi5cbiAqL1xudHlwZSBTZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbiA9IHtcbiAgaG9zdDogc3RyaW5nO1xuICBjd2Q6IHN0cmluZztcbiAgZGlzcGxheVRpdGxlOiBzdHJpbmc7XG59O1xuXG5sZXQgcGFja2FnZVN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlID0gbnVsbDtcbmxldCBjb250cm9sbGVyOiA/UmVtb3RlUHJvamVjdHNDb250cm9sbGVyVCA9IG51bGw7XG5cbmNvbnN0IENMT1NFX1BST0pFQ1RfREVMQVlfTVMgPSAxMDA7XG5jb25zdCBwZW5kaW5nRmlsZXMgPSB7fTtcblxuZnVuY3Rpb24gY3JlYXRlU2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24oXG4gIGNvbmZpZzogUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24sXG4pOiBTZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbiB7XG4gIHJldHVybiB7XG4gICAgaG9zdDogY29uZmlnLmhvc3QsXG4gICAgY3dkOiBjb25maWcuY3dkLFxuICAgIGRpc3BsYXlUaXRsZTogY29uZmlnLmRpc3BsYXlUaXRsZSxcbiAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlUmVtb3RlQ29ubmVjdGlvbihcbiAgcmVtb3RlUHJvamVjdENvbmZpZzogU2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24sXG4pOiBQcm9taXNlPD9SZW1vdGVDb25uZWN0aW9uPiB7XG4gIGNvbnN0IHtob3N0LCBjd2QsIGRpc3BsYXlUaXRsZX0gPSByZW1vdGVQcm9qZWN0Q29uZmlnO1xuICBsZXQgY29ubmVjdGlvbiA9IFJlbW90ZUNvbm5lY3Rpb24uZ2V0QnlIb3N0bmFtZUFuZFBhdGgoaG9zdCwgY3dkKTtcbiAgaWYgKGNvbm5lY3Rpb24gIT0gbnVsbCkge1xuICAgIHJldHVybiBjb25uZWN0aW9uO1xuICB9XG5cbiAgY29ubmVjdGlvbiA9IGF3YWl0IFJlbW90ZUNvbm5lY3Rpb24uY3JlYXRlQ29ubmVjdGlvbkJ5U2F2ZWRDb25maWcoaG9zdCwgY3dkLCBkaXNwbGF5VGl0bGUpO1xuICBpZiAoY29ubmVjdGlvbiAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gIH1cblxuICAvLyBJZiBjb25uZWN0aW9uIGZhaWxzIHVzaW5nIHNhdmVkIGNvbmZpZywgb3BlbiBjb25uZWN0IGRpYWxvZy5cbiAgY29uc3Qge29wZW5Db25uZWN0aW9uRGlhbG9nfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtc3NoLWRpYWxvZycpO1xuICByZXR1cm4gb3BlbkNvbm5lY3Rpb25EaWFsb2coe1xuICAgIGluaXRpYWxTZXJ2ZXI6IHJlbW90ZVByb2plY3RDb25maWcuaG9zdCxcbiAgICBpbml0aWFsQ3dkOiByZW1vdGVQcm9qZWN0Q29uZmlnLmN3ZCxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGFkZFJlbW90ZUZvbGRlclRvUHJvamVjdChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uKSB7XG4gIGNvbnN0IHdvcmtpbmdEaXJlY3RvcnlVcmkgPSBjb25uZWN0aW9uLmdldFVyaUZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCk7XG4gIC8vIElmIHJlc3RvcmluZyBzdGF0ZSwgdGhlbiB0aGUgcHJvamVjdCBhbHJlYWR5IGV4aXN0cyB3aXRoIGxvY2FsIGRpcmVjdG9yeSBhbmQgd3JvbmcgcmVwb1xuICAvLyBpbnN0YW5jZXMuIEhlbmNlLCB3ZSByZW1vdmUgaXQgaGVyZSwgaWYgZXhpc3RpbmcsIGFuZCBhZGQgdGhlIG5ldyBwYXRoIGZvciB3aGljaCB3ZSBhZGRlZCBhXG4gIC8vIHdvcmtzcGFjZSBvcGVuZXIgaGFuZGxlci5cbiAgYXRvbS5wcm9qZWN0LnJlbW92ZVBhdGgod29ya2luZ0RpcmVjdG9yeVVyaSk7XG5cbiAgYXRvbS5wcm9qZWN0LmFkZFBhdGgod29ya2luZ0RpcmVjdG9yeVVyaSk7XG5cbiAgY29uc3Qgc3Vic2NyaXB0aW9uID0gYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT4ge1xuICAgIC8vIERlbGF5IGNsb3NpbmcgdGhlIHVuZGVybHlpbmcgc29ja2V0IGNvbm5lY3Rpb24gdW50aWwgcmVnaXN0ZXJlZCBzdWJzY3JpcHRpb25zIGhhdmUgY2xvc2VkLlxuICAgIC8vIFdlIHNob3VsZCBuZXZlciBkZXBlbmQgb24gdGhlIG9yZGVyIG9mIHJlZ2lzdHJhdGlvbiBvZiB0aGUgYG9uRGlkQ2hhbmdlUGF0aHNgIGV2ZW50LFxuICAgIC8vIHdoaWNoIGFsc28gZGlzcG9zZSBjb25zdW1lZCBzZXJ2aWNlJ3MgcmVzb3VyY2VzLlxuICAgIHNldFRpbWVvdXQoY2hlY2tDbG9zZWRQcm9qZWN0LCBDTE9TRV9QUk9KRUNUX0RFTEFZX01TKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gY2hlY2tDbG9zZWRQcm9qZWN0KCkge1xuICAgIC8vIFRoZSBwcm9qZWN0IHBhdGhzIG1heSBoYXZlIGNoYW5nZWQgZHVyaW5nIHRoZSBkZWxheSB0aW1lLlxuICAgIC8vIEhlbmNlLCB0aGUgbGF0ZXN0IHByb2plY3QgcGF0aHMgYXJlIGZldGNoZWQgaGVyZS5cbiAgICBjb25zdCBwYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpO1xuICAgIGlmIChwYXRocy5pbmRleE9mKHdvcmtpbmdEaXJlY3RvcnlVcmkpICE9PSAtMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUaGUgcHJvamVjdCB3YXMgcmVtb3ZlZCBmcm9tIHRoZSB0cmVlLlxuICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG5cbiAgICBjbG9zZU9wZW5GaWxlc0ZvclJlbW90ZVByb2plY3QoY29ubmVjdGlvbi5nZXRDb25maWcoKSk7XG5cbiAgICBjb25zdCBob3N0bmFtZSA9IGNvbm5lY3Rpb24uZ2V0UmVtb3RlSG9zdG5hbWUoKTtcbiAgICBjb25zdCBjbG9zZUNvbm5lY3Rpb24gPSAoc2h1dGRvd25JZkxhc3Q6IGJvb2xlYW4pID0+IHtcbiAgICAgIGNvbm5lY3Rpb24uY2xvc2Uoc2h1dGRvd25JZkxhc3QpO1xuICAgIH07XG5cbiAgICBpZiAoIWNvbm5lY3Rpb24uaXNPbmx5Q29ubmVjdGlvbigpKSB7XG4gICAgICBsb2dnZXIuaW5mbygnUmVtYWluaW5nIHJlbW90ZSBwcm9qZWN0cyB1c2luZyBOdWNsaWRlIFNlcnZlciAtIG5vIHByb21wdCB0byBzaHV0ZG93bicpO1xuICAgICAgY29uc3Qgc2h1dGRvd25JZkxhc3QgPSBmYWxzZTtcbiAgICAgIGNsb3NlQ29ubmVjdGlvbihzaHV0ZG93bklmTGFzdCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYnV0dG9ucyA9IFsnS2VlcCBJdCcsICdTaHV0ZG93biddO1xuICAgIGNvbnN0IGJ1dHRvblRvQWN0aW9ucyA9IG5ldyBNYXAoKTtcblxuICAgIGJ1dHRvblRvQWN0aW9ucy5zZXQoYnV0dG9uc1swXSwgKCkgPT4gY2xvc2VDb25uZWN0aW9uKC8qIHNodXRkb3duSWZMYXN0ICovIGZhbHNlKSk7XG4gICAgYnV0dG9uVG9BY3Rpb25zLnNldChidXR0b25zWzFdLCAoKSA9PiBjbG9zZUNvbm5lY3Rpb24oLyogc2h1dGRvd25JZkxhc3QgKi8gdHJ1ZSkpO1xuXG4gICAgaWYgKGZlYXR1cmVDb25maWcuZ2V0KFxuICAgICAgJ251Y2xpZGUtcmVtb3RlLXByb2plY3RzLnNodXRkb3duU2VydmVyQWZ0ZXJEaXNjb25uZWN0aW9uJyxcbiAgICApKSB7XG4gICAgICAvLyBBdG9tIHRha2VzIHRoZSBmaXJzdCBidXR0b24gaW4gdGhlIGxpc3QgYXMgZGVmYXVsdCBvcHRpb24uXG4gICAgICBidXR0b25zLnJldmVyc2UoKTtcbiAgICB9XG5cbiAgICBjb25zdCBjaG9pY2UgPSBnbG9iYWwuYXRvbS5jb25maXJtKHtcbiAgICAgIG1lc3NhZ2U6ICdObyBtb3JlIHJlbW90ZSBwcm9qZWN0cyBvbiB0aGUgaG9zdDogXFwnJyArIGhvc3RuYW1lICtcbiAgICAgICAgJ1xcJy4gV291bGQgeW91IGxpa2UgdG8gc2h1dGRvd24gTnVjbGlkZSBzZXJ2ZXIgdGhlcmU/JyxcbiAgICAgIGJ1dHRvbnMsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhY3Rpb24gPSBidXR0b25Ub0FjdGlvbnMuZ2V0KGJ1dHRvbnNbY2hvaWNlXSk7XG4gICAgaW52YXJpYW50KGFjdGlvbik7XG4gICAgYWN0aW9uKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xvc2VPcGVuRmlsZXNGb3JSZW1vdGVQcm9qZWN0KHJlbW90ZVByb2plY3RDb25maWc6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uKTogdm9pZCB7XG4gIGNvbnN0IG9wZW5JbnN0YW5jZXMgPSBnZXRPcGVuRmlsZUVkaXRvckZvclJlbW90ZVByb2plY3QocmVtb3RlUHJvamVjdENvbmZpZyk7XG4gIGZvciAoY29uc3Qgb3Blbkluc3RhbmNlIG9mIG9wZW5JbnN0YW5jZXMpIHtcbiAgICBjb25zdCB7ZWRpdG9yLCBwYW5lfSA9IG9wZW5JbnN0YW5jZTtcbiAgICBwYW5lLnJlbW92ZUl0ZW0oZWRpdG9yKTtcbiAgICBlZGl0b3IuZGVzdHJveSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFJlbW90ZVJvb3REaXJlY3RvcmllcygpOiBBcnJheTxhdG9tJERpcmVjdG9yeT4ge1xuICAvLyBUT0RPOiBVc2UgbnVjbGlkZS1yZW1vdGUtdXJpIGluc3RlYWQuXG4gIHJldHVybiBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5maWx0ZXIoXG4gICAgZGlyZWN0b3J5ID0+IGRpcmVjdG9yeS5nZXRQYXRoKCkuc3RhcnRzV2l0aCgnbnVjbGlkZTonKSk7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhbnkgRGlyZWN0b3J5IChub3QgUmVtb3RlRGlyZWN0b3J5KSBvYmplY3RzIHRoYXQgaGF2ZSBOdWNsaWRlXG4gKiByZW1vdGUgVVJJcy5cbiAqL1xuZnVuY3Rpb24gZGVsZXRlRHVtbXlSZW1vdGVSb290RGlyZWN0b3JpZXMoKSB7XG4gIGNvbnN0IHtSZW1vdGVEaXJlY3Rvcnl9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbicpO1xuICBjb25zdCB7aXNSZW1vdGV9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJyk7XG4gIGZvciAoY29uc3QgZGlyZWN0b3J5IG9mIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpKSB7XG4gICAgaWYgKGlzUmVtb3RlKGRpcmVjdG9yeS5nZXRQYXRoKCkpICYmXG4gICAgICAgICEoUmVtb3RlRGlyZWN0b3J5LmlzUmVtb3RlRGlyZWN0b3J5KGRpcmVjdG9yeSkpKSB7XG4gICAgICBhdG9tLnByb2plY3QucmVtb3ZlUGF0aChkaXJlY3RvcnkuZ2V0UGF0aCgpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgc2FtZSBUZXh0RWRpdG9yIG11c3QgYmUgcmV0dXJuZWQgdG8gcHJldmVudCBBdG9tIGZyb20gY3JlYXRpbmcgbXVsdGlwbGUgdGFic1xuICogZm9yIHRoZSBzYW1lIGZpbGUsIGJlY2F1c2UgQXRvbSBkb2Vzbid0IGNhY2hlIHBlbmRpbmcgb3BlbmVyIHByb21pc2VzLlxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVFZGl0b3JGb3JOdWNsaWRlKFxuICB1cmk6IE51Y2xpZGVVcmksXG4pOiBQcm9taXNlPFRleHRFZGl0b3I+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBidWZmZXIgPSBhd2FpdCBsb2FkQnVmZmVyRm9yVXJpKHVyaSk7XG4gICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcih7YnVmZmVyfSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGxvZ2dlci53YXJuKCdidWZmZXIgbG9hZCBpc3N1ZTonLCBlcnIpO1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgRmFpbGVkIHRvIG9wZW4gJHt1cml9OiAke2Vyci5tZXNzYWdlfWApO1xuICAgIHRocm93IGVycjtcbiAgfVxufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSByZW1vdGUgYnVmZmVyIGhhcyBhbHJlYWR5IGJlZW4gaW5pdGlhbGl6ZWQgaW4gZWRpdG9yLlxuICogVGhpcyBjaGVja3MgaWYgdGhlIGJ1ZmZlciBpcyBpbnN0YW5jZSBvZiBOdWNsaWRlVGV4dEJ1ZmZlci5cbiAqL1xuZnVuY3Rpb24gaXNSZW1vdGVCdWZmZXJJbml0aWFsaXplZChlZGl0b3I6IFRleHRFZGl0b3IpOiBib29sZWFuIHtcbiAgY29uc3QgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAvLyAkRmxvd0lzc3VlOiBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvMTM3NVxuICBpZiAoYnVmZmVyICYmIGJ1ZmZlci5jb25zdHJ1Y3Rvci5uYW1lID09PSAnTnVjbGlkZVRleHRCdWZmZXInKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWxvYWRSZW1vdGVQcm9qZWN0cyhcbiAgcmVtb3RlUHJvamVjdHM6IEFycmF5PFNlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uPixcbik6IFByb21pc2U8dm9pZD4ge1xuICAvLyBUaGlzIGlzIGludGVudGlvbmFsbHkgc2VyaWFsLlxuICAvLyBUaGUgOTAlIHVzZSBjYXNlIGlzIHRvIGhhdmUgbXVsdGlwbGUgcmVtb3RlIHByb2plY3RzIGZvciBhIHNpbmdsZSBjb25uZWN0aW9uO1xuICAvLyBhZnRlciB0aGUgZmlyc3Qgb25lIHN1Y2NlZWRzIHRoZSByZXN0IHNob3VsZCByZXF1aXJlIG5vIHVzZXIgYWN0aW9uLlxuICBmb3IgKGNvbnN0IGNvbmZpZyBvZiByZW1vdGVQcm9qZWN0cykge1xuICAgIC8qIGVzbGludC1kaXNhYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgY3JlYXRlUmVtb3RlQ29ubmVjdGlvbihjb25maWcpO1xuICAgIGlmICghY29ubmVjdGlvbikge1xuICAgICAgbG9nZ2VyLmluZm8oXG4gICAgICAgICdObyBSZW1vdGVDb25uZWN0aW9uIHJldHVybmVkIG9uIHJlc3RvcmUgc3RhdGUgdHJpYWw6JyxcbiAgICAgICAgY29uZmlnLmhvc3QsXG4gICAgICAgIGNvbmZpZy5jd2QsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJdCdzIGZpbmUgdGhlIHVzZXIgY29ubmVjdGVkIHRvIGEgZGlmZmVyZW50IHByb2plY3Qgb24gdGhlIHNhbWUgaG9zdDpcbiAgICAgIC8vIHdlIHNob3VsZCBzdGlsbCBiZSBhYmxlIHRvIHJlc3RvcmUgdGhpcyB1c2luZyB0aGUgbmV3IGNvbm5lY3Rpb24uXG4gICAgICBjb25zdCB7Y3dkLCBob3N0LCBkaXNwbGF5VGl0bGV9ID0gY29uZmlnO1xuICAgICAgaWYgKGNvbm5lY3Rpb24uZ2V0UGF0aEZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCkgIT09IGN3ZCAmJlxuICAgICAgICAgIGNvbm5lY3Rpb24uZ2V0UmVtb3RlSG9zdG5hbWUoKSA9PT0gaG9zdCkge1xuICAgICAgICBhd2FpdCBSZW1vdGVDb25uZWN0aW9uLmNyZWF0ZUNvbm5lY3Rpb25CeVNhdmVkQ29uZmlnKGhvc3QsIGN3ZCwgZGlzcGxheVRpdGxlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyogZXNsaW50LWVuYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKFxuICBzdGF0ZTogP3tyZW1vdGVQcm9qZWN0c0NvbmZpZzogU2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb25bXX0sXG4pOiB2b2lkIHtcbiAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgY29uc3QgUmVtb3RlUHJvamVjdHNDb250cm9sbGVyID0gcmVxdWlyZSgnLi9SZW1vdGVQcm9qZWN0c0NvbnRyb2xsZXInKTtcbiAgY29udHJvbGxlciA9IG5ldyBSZW1vdGVQcm9qZWN0c0NvbnRyb2xsZXIoKTtcblxuICBzdWJzY3JpcHRpb25zLmFkZChSZW1vdGVDb25uZWN0aW9uLm9uRGlkQWRkUmVtb3RlQ29ubmVjdGlvbihjb25uZWN0aW9uID0+IHtcbiAgICBhZGRSZW1vdGVGb2xkZXJUb1Byb2plY3QoY29ubmVjdGlvbik7XG5cblxuICAgIC8vIE9uIEF0b20gcmVzdGFydCwgaXQgdHJpZXMgdG8gb3BlbiB1cmkgcGF0aHMgYXMgbG9jYWwgYFRleHRFZGl0b3JgIHBhbmUgaXRlbXMuXG4gICAgLy8gSGVyZSwgTnVjbGlkZSByZWxvYWRzIHRoZSByZW1vdGUgcHJvamVjdCBmaWxlcyB0aGF0IGhhdmUgZW1wdHkgdGV4dCBlZGl0b3JzIG9wZW4uXG4gICAgY29uc3QgY29uZmlnID0gY29ubmVjdGlvbi5nZXRDb25maWcoKTtcbiAgICBjb25zdCBvcGVuSW5zdGFuY2VzID0gZ2V0T3BlbkZpbGVFZGl0b3JGb3JSZW1vdGVQcm9qZWN0KGNvbmZpZyk7XG4gICAgZm9yIChjb25zdCBvcGVuSW5zdGFuY2Ugb2Ygb3Blbkluc3RhbmNlcykge1xuICAgICAgLy8gS2VlcCB0aGUgb3JpZ2luYWwgb3BlbiBlZGl0b3IgaXRlbSB3aXRoIGEgdW5pcXVlIG5hbWUgdW50aWwgdGhlIHJlbW90ZSBidWZmZXIgaXMgbG9hZGVkLFxuICAgICAgLy8gVGhlbiwgd2UgYXJlIHJlYWR5IHRvIHJlcGxhY2UgaXQgd2l0aCB0aGUgcmVtb3RlIHRhYiBpbiB0aGUgc2FtZSBwYW5lLlxuICAgICAgY29uc3Qge3BhbmUsIGVkaXRvciwgdXJpLCBmaWxlUGF0aH0gPSBvcGVuSW5zdGFuY2U7XG5cbiAgICAgIC8vIFNraXAgcmVzdG9yaW5nIHRoZSBlZGl0ZXIgd2hvIGhhcyByZW1vdGUgY29udGVudCBsb2FkZWQuXG4gICAgICBpZiAoaXNSZW1vdGVCdWZmZXJJbml0aWFsaXplZChlZGl0b3IpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBIZXJlLCBhIHVuaXF1ZSB1cmkgaXMgcGlja2VkIHRvIHRoZSBwZW5kaW5nIG9wZW4gcGFuZSBpdGVtIHRvIG1haW50YWluIHRoZSBwYW5lIGxheW91dC5cbiAgICAgIC8vIE90aGVyd2lzZSwgdGhlIG9wZW4gd29uJ3QgYmUgY29tcGxldGVkIGJlY2F1c2UgdGhlcmUgZXhpc3RzIGEgcGFuZSBpdGVtIHdpdGggdGhlIHNhbWVcbiAgICAgIC8vIHVyaS5cbiAgICAgIC8qICRGbG93Rml4TWUgKi9cbiAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5maWxlLnBhdGggPSBgJHt1cml9LnRvLWNsb3NlYDtcbiAgICAgIC8vIENsZWFudXAgdGhlIG9sZCBwYW5lIGl0ZW0gb24gc3VjY2Vzc2Z1bCBvcGVuaW5nIG9yIHdoZW4gbm8gY29ubmVjdGlvbiBjb3VsZCBiZVxuICAgICAgLy8gZXN0YWJsaXNoZWQuXG4gICAgICBjb25zdCBjbGVhbnVwQnVmZmVyID0gKCkgPT4ge1xuICAgICAgICBwYW5lLnJlbW92ZUl0ZW0oZWRpdG9yKTtcbiAgICAgICAgZWRpdG9yLmRlc3Ryb3koKTtcbiAgICAgIH07XG4gICAgICBpZiAoZmlsZVBhdGggPT09IGNvbmZpZy5jd2QpIHtcbiAgICAgICAgY2xlYW51cEJ1ZmZlcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgd2UgY2xlYW4gdXAgdGhlIGJ1ZmZlciBiZWZvcmUgdGhlIGBvcGVuVXJpSW5QYW5lYCBmaW5pc2hlcyxcbiAgICAgICAgLy8gdGhlIHBhbmUgd2lsbCBiZSBjbG9zZWQsIGJlY2F1c2UgaXQgY291bGQgaGF2ZSBubyBvdGhlciBpdGVtcy5cbiAgICAgICAgLy8gU28gd2UgbXVzdCBjbGVhbiB1cCBhZnRlci5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlblVSSUluUGFuZSh1cmksIHBhbmUpLnRoZW4oY2xlYW51cEJ1ZmZlciwgY2xlYW51cEJ1ZmZlcik7XG4gICAgICB9XG4gICAgfVxuICB9KSk7XG5cbiAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ251Y2xpZGUtcmVtb3RlLXByb2plY3RzOmNvbm5lY3QnLFxuICAgICAgKCkgPT4gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1zc2gtZGlhbG9nJykub3BlbkNvbm5lY3Rpb25EaWFsb2coKVxuICApKTtcblxuICAvLyBTdWJzY3JpYmUgb3BlbmVyIGJlZm9yZSByZXN0b3JpbmcgdGhlIHJlbW90ZSBwcm9qZWN0cy5cbiAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKCh1cmkgPSAnJykgPT4ge1xuICAgIGlmICh1cmkuc3RhcnRzV2l0aCgnbnVjbGlkZTonKSkge1xuICAgICAgY29uc3QgY29ubmVjdGlvbiA9IFJlbW90ZUNvbm5lY3Rpb24uZ2V0Rm9yVXJpKHVyaSk7XG4gICAgICAvLyBPbiBBdG9tIHJlc3RhcnQsIGl0IHRyaWVzIHRvIG9wZW4gdGhlIHVyaSBwYXRoIGFzIGEgZmlsZSB0YWIgYmVjYXVzZSBpdCdzIG5vdCBhIGxvY2FsXG4gICAgICAvLyBkaXJlY3RvcnkuIFdlIGNhbid0IGxldCB0aGF0IGNyZWF0ZSBhIGZpbGUgd2l0aCB0aGUgaW5pdGlhbCB3b3JraW5nIGRpcmVjdG9yeSBwYXRoLlxuICAgICAgaWYgKGNvbm5lY3Rpb24gJiYgdXJpID09PSBjb25uZWN0aW9uLmdldFVyaUZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHBlbmRpbmdGaWxlc1t1cmldKSB7XG4gICAgICAgIHJldHVybiBwZW5kaW5nRmlsZXNbdXJpXTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRleHRFZGl0b3JQcm9taXNlID0gcGVuZGluZ0ZpbGVzW3VyaV0gPSBjcmVhdGVFZGl0b3JGb3JOdWNsaWRlKHVyaSk7XG4gICAgICBjb25zdCByZW1vdmVGcm9tQ2FjaGUgPSAoKSA9PiBkZWxldGUgcGVuZGluZ0ZpbGVzW3VyaV07XG4gICAgICB0ZXh0RWRpdG9yUHJvbWlzZS50aGVuKHJlbW92ZUZyb21DYWNoZSwgcmVtb3ZlRnJvbUNhY2hlKTtcbiAgICAgIHJldHVybiB0ZXh0RWRpdG9yUHJvbWlzZTtcbiAgICB9XG4gIH0pKTtcblxuICAvLyBJZiBSZW1vdGVEaXJlY3RvcnlQcm92aWRlciBpcyBjYWxsZWQgYmVmb3JlIHRoaXMsIGFuZCBpdCBmYWlsZWRcbiAgLy8gdG8gcHJvdmlkZSBhIFJlbW90ZURpcmVjdG9yeSBmb3IgYVxuICAvLyBnaXZlbiBVUkksIEF0b20gd2lsbCBjcmVhdGUgYSBnZW5lcmljIERpcmVjdG9yeSB0byB3cmFwIHRoYXQuIFdlIHdhbnRcbiAgLy8gdG8gZGVsZXRlIHRoZXNlIGluc3RlYWQsIGJlY2F1c2UgdGhvc2UgZGlyZWN0b3JpZXMgYXJlbid0IHZhbGlkL3VzZWZ1bFxuICAvLyBpZiB0aGV5IGFyZSBub3QgdHJ1ZSBSZW1vdGVEaXJlY3Rvcnkgb2JqZWN0cyAoY29ubmVjdGVkIHRvIGEgcmVhbFxuICAvLyByZWFsIHJlbW90ZSBmb2xkZXIpLlxuICBkZWxldGVEdW1teVJlbW90ZVJvb3REaXJlY3RvcmllcygpO1xuXG4gIC8vIEF0dGVtcHQgdG8gcmVsb2FkIHByZXZpb3VzbHkgb3BlbiBwcm9qZWN0cy5cbiAgY29uc3QgcmVtb3RlUHJvamVjdHNDb25maWcgPSBzdGF0ZSAmJiBzdGF0ZS5yZW1vdGVQcm9qZWN0c0NvbmZpZztcbiAgaWYgKHJlbW90ZVByb2plY3RzQ29uZmlnICE9IG51bGwpIHtcbiAgICByZWxvYWRSZW1vdGVQcm9qZWN0cyhyZW1vdGVQcm9qZWN0c0NvbmZpZyk7XG4gIH1cbiAgcGFja2FnZVN1YnNjcmlwdGlvbnMgPSBzdWJzY3JpcHRpb25zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXI6IGF0b20kU3RhdHVzQmFyKTogdm9pZCB7XG4gIGlmIChjb250cm9sbGVyKSB7XG4gICAgY29udHJvbGxlci5jb25zdW1lU3RhdHVzQmFyKHN0YXR1c0Jhcik7XG4gIH1cbn1cblxuLy8gVE9ETzogQWxsIG9mIHRoZSBlbGVtZW50cyBvZiB0aGUgYXJyYXkgYXJlIG5vbi1udWxsLCBidXQgaXQgZG9lcyBub3Qgc2VlbSBwb3NzaWJsZSB0byBjb252aW5jZVxuLy8gRmxvdyBvZiB0aGF0LlxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZShcbik6IHtyZW1vdGVQcm9qZWN0c0NvbmZpZzogQXJyYXk8P1NlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uPn0ge1xuICBjb25zdCByZW1vdGVQcm9qZWN0c0NvbmZpZzogQXJyYXk8P1NlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uPiA9XG4gICAgZ2V0UmVtb3RlUm9vdERpcmVjdG9yaWVzKClcbiAgICAgIC5tYXAoKGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkpOiA/U2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24gPT4ge1xuICAgICAgICBjb25zdCBjb25uZWN0aW9uID0gUmVtb3RlQ29ubmVjdGlvbi5nZXRGb3JVcmkoZGlyZWN0b3J5LmdldFBhdGgoKSk7XG4gICAgICAgIHJldHVybiBjb25uZWN0aW9uID9cbiAgICAgICAgICBjcmVhdGVTZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbihjb25uZWN0aW9uLmdldENvbmZpZygpKSA6IG51bGw7XG4gICAgICB9KVxuICAgICAgLmZpbHRlcigoY29uZmlnOiA/U2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pID0+IGNvbmZpZyAhPSBudWxsKTtcbiAgcmV0dXJuIHtcbiAgICByZW1vdGVQcm9qZWN0c0NvbmZpZyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gIGlmIChwYWNrYWdlU3Vic2NyaXB0aW9ucykge1xuICAgIHBhY2thZ2VTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBwYWNrYWdlU3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gIH1cblxuICBpZiAoY29udHJvbGxlciAhPSBudWxsKSB7XG4gICAgY29udHJvbGxlci5kZXN0cm95KCk7XG4gICAgY29udHJvbGxlciA9IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlbW90ZURpcmVjdG9yeVByb3ZpZGVyKCk6IFJlbW90ZURpcmVjdG9yeVByb3ZpZGVyVCB7XG4gIGNvbnN0IFJlbW90ZURpcmVjdG9yeVByb3ZpZGVyID0gcmVxdWlyZSgnLi9SZW1vdGVEaXJlY3RvcnlQcm92aWRlcicpO1xuICByZXR1cm4gbmV3IFJlbW90ZURpcmVjdG9yeVByb3ZpZGVyKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSZW1vdGVEaXJlY3RvcnlTZWFyY2hlcigpOiBSZW1vdGVEaXJlY3RvcnlTZWFyY2hlclQge1xuICBjb25zdCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNsaWVudCcpO1xuICBjb25zdCB7UmVtb3RlRGlyZWN0b3J5fSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24nKTtcbiAgY29uc3QgUmVtb3RlRGlyZWN0b3J5U2VhcmNoZXIgPSByZXF1aXJlKCcuL1JlbW90ZURpcmVjdG9yeVNlYXJjaGVyJyk7XG4gIHJldHVybiBuZXcgUmVtb3RlRGlyZWN0b3J5U2VhcmNoZXIoKGRpcjogUmVtb3RlRGlyZWN0b3J5KSA9PiB7XG4gICAgY29uc3Qgc2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0ZpbmRJblByb2plY3RTZXJ2aWNlJywgZGlyLmdldFBhdGgoKSk7XG4gICAgaW52YXJpYW50KHNlcnZpY2UpO1xuICAgIHJldHVybiAoc2VydmljZTogRmluZEluUHJvamVjdFNlcnZpY2UpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEhvbWVGcmFnbWVudHMoKTogSG9tZUZyYWdtZW50cyB7XG4gIHJldHVybiB7XG4gICAgZmVhdHVyZToge1xuICAgICAgdGl0bGU6ICdSZW1vdGUgQ29ubmVjdGlvbicsXG4gICAgICBpY29uOiAnY2xvdWQtdXBsb2FkJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29ubmVjdCB0byBhIHJlbW90ZSBzZXJ2ZXIgdG8gZWRpdCBmaWxlcy4nLFxuICAgICAgY29tbWFuZDogJ251Y2xpZGUtcmVtb3RlLXByb2plY3RzOmNvbm5lY3QnLFxuICAgIH0sXG4gICAgcHJpb3JpdHk6IDgsXG4gIH07XG59XG4iXX0=