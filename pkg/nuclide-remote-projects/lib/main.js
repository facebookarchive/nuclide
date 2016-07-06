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

  var connection = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).RemoteConnection.getByHostnameAndPath(host, cwd);
  if (connection != null) {
    return connection;
  }

  connection = yield (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).RemoteConnection.createConnectionBySavedConfig(host, cwd, displayTitle);
  if (connection != null) {
    return connection;
  }

  // If connection fails using saved config, open connect dialog.
  return (0, (_openConnection2 || _openConnection()).openConnectionDialog)({
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
    var buffer = undefined;
    try {
      buffer = yield (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).loadBufferForUri)(uri);
    } catch (err) {
      // Suppress ENOENT errors which occur if the file doesn't exist.
      // This is the same thing Atom does when opening a file (given a URI) that doesn't exist.
      if (err.code !== 'ENOENT') {
        throw err;
      }
      // If `loadBufferForURI` fails, then the buffer is removed from Atom's list of buffers.
      // `buffer.file` is marked as destroyed, making it useless. So we create
      // a new `buffer` and call `finishLoading` so that the `buffer` is marked
      // as `loaded` and the proper events are fired. The effect of all of this
      // is that files that don't exist remotely anymore are shown as empty
      // unsaved text editors.
      buffer = (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).bufferForUri)(uri);
      buffer.finishLoading();
    }
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
  var _loop = function* (config) {
    /* eslint-disable babel/no-await-in-loop */
    var connection = yield createRemoteConnection(config);
    if (!connection) {
      logger.info('No RemoteConnection returned on restore state trial:', config.host, config.cwd);
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-file-tree:force-refresh-roots');

      // Atom restores remote files with a malformed URIs, which somewhat resemble local paths.
      // If after an unsuccessful connection user modifies and saves them he's presented
      // with a credential requesting dialog, as the file is attempted to be saved into
      // /nuclide:/<hostname> folder. If the user will approve the elevation and actually save
      // the file all kind of weird stuff happens (see t10842295) since the difference between the
      // remote and the valid local path becomes less aparent.
      // Anyway - these files better be closed.
      atom.workspace.getTextEditors().forEach(function (textEditor) {
        if (textEditor == null) {
          return;
        }

        var path = textEditor.getPath();
        if (path == null) {
          return;
        }

        if (path.startsWith('nuclide:/' + config.host)) {
          textEditor.destroy();
        }
      });
    } else {
      // It's fine the user connected to a different project on the same host:
      // we should still be able to restore this using the new connection.
      var _cwd = config.cwd;
      var _host = config.host;
      var _displayTitle = config.displayTitle;

      if (connection.getPathForInitialWorkingDirectory() !== _cwd && connection.getRemoteHostname() === _host) {
        yield (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).RemoteConnection.createConnectionBySavedConfig(_host, _cwd, _displayTitle);
      }
    }
    /* eslint-enable babel/no-await-in-loop */
  };

  // This is intentionally serial.
  // The 90% use case is to have multiple remote projects for a single connection;
  // after the first one succeeds the rest should require no user action.
  for (var config of remoteProjects) {
    yield* _loop(config);
  }
});

var shutdownServersAndRestartNuclide = _asyncToGenerator(function* () {
  atom.confirm({
    message: 'This will shutdown your Nuclide servers and restart Atom, ' + 'discarding all unsaved changes. Continue?',
    buttons: {
      'Shutdown & Restart': _asyncToGenerator(function* () {
        try {
          yield (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackImmediate)('nuclide-remote-projects:kill-and-restart');
        } finally {
          // This directly kills the servers without removing the RemoteConnections
          // so that restarting Nuclide preserves the existing workspace state.
          yield (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).ServerConnection.forceShutdownAllServers();
          atom.reload();
        }
      }),
      'Cancel': function Cancel() {}
    }
  });
});

exports.activate = activate;
exports.consumeStatusBar = consumeStatusBar;
exports.serialize = serialize;
exports.deactivate = deactivate;
exports.createRemoteDirectoryProvider = createRemoteDirectoryProvider;
exports.createRemoteDirectorySearcher = createRemoteDirectorySearcher;
exports.getHomeFragments = getHomeFragments;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomTextEditor2;

