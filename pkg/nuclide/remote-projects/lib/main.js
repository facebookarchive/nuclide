var createRemoteConnection = _asyncToGenerator(function* (remoteProjectConfig) {

  var connection = yield _remoteConnection.RemoteConnection.createConnectionBySavedConfig(remoteProjectConfig.host, remoteProjectConfig.cwd);

  if (connection) {
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
  var existingEditor = atom.workspace.getTextEditors().filter(function (textEditor) {
    return textEditor.getPath() === uri;
  })[0];
  var buffer = null;
  if (existingEditor) {
    buffer = existingEditor.getBuffer();
  } else {
    var NuclideTextBuffer = require('./NuclideTextBuffer');
    buffer = new NuclideTextBuffer(connection, { filePath: uri });
    buffer.setEncoding(global.atom.config.get('core.fileEncoding'));
    try {
      /* $FlowFixMe Private Atom API */
      yield buffer.load();
    } catch (err) {
      logger.warn('buffer load issue:', err);
      throw err;
    }
  }

  var textEditorParams = { buffer: buffer };
  return (0, _atomHelpers.createTextEditor)(textEditorParams);
}

/**
 * Check if the remote buffer has already been initialized in editor.
 * This checks if the buffer is instance of NuclideTextBuffer.
 */
);

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
          return pane.removeItem(editor);
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

    // Remove remote projects added in case of reloads.
    // We already have their connection config stored.
    var remoteProjectsConfigAsDeserializedJson = state && state.remoteProjectsConfig || [];
    remoteProjectsConfigAsDeserializedJson.forEach(_asyncToGenerator(function* (config) {
      var connection = yield createRemoteConnection(config);
      if (!connection) {
        logger.info('No RemoteConnection returned on restore state trial:', config.host, config.cwd);
      }
    }));
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
//# sourceMappingURL=data:application/json;base64,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O0FBRUQsa0JBQWdCLEVBQUEsNEJBQWtCO0FBQ2hDLFdBQU87QUFDTCxhQUFPLEVBQUU7QUFDUCxhQUFLLEVBQUUsbUJBQW1CO0FBQzFCLFlBQUksRUFBRSxjQUFjO0FBQ3BCLG1CQUFXLEVBQUUsMkNBQTJDO0FBQ3hELGVBQU8sRUFBRSxpQ0FBaUM7T0FDM0M7QUFDRCxjQUFRLEVBQUUsQ0FBQztLQUNaLENBQUM7R0FDSDs7Q0FFRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SG9tZUZyYWdtZW50c30gZnJvbSAnLi4vLi4vaG9tZS1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtcbiAgUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24sXG59IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uL2xpYi9SZW1vdGVDb25uZWN0aW9uJztcbmltcG9ydCB0eXBlIFJlbW90ZURpcmVjdG9yeVByb3ZpZGVyVCBmcm9tICcuL1JlbW90ZURpcmVjdG9yeVByb3ZpZGVyJztcbmltcG9ydCB0eXBlIFJlbW90ZURpcmVjdG9yeVNlYXJjaGVyVCBmcm9tICcuL1JlbW90ZURpcmVjdG9yeVNlYXJjaGVyJztcbmltcG9ydCB0eXBlIFJlbW90ZVByb2plY3RzQ29udHJvbGxlclQgZnJvbSAnLi9SZW1vdGVQcm9qZWN0c0NvbnRyb2xsZXInO1xuXG5pbXBvcnQge2NyZWF0ZVRleHRFZGl0b3J9IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5pbXBvcnQge2dldE9wZW5GaWxlRWRpdG9yRm9yUmVtb3RlUHJvamVjdH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9mZWF0dXJlLWNvbmZpZyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtSZW1vdGVDb25uZWN0aW9ufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG4vKipcbiAqIFN0b3JlcyB0aGUgaG9zdCBhbmQgY3dkIG9mIGEgcmVtb3RlIGNvbm5lY3Rpb24uXG4gKi9cbnR5cGUgU2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24gPSB7XG4gIGhvc3Q6IHN0cmluZztcbiAgY3dkOiBzdHJpbmc7XG59XG5cbmxldCBwYWNrYWdlU3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGUgPSBudWxsO1xubGV0IGNvbnRyb2xsZXI6ID9SZW1vdGVQcm9qZWN0c0NvbnRyb2xsZXJUID0gbnVsbDtcblxuY29uc3QgQ0xPU0VfUFJPSkVDVF9ERUxBWV9NUyA9IDEwMDtcbmNvbnN0IHBlbmRpbmdGaWxlcyA9IHt9O1xuXG5mdW5jdGlvbiBjcmVhdGVTZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbihcbiAgY29uZmlnOiBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbixcbik6IFNlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uIHtcbiAgcmV0dXJuIHtcbiAgICBob3N0OiBjb25maWcuaG9zdCxcbiAgICBjd2Q6IGNvbmZpZy5jd2QsXG4gIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVJlbW90ZUNvbm5lY3Rpb24oXG4gIHJlbW90ZVByb2plY3RDb25maWc6IFNlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uLFxuKTogUHJvbWlzZTw/UmVtb3RlQ29ubmVjdGlvbj4ge1xuXG4gIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCBSZW1vdGVDb25uZWN0aW9uLmNyZWF0ZUNvbm5lY3Rpb25CeVNhdmVkQ29uZmlnKFxuICAgIHJlbW90ZVByb2plY3RDb25maWcuaG9zdCxcbiAgICByZW1vdGVQcm9qZWN0Q29uZmlnLmN3ZCxcbiAgKTtcblxuICBpZiAoY29ubmVjdGlvbikge1xuICAgIHJldHVybiBjb25uZWN0aW9uO1xuICB9XG5cbiAgLy8gSWYgY29ubmVjdGlvbiBmYWlscyB1c2luZyBzYXZlZCBjb25maWcsIG9wZW4gY29ubmVjdCBkaWFsb2cuXG4gIGNvbnN0IHtvcGVuQ29ubmVjdGlvbkRpYWxvZ30gPSByZXF1aXJlKCcuLi8uLi9zc2gtZGlhbG9nJyk7XG4gIHJldHVybiBvcGVuQ29ubmVjdGlvbkRpYWxvZyh7XG4gICAgaW5pdGlhbFNlcnZlcjogcmVtb3RlUHJvamVjdENvbmZpZy5ob3N0LFxuICAgIGluaXRpYWxDd2Q6IHJlbW90ZVByb2plY3RDb25maWcuY3dkLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkUmVtb3RlRm9sZGVyVG9Qcm9qZWN0KGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pIHtcbiAgY29uc3Qgd29ya2luZ0RpcmVjdG9yeVVyaSA9IGNvbm5lY3Rpb24uZ2V0VXJpRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKTtcbiAgLy8gSWYgcmVzdG9yaW5nIHN0YXRlLCB0aGVuIHRoZSBwcm9qZWN0IGFscmVhZHkgZXhpc3RzIHdpdGggbG9jYWwgZGlyZWN0b3J5IGFuZCB3cm9uZyByZXBvXG4gIC8vIGluc3RhbmNlcy4gSGVuY2UsIHdlIHJlbW92ZSBpdCBoZXJlLCBpZiBleGlzdGluZywgYW5kIGFkZCB0aGUgbmV3IHBhdGggZm9yIHdoaWNoIHdlIGFkZGVkIGFcbiAgLy8gd29ya3NwYWNlIG9wZW5lciBoYW5kbGVyLlxuICBhdG9tLnByb2plY3QucmVtb3ZlUGF0aCh3b3JraW5nRGlyZWN0b3J5VXJpKTtcblxuICBhdG9tLnByb2plY3QuYWRkUGF0aCh3b3JraW5nRGlyZWN0b3J5VXJpKTtcblxuICBjb25zdCBzdWJzY3JpcHRpb24gPSBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB7XG4gICAgLy8gRGVsYXkgY2xvc2luZyB0aGUgdW5kZXJseWluZyBzb2NrZXQgY29ubmVjdGlvbiB1bnRpbCByZWdpc3RlcmVkIHN1YnNjcmlwdGlvbnMgaGF2ZSBjbG9zZWQuXG4gICAgLy8gV2Ugc2hvdWxkIG5ldmVyIGRlcGVuZCBvbiB0aGUgb3JkZXIgb2YgcmVnaXN0cmF0aW9uIG9mIHRoZSBgb25EaWRDaGFuZ2VQYXRoc2AgZXZlbnQsXG4gICAgLy8gd2hpY2ggYWxzbyBkaXNwb3NlIGNvbnN1bWVkIHNlcnZpY2UncyByZXNvdXJjZXMuXG4gICAgc2V0VGltZW91dChjaGVja0Nsb3NlZFByb2plY3QsIENMT1NFX1BST0pFQ1RfREVMQVlfTVMpO1xuICB9KTtcblxuICBmdW5jdGlvbiBjaGVja0Nsb3NlZFByb2plY3QoKSB7XG4gICAgLy8gVGhlIHByb2plY3QgcGF0aHMgbWF5IGhhdmUgY2hhbmdlZCBkdXJpbmcgdGhlIGRlbGF5IHRpbWUuXG4gICAgLy8gSGVuY2UsIHRoZSBsYXRlc3QgcHJvamVjdCBwYXRocyBhcmUgZmV0Y2hlZCBoZXJlLlxuICAgIGNvbnN0IHBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG4gICAgaWYgKHBhdGhzLmluZGV4T2Yod29ya2luZ0RpcmVjdG9yeVVyaSkgIT09IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFRoZSBwcm9qZWN0IHdhcyByZW1vdmVkIGZyb20gdGhlIHRyZWUuXG4gICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcblxuICAgIGNsb3NlT3BlbkZpbGVzRm9yUmVtb3RlUHJvamVjdChjb25uZWN0aW9uLmdldENvbmZpZygpKTtcblxuICAgIGNvbnN0IGhvc3RuYW1lID0gY29ubmVjdGlvbi5nZXRSZW1vdGVIb3N0bmFtZSgpO1xuICAgIGlmIChSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWUoaG9zdG5hbWUpLmxlbmd0aCA+IDEpIHtcbiAgICAgIGxvZ2dlci5pbmZvKCdSZW1haW5pbmcgcmVtb3RlIHByb2plY3RzIHVzaW5nIE51Y2xpZGUgU2VydmVyIC0gbm8gcHJvbXB0IHRvIHNodXRkb3duJyk7XG4gICAgICBjb25uZWN0aW9uLmNsb3NlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYnV0dG9ucyA9IFsnS2VlcCBJdCcsICdTaHV0ZG93biddO1xuICAgIGNvbnN0IGJ1dHRvblRvQWN0aW9ucyA9IG5ldyBNYXAoKTtcblxuICAgIGJ1dHRvblRvQWN0aW9ucy5zZXQoYnV0dG9uc1swXSwgKCkgPT4gY29ubmVjdGlvbi5jbG9zZSgpKTtcbiAgICBidXR0b25Ub0FjdGlvbnMuc2V0KGJ1dHRvbnNbMV0sIGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IGNvbm5lY3Rpb24uZ2V0U2VydmljZSgnSW5mb1NlcnZpY2UnKS5zaHV0ZG93blNlcnZlcigpO1xuICAgICAgY29ubmVjdGlvbi5jbG9zZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH0pO1xuXG4gICAgaWYgKGZlYXR1cmVDb25maWcuZ2V0KFxuICAgICAgJ251Y2xpZGUtcmVtb3RlLXByb2plY3RzLnNodXRkb3duU2VydmVyQWZ0ZXJEaXNjb25uZWN0aW9uJyxcbiAgICApKSB7XG4gICAgICAvLyBBdG9tIHRha2VzIHRoZSBmaXJzdCBidXR0b24gaW4gdGhlIGxpc3QgYXMgZGVmYXVsdCBvcHRpb24uXG4gICAgICBidXR0b25zLnJldmVyc2UoKTtcbiAgICB9XG5cbiAgICBjb25zdCBjaG9pY2UgPSBnbG9iYWwuYXRvbS5jb25maXJtKHtcbiAgICAgIG1lc3NhZ2U6ICdObyBtb3JlIHJlbW90ZSBwcm9qZWN0cyBvbiB0aGUgaG9zdDogXFwnJyArIGhvc3RuYW1lICtcbiAgICAgICAgJ1xcJy4gV291bGQgeW91IGxpa2UgdG8gc2h1dGRvd24gTnVjbGlkZSBzZXJ2ZXIgdGhlcmU/JyxcbiAgICAgIGJ1dHRvbnMsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhY3Rpb24gPSBidXR0b25Ub0FjdGlvbnMuZ2V0KGJ1dHRvbnNbY2hvaWNlXSk7XG4gICAgaW52YXJpYW50KGFjdGlvbik7XG4gICAgYWN0aW9uKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xvc2VPcGVuRmlsZXNGb3JSZW1vdGVQcm9qZWN0KHJlbW90ZVByb2plY3RDb25maWc6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uKTogdm9pZCB7XG4gIGNvbnN0IG9wZW5JbnN0YW5jZXMgPSBnZXRPcGVuRmlsZUVkaXRvckZvclJlbW90ZVByb2plY3QocmVtb3RlUHJvamVjdENvbmZpZyk7XG4gIGZvciAoY29uc3Qgb3Blbkluc3RhbmNlIG9mIG9wZW5JbnN0YW5jZXMpIHtcbiAgICBjb25zdCB7ZWRpdG9yLCBwYW5lfSA9IG9wZW5JbnN0YW5jZTtcbiAgICBwYW5lLnJlbW92ZUl0ZW0oZWRpdG9yKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRSZW1vdGVSb290RGlyZWN0b3JpZXMoKTogQXJyYXk8YXRvbSREaXJlY3Rvcnk+IHtcbiAgLy8gVE9ETzogVXNlIG51Y2xpZGUtcmVtb3RlLXVyaSBpbnN0ZWFkLlxuICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCkuZmlsdGVyKFxuICAgIGRpcmVjdG9yeSA9PiBkaXJlY3RvcnkuZ2V0UGF0aCgpLnN0YXJ0c1dpdGgoJ251Y2xpZGU6JykpO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYW55IERpcmVjdG9yeSAobm90IFJlbW90ZURpcmVjdG9yeSkgb2JqZWN0cyB0aGF0IGhhdmUgTnVjbGlkZVxuICogcmVtb3RlIFVSSXMuXG4gKi9cbmZ1bmN0aW9uIGRlbGV0ZUR1bW15UmVtb3RlUm9vdERpcmVjdG9yaWVzKCkge1xuICBjb25zdCB7UmVtb3RlRGlyZWN0b3J5fSA9IHJlcXVpcmUoJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJyk7XG4gIGNvbnN0IHtpc1JlbW90ZX0gPSByZXF1aXJlKCcuLi8uLi9yZW1vdGUtdXJpJyk7XG4gIGZvciAoY29uc3QgZGlyZWN0b3J5IG9mIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpKSB7XG4gICAgaWYgKGlzUmVtb3RlKGRpcmVjdG9yeS5nZXRQYXRoKCkpICYmXG4gICAgICAgICEoUmVtb3RlRGlyZWN0b3J5LmlzUmVtb3RlRGlyZWN0b3J5KGRpcmVjdG9yeSkpKSB7XG4gICAgICBhdG9tLnByb2plY3QucmVtb3ZlUGF0aChkaXJlY3RvcnkuZ2V0UGF0aCgpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgc2FtZSBUZXh0RWRpdG9yIG11c3QgYmUgcmV0dXJuZWQgdG8gcHJldmVudCBBdG9tIGZyb20gY3JlYXRpbmcgbXVsdGlwbGUgdGFic1xuICogZm9yIHRoZSBzYW1lIGZpbGUsIGJlY2F1c2UgQXRvbSBkb2Vzbid0IGNhY2hlIHBlbmRpbmcgb3BlbmVyIHByb21pc2VzLlxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVFZGl0b3JGb3JOdWNsaWRlKFxuICBjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uLFxuICB1cmk6IHN0cmluZyxcbik6IFByb21pc2U8VGV4dEVkaXRvcj4ge1xuICBjb25zdCBleGlzdGluZ0VkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkuZmlsdGVyKHRleHRFZGl0b3IgPT4ge1xuICAgIHJldHVybiB0ZXh0RWRpdG9yLmdldFBhdGgoKSA9PT0gdXJpO1xuICB9KVswXTtcbiAgbGV0IGJ1ZmZlciA9IG51bGw7XG4gIGlmIChleGlzdGluZ0VkaXRvcikge1xuICAgIGJ1ZmZlciA9IGV4aXN0aW5nRWRpdG9yLmdldEJ1ZmZlcigpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IE51Y2xpZGVUZXh0QnVmZmVyID0gcmVxdWlyZSgnLi9OdWNsaWRlVGV4dEJ1ZmZlcicpO1xuICAgIGJ1ZmZlciA9IG5ldyBOdWNsaWRlVGV4dEJ1ZmZlcihjb25uZWN0aW9uLCB7ZmlsZVBhdGg6IHVyaX0pO1xuICAgIGJ1ZmZlci5zZXRFbmNvZGluZyhnbG9iYWwuYXRvbS5jb25maWcuZ2V0KCdjb3JlLmZpbGVFbmNvZGluZycpKTtcbiAgICB0cnkge1xuICAgICAgLyogJEZsb3dGaXhNZSBQcml2YXRlIEF0b20gQVBJICovXG4gICAgICBhd2FpdCBidWZmZXIubG9hZCgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLndhcm4oJ2J1ZmZlciBsb2FkIGlzc3VlOicsIGVycik7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgdGV4dEVkaXRvclBhcmFtcyA9IHtidWZmZXJ9O1xuICByZXR1cm4gY3JlYXRlVGV4dEVkaXRvcih0ZXh0RWRpdG9yUGFyYW1zKTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgcmVtb3RlIGJ1ZmZlciBoYXMgYWxyZWFkeSBiZWVuIGluaXRpYWxpemVkIGluIGVkaXRvci5cbiAqIFRoaXMgY2hlY2tzIGlmIHRoZSBidWZmZXIgaXMgaW5zdGFuY2Ugb2YgTnVjbGlkZVRleHRCdWZmZXIuXG4gKi9cbmZ1bmN0aW9uIGlzUmVtb3RlQnVmZmVySW5pdGlhbGl6ZWQoZWRpdG9yOiBUZXh0RWRpdG9yKTogYm9vbGVhbiB7XG4gIGNvbnN0IGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKTtcbiAgaWYgKGJ1ZmZlciAmJiBidWZmZXIuY29uc3RydWN0b3IubmFtZSA9PT0gJ051Y2xpZGVUZXh0QnVmZmVyJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKHN0YXRlOiA/e3JlbW90ZVByb2plY3RzQ29uZmlnOiBTZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbltdfSk6IHZvaWQge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgY29uc3QgUmVtb3RlUHJvamVjdHNDb250cm9sbGVyID0gcmVxdWlyZSgnLi9SZW1vdGVQcm9qZWN0c0NvbnRyb2xsZXInKTtcbiAgICBjb250cm9sbGVyID0gbmV3IFJlbW90ZVByb2plY3RzQ29udHJvbGxlcigpO1xuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoUmVtb3RlQ29ubmVjdGlvbi5vbkRpZEFkZFJlbW90ZUNvbm5lY3Rpb24oY29ubmVjdGlvbiA9PiB7XG4gICAgICBhZGRSZW1vdGVGb2xkZXJUb1Byb2plY3QoY29ubmVjdGlvbik7XG5cblxuICAgICAgLy8gT24gQXRvbSByZXN0YXJ0LCBpdCB0cmllcyB0byBvcGVuIHVyaSBwYXRocyBhcyBsb2NhbCBgVGV4dEVkaXRvcmAgcGFuZSBpdGVtcy5cbiAgICAgIC8vIEhlcmUsIE51Y2xpZGUgcmVsb2FkcyB0aGUgcmVtb3RlIHByb2plY3QgZmlsZXMgdGhhdCBoYXZlIGVtcHR5IHRleHQgZWRpdG9ycyBvcGVuLlxuICAgICAgY29uc3QgY29uZmlnID0gY29ubmVjdGlvbi5nZXRDb25maWcoKTtcbiAgICAgIGNvbnN0IG9wZW5JbnN0YW5jZXMgPSBnZXRPcGVuRmlsZUVkaXRvckZvclJlbW90ZVByb2plY3QoY29uZmlnKTtcbiAgICAgIGZvciAoY29uc3Qgb3Blbkluc3RhbmNlIG9mIG9wZW5JbnN0YW5jZXMpIHtcbiAgICAgICAgLy8gS2VlcCB0aGUgb3JpZ2luYWwgb3BlbiBlZGl0b3IgaXRlbSB3aXRoIGEgdW5pcXVlIG5hbWUgdW50aWwgdGhlIHJlbW90ZSBidWZmZXIgaXMgbG9hZGVkLFxuICAgICAgICAvLyBUaGVuLCB3ZSBhcmUgcmVhZHkgdG8gcmVwbGFjZSBpdCB3aXRoIHRoZSByZW1vdGUgdGFiIGluIHRoZSBzYW1lIHBhbmUuXG4gICAgICAgIGNvbnN0IHtwYW5lLCBlZGl0b3IsIHVyaSwgZmlsZVBhdGh9ID0gb3Blbkluc3RhbmNlO1xuXG4gICAgICAgIC8vIFNraXAgcmVzdG9yaW5nIHRoZSBlZGl0ZXIgd2hvIGhhcyByZW1vdGUgY29udGVudCBsb2FkZWQuXG4gICAgICAgIGlmIChpc1JlbW90ZUJ1ZmZlckluaXRpYWxpemVkKGVkaXRvcikpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEhlcmUsIGEgdW5pcXVlIHVyaSBpcyBwaWNrZWQgdG8gdGhlIHBlbmRpbmcgb3BlbiBwYW5lIGl0ZW0gdG8gbWFpbnRhaW4gdGhlIHBhbmUgbGF5b3V0LlxuICAgICAgICAvLyBPdGhlcndpc2UsIHRoZSBvcGVuIHdvbid0IGJlIGNvbXBsZXRlZCBiZWNhdXNlIHRoZXJlIGV4aXN0cyBhIHBhbmUgaXRlbSB3aXRoIHRoZSBzYW1lXG4gICAgICAgIC8vIHVyaS5cbiAgICAgICAgLyogJEZsb3dGaXhNZSAqL1xuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuZmlsZS5wYXRoID0gYCR7dXJpfS50by1jbG9zZWA7XG4gICAgICAgIC8vIENsZWFudXAgdGhlIG9sZCBwYW5lIGl0ZW0gb24gc3VjY2Vzc2Z1bCBvcGVuaW5nIG9yIHdoZW4gbm8gY29ubmVjdGlvbiBjb3VsZCBiZVxuICAgICAgICAvLyBlc3RhYmxpc2hlZC5cbiAgICAgICAgY29uc3QgY2xlYW51cEJ1ZmZlciA9ICgpID0+IHBhbmUucmVtb3ZlSXRlbShlZGl0b3IpO1xuICAgICAgICBpZiAoZmlsZVBhdGggPT09IGNvbmZpZy5jd2QpIHtcbiAgICAgICAgICBjbGVhbnVwQnVmZmVyKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSWYgd2UgY2xlYW4gdXAgdGhlIGJ1ZmZlciBiZWZvcmUgdGhlIGBvcGVuVXJpSW5QYW5lYCBmaW5pc2hlcyxcbiAgICAgICAgICAvLyB0aGUgcGFuZSB3aWxsIGJlIGNsb3NlZCwgYmVjYXVzZSBpdCBjb3VsZCBoYXZlIG5vIG90aGVyIGl0ZW1zLlxuICAgICAgICAgIC8vIFNvIHdlIG11c3QgY2xlYW4gdXAgYWZ0ZXIuXG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlblVSSUluUGFuZSh1cmksIHBhbmUpLnRoZW4oY2xlYW51cEJ1ZmZlciwgY2xlYW51cEJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICAgJ251Y2xpZGUtcmVtb3RlLXByb2plY3RzOmNvbm5lY3QnLFxuICAgICAgICAoKSA9PiByZXF1aXJlKCcuLi8uLi9zc2gtZGlhbG9nJykub3BlbkNvbm5lY3Rpb25EaWFsb2coKVxuICAgICkpO1xuXG4gICAgLy8gU3Vic2NyaWJlIG9wZW5lciBiZWZvcmUgcmVzdG9yaW5nIHRoZSByZW1vdGUgcHJvamVjdHMuXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKCh1cmkgPSAnJykgPT4ge1xuICAgICAgaWYgKHVyaS5zdGFydHNXaXRoKCdudWNsaWRlOicpKSB7XG4gICAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBSZW1vdGVDb25uZWN0aW9uLmdldEZvclVyaSh1cmkpO1xuICAgICAgICAvLyBPbiBBdG9tIHJlc3RhcnQsIGl0IHRyaWVzIHRvIG9wZW4gdGhlIHVyaSBwYXRoIGFzIGEgZmlsZSB0YWIgYmVjYXVzZSBpdCdzIG5vdCBhIGxvY2FsXG4gICAgICAgIC8vIGRpcmVjdG9yeS4gV2UgY2FuJ3QgbGV0IHRoYXQgY3JlYXRlIGEgZmlsZSB3aXRoIHRoZSBpbml0aWFsIHdvcmtpbmcgZGlyZWN0b3J5IHBhdGguXG4gICAgICAgIGlmIChjb25uZWN0aW9uICYmIHVyaSAhPT0gY29ubmVjdGlvbi5nZXRVcmlGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgaWYgKHBlbmRpbmdGaWxlc1t1cmldKSB7XG4gICAgICAgICAgICByZXR1cm4gcGVuZGluZ0ZpbGVzW3VyaV07XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHRleHRFZGl0b3JQcm9taXNlID0gcGVuZGluZ0ZpbGVzW3VyaV0gPSBjcmVhdGVFZGl0b3JGb3JOdWNsaWRlKGNvbm5lY3Rpb24sIHVyaSk7XG4gICAgICAgICAgY29uc3QgcmVtb3ZlRnJvbUNhY2hlID0gKCkgPT4gZGVsZXRlIHBlbmRpbmdGaWxlc1t1cmldO1xuICAgICAgICAgIHRleHRFZGl0b3JQcm9taXNlLnRoZW4ocmVtb3ZlRnJvbUNhY2hlLCByZW1vdmVGcm9tQ2FjaGUpO1xuICAgICAgICAgIHJldHVybiB0ZXh0RWRpdG9yUHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIC8vIElmIFJlbW90ZURpcmVjdG9yeVByb3ZpZGVyIGlzIGNhbGxlZCBiZWZvcmUgdGhpcywgYW5kIGl0IGZhaWxlZFxuICAgIC8vIHRvIHByb3ZpZGUgYSBSZW1vdGVEaXJlY3RvcnkgZm9yIGFcbiAgICAvLyBnaXZlbiBVUkksIEF0b20gd2lsbCBjcmVhdGUgYSBnZW5lcmljIERpcmVjdG9yeSB0byB3cmFwIHRoYXQuIFdlIHdhbnRcbiAgICAvLyB0byBkZWxldGUgdGhlc2UgaW5zdGVhZCwgYmVjYXVzZSB0aG9zZSBkaXJlY3RvcmllcyBhcmVuJ3QgdmFsaWQvdXNlZnVsXG4gICAgLy8gaWYgdGhleSBhcmUgbm90IHRydWUgUmVtb3RlRGlyZWN0b3J5IG9iamVjdHMgKGNvbm5lY3RlZCB0byBhIHJlYWxcbiAgICAvLyByZWFsIHJlbW90ZSBmb2xkZXIpLlxuICAgIGRlbGV0ZUR1bW15UmVtb3RlUm9vdERpcmVjdG9yaWVzKCk7XG5cbiAgICAvLyBSZW1vdmUgcmVtb3RlIHByb2plY3RzIGFkZGVkIGluIGNhc2Ugb2YgcmVsb2Fkcy5cbiAgICAvLyBXZSBhbHJlYWR5IGhhdmUgdGhlaXIgY29ubmVjdGlvbiBjb25maWcgc3RvcmVkLlxuICAgIGNvbnN0IHJlbW90ZVByb2plY3RzQ29uZmlnQXNEZXNlcmlhbGl6ZWRKc29uOiBTZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbltdID1cbiAgICAgIChzdGF0ZSAmJiBzdGF0ZS5yZW1vdGVQcm9qZWN0c0NvbmZpZykgfHwgW107XG4gICAgcmVtb3RlUHJvamVjdHNDb25maWdBc0Rlc2VyaWFsaXplZEpzb24uZm9yRWFjaChhc3luYyBjb25maWcgPT4ge1xuICAgICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IGNyZWF0ZVJlbW90ZUNvbm5lY3Rpb24oY29uZmlnKTtcbiAgICAgIGlmICghY29ubmVjdGlvbikge1xuICAgICAgICBsb2dnZXIuaW5mbyhcbiAgICAgICAgICAnTm8gUmVtb3RlQ29ubmVjdGlvbiByZXR1cm5lZCBvbiByZXN0b3JlIHN0YXRlIHRyaWFsOicsXG4gICAgICAgICAgY29uZmlnLmhvc3QsXG4gICAgICAgICAgY29uZmlnLmN3ZCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBwYWNrYWdlU3Vic2NyaXB0aW9ucyA9IHN1YnNjcmlwdGlvbnM7XG4gIH0sXG5cbiAgY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXI6IGF0b20kU3RhdHVzQmFyKTogdm9pZCB7XG4gICAgaWYgKGNvbnRyb2xsZXIpIHtcbiAgICAgIGNvbnRyb2xsZXIuY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXIpO1xuICAgIH1cbiAgfSxcblxuICAvLyBUT0RPOiBBbGwgb2YgdGhlIGVsZW1lbnRzIG9mIHRoZSBhcnJheSBhcmUgbm9uLW51bGwsIGJ1dCBpdCBkb2VzIG5vdCBzZWVtIHBvc3NpYmxlIHRvIGNvbnZpbmNlXG4gIC8vIEZsb3cgb2YgdGhhdC5cbiAgc2VyaWFsaXplKCk6IHtyZW1vdGVQcm9qZWN0c0NvbmZpZzogQXJyYXk8P1NlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uPn0ge1xuICAgIGNvbnN0IHJlbW90ZVByb2plY3RzQ29uZmlnOiBBcnJheTw/U2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24+ID1cbiAgICAgIGdldFJlbW90ZVJvb3REaXJlY3RvcmllcygpXG4gICAgICAgIC5tYXAoKGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkpOiA/U2VyaWFsaXphYmxlUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24gPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBSZW1vdGVDb25uZWN0aW9uLmdldEZvclVyaShkaXJlY3RvcnkuZ2V0UGF0aCgpKTtcbiAgICAgICAgICByZXR1cm4gY29ubmVjdGlvbiA/XG4gICAgICAgICAgICBjcmVhdGVTZXJpYWxpemFibGVSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbihjb25uZWN0aW9uLmdldENvbmZpZygpKSA6IG51bGw7XG4gICAgICAgIH0pXG4gICAgICAgIC5maWx0ZXIoKGNvbmZpZzogP1NlcmlhbGl6YWJsZVJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiBjb25maWcgIT0gbnVsbCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW90ZVByb2plY3RzQ29uZmlnLFxuICAgIH07XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAocGFja2FnZVN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHBhY2thZ2VTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHBhY2thZ2VTdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoY29udHJvbGxlciAhPSBudWxsKSB7XG4gICAgICBjb250cm9sbGVyLmRlc3Ryb3koKTtcbiAgICAgIGNvbnRyb2xsZXIgPSBudWxsO1xuICAgIH1cbiAgfSxcblxuICBjcmVhdGVSZW1vdGVEaXJlY3RvcnlQcm92aWRlcigpOiBSZW1vdGVEaXJlY3RvcnlQcm92aWRlclQge1xuICAgIGNvbnN0IFJlbW90ZURpcmVjdG9yeVByb3ZpZGVyID0gcmVxdWlyZSgnLi9SZW1vdGVEaXJlY3RvcnlQcm92aWRlcicpO1xuICAgIHJldHVybiBuZXcgUmVtb3RlRGlyZWN0b3J5UHJvdmlkZXIoKTtcbiAgfSxcblxuICBjcmVhdGVSZW1vdGVEaXJlY3RvcnlTZWFyY2hlcigpOiBSZW1vdGVEaXJlY3RvcnlTZWFyY2hlclQge1xuICAgIGNvbnN0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSA9IHJlcXVpcmUoJy4uLy4uL2NsaWVudCcpO1xuICAgIGNvbnN0IHtSZW1vdGVEaXJlY3Rvcnl9ID0gcmVxdWlyZSgnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nKTtcbiAgICBjb25zdCBSZW1vdGVEaXJlY3RvcnlTZWFyY2hlciA9IHJlcXVpcmUoJy4vUmVtb3RlRGlyZWN0b3J5U2VhcmNoZXInKTtcbiAgICByZXR1cm4gbmV3IFJlbW90ZURpcmVjdG9yeVNlYXJjaGVyKChkaXI6IFJlbW90ZURpcmVjdG9yeSkgPT5cbiAgICAgIGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0ZpbmRJblByb2plY3RTZXJ2aWNlJywgZGlyLmdldFBhdGgoKSkpO1xuICB9LFxuXG4gIGdldEhvbWVGcmFnbWVudHMoKTogSG9tZUZyYWdtZW50cyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZlYXR1cmU6IHtcbiAgICAgICAgdGl0bGU6ICdSZW1vdGUgQ29ubmVjdGlvbicsXG4gICAgICAgIGljb246ICdjbG91ZC11cGxvYWQnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Nvbm5lY3QgdG8gYSByZW1vdGUgc2VydmVyIHRvIGVkaXQgZmlsZXMuJyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtcmVtb3RlLXByb2plY3RzOmNvbm5lY3QnLFxuICAgICAgfSxcbiAgICAgIHByaW9yaXR5OiA4LFxuICAgIH07XG4gIH0sXG5cbn07XG4iXX0=