function _commonsAtomTextEditor() {
  return _commonsAtomTextEditor2 = require('../../commons-atom/text-editor');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _openConnection2;

function _openConnection() {
  return _openConnection2 = require('./open-connection');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

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

    if ((_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-remote-projects.shutdownServerAfterDisconnection')) {
      // Atom takes the first button in the list as default option.
      buttons.reverse();
    }

    var choice = global.atom.confirm({
      message: 'No more remote projects on the host: \'' + hostname + '\'. Would you like to shutdown Nuclide server there?',
      buttons: buttons
    });

    var action = buttonToActions.get(buttons[choice]);
    (0, (_assert2 || _assert()).default)(action);
    action();
  }
}

function closeOpenFilesForRemoteProject(remoteProjectConfig) {
  var openInstances = (0, (_utils2 || _utils()).getOpenFileEditorForRemoteProject)(remoteProjectConfig);
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
  var _require = require('../../nuclide-remote-connection');

  var RemoteDirectory = _require.RemoteDirectory;

  for (var directory of atom.project.getDirectories()) {
    if ((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isRemote(directory.getPath()) && !RemoteDirectory.isRemoteDirectory(directory)) {
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

function activate(state) {
  var subscriptions = new (_atom2 || _atom()).CompositeDisposable();

  var RemoteProjectsController = require('./RemoteProjectsController');
  controller = new RemoteProjectsController();

  subscriptions.add((_nuclideRemoteConnection2 || _nuclideRemoteConnection()).RemoteConnection.onDidAddRemoteConnection(function (connection) {
    addRemoteFolderToProject(connection);

    // On Atom restart, it tries to open uri paths as local `TextEditor` pane items.
    // Here, Nuclide reloads the remote project files that have empty text editors open.
    var config = connection.getConfig();
    var openInstances = (0, (_utils2 || _utils()).getOpenFileEditorForRemoteProject)(config);

    var _loop2 = function (openInstance) {
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

      // Atom ensures that each pane only has one item per unique URI.
      // Null out the existing pane item's URI so we can insert the new one
      // without closing the pane.
      /* $FlowFixMe */
      editor.getURI = function () {
        return null;
      };
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
      var _ret2 = _loop2(openInstance);

      if (_ret2 === 'continue') continue;
    }
  }));

  subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-remote-projects:connect', function () {
    return (0, (_openConnection2 || _openConnection()).openConnectionDialog)();
  }));

  subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-remote-projects:kill-and-restart', function () {
    return shutdownServersAndRestartNuclide();
  }));

  // Subscribe opener before restoring the remote projects.
  subscriptions.add(atom.workspace.addOpener(function () {
    var uri = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    if (uri.startsWith('nuclide:')) {
      var serverConnection = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).ServerConnection.getForUri(uri);
      if (serverConnection == null) {
        // It's possible that the URI opens before the remote connection has finished loading
        // (or the remote connection cannot be restored for some reason).
        //
        // In this case, we can just let Atom open a blank editor. Once the connection
        // is re-established, the `onDidAddRemoteConnection` logic above will restore the
        // editor contents as appropriate.
        return;
      }
      var connection = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).RemoteConnection.getForUri(uri);
      // On Atom restart, it tries to open the uri path as a file tab because it's not a local
      // directory. We can't let that create a file with the initial working directory path.
      if (connection != null && uri === connection.getUriForInitialWorkingDirectory()) {
        var _ret3 = (function () {
          var blankEditor = atom.workspace.buildTextEditor({});
          // No matter what we do here, Atom is going to create a blank editor.
          // We don't want the user to see this, so destroy it as soon as possible.
          setImmediate(function () {
            return blankEditor.destroy();
          });
          return {
            v: blankEditor
          };
        })();

        if (typeof _ret3 === 'object') return _ret3.v;
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
    var connection = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).RemoteConnection.getForUri(directory.getPath());
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
  var _require2 = require('../../nuclide-client');

  var getServiceByNuclideUri = _require2.getServiceByNuclideUri;

  var _require3 = require('../../nuclide-remote-connection');

  var RemoteDirectory = _require3.RemoteDirectory;

  var RemoteDirectorySearcher = require('./RemoteDirectorySearcher');
  return new RemoteDirectorySearcher(function (dir) {
    var service = getServiceByNuclideUri('FindInProjectService', dir.getPath());
    (0, (_assert2 || _assert()).default)(service);
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