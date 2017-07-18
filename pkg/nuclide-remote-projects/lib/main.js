'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * The same TextEditor must be returned to prevent Atom from creating multiple tabs
 * for the same file, because Atom doesn't cache pending opener promises.
 */
let createEditorForNuclide = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (uri) {
    try {
      let buffer;
      try {
        buffer = yield (0, (_loadingNotification || _load_loadingNotification()).default)((0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).loadBufferForUri)(uri), `Opening \`${(_nuclideUri || _load_nuclideUri()).default.nuclideUriToDisplayString(uri)}\`...`, 1000 /* delay */
        );
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
        buffer = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).bufferForUri)(uri);
        buffer.finishLoading();
      }
      // When in "large file mode", syntax highlighting and line wrapping are
      // disabled (among other things). This makes large files more usable.
      // Atom does this for local files.
      // https://github.com/atom/atom/blob/v1.9.8/src/workspace.coffee#L547
      const largeFileMode = buffer.getText().length > 2 * 1024 * 1024; // 2MB

      // In Atom 1.11.0, `buildTextEditor` will call `textEditorRegistry.maintainGrammar`
      // and `textEditorRegistry.maintainConfig` with the new editor. Since
      // `createEditorForNuclide` is called via `openURIInPane` -> `addOpener`,
      // that process will also call `maintainGrammar` and `maintainConfig`. This
      // results in `undefined` disposables created in `Workspace.subscribeToAddedItems`.
      // So when a pane is closed, the call to a non-existent `dispose` throws.
      if (typeof atom.textEditors.build === 'function') {
        // https://github.com/atom/atom/blob/v1.11.0-beta5/src/workspace.coffee#L564
        const editor = atom.textEditors.build({
          buffer,
          largeFileMode,
          autoHeight: false
        });
        return editor;
      } else {
        const editor = atom.workspace.buildTextEditor({ buffer, largeFileMode });
        if (!atom.textEditors.editors.has(editor)) {
          // https://github.com/atom/atom/blob/v1.9.8/src/workspace.coffee#L559-L562
          const disposable = atom.textEditors.add(editor);
          editor.onDidDestroy(function () {
            disposable.dispose();
          });
        }
        return editor;
      }
    } catch (err) {
      (_constants || _load_constants()).logger.warn('buffer load issue:', err);
      atom.notifications.addError(`Failed to open ${uri}: ${err.message}`);
      throw err;
    }
  });

  return function createEditorForNuclide(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Check if the remote buffer has already been initialized in editor.
 * This checks if the buffer is instance of NuclideTextBuffer.
 */


let reloadRemoteProjects = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (remoteProjects) {
    // This is intentionally serial.
    // The 90% use case is to have multiple remote projects for a single connection;
    const reloadedProjects = [];
    for (const config of remoteProjects) {
      if (!remoteProjectsService) {
        throw new Error('Invariant violation: "remoteProjectsService"');
      }
      // eslint-disable-next-line no-await-in-loop


      const connection = yield remoteProjectsService.createRemoteConnection(config);
      if (!connection) {
        (_constants || _load_constants()).logger.info('No RemoteConnection returned on restore state trial:', config.host, config.cwd);

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

          const path = textEditor.getPath();
          if (path == null) {
            return;
          }

          if (path.startsWith(`nuclide:/${config.host}`)) {
            textEditor.destroy();
          }
        });
      } else {
        // It's fine the user connected to a different project on the same host:
        // we should still be able to restore this using the new connection.
        const { cwd, host, displayTitle } = config;
        if (connection.getPathForInitialWorkingDirectory() !== cwd && connection.getRemoteHostname() === host) {
          // eslint-disable-next-line no-await-in-loop
          const subConnection = yield (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.createConnectionBySavedConfig(host, cwd, displayTitle);
          if (subConnection != null) {
            reloadedProjects.push(subConnection.getUriForInitialWorkingDirectory());
          }
        } else {
          reloadedProjects.push(connection.getUriForInitialWorkingDirectory());
        }
      }
    }
    if (remoteProjectsService != null) {
      remoteProjectsService._reloadFinished(reloadedProjects);
    }
  });

  return function reloadRemoteProjects(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

exports.activate = activate;
exports.consumeStatusBar = consumeStatusBar;
exports.serialize = serialize;
exports.deactivate = deactivate;
exports.createRemoteDirectoryProvider = createRemoteDirectoryProvider;
exports.createRemoteDirectorySearcher = createRemoteDirectorySearcher;
exports.getHomeFragments = getHomeFragments;
exports.provideRemoteProjectsService = provideRemoteProjectsService;
exports.consumeNotifications = consumeNotifications;
exports.consumeWorkingSetsStore = consumeWorkingSetsStore;

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _loadingNotification;

function _load_loadingNotification() {
  return _loadingNotification = _interopRequireDefault(require('../../commons-atom/loading-notification'));
}

var _atom = require('atom');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _openConnection;

function _load_openConnection() {
  return _openConnection = require('./open-connection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _RemoteDirectorySearcher;

function _load_RemoteDirectorySearcher() {
  return _RemoteDirectorySearcher = _interopRequireDefault(require('./RemoteDirectorySearcher'));
}

var _RemoteDirectoryProvider;

function _load_RemoteDirectoryProvider() {
  return _RemoteDirectoryProvider = _interopRequireDefault(require('./RemoteDirectoryProvider'));
}

var _RemoteProjectsController;

function _load_RemoteProjectsController() {
  return _RemoteProjectsController = _interopRequireDefault(require('./RemoteProjectsController'));
}

var _RemoteProjectsService;

function _load_RemoteProjectsService() {
  return _RemoteProjectsService = _interopRequireDefault(require('./RemoteProjectsService'));
}

var _patchAtomWorkspaceReplace;

function _load_patchAtomWorkspaceReplace() {
  return _patchAtomWorkspaceReplace = _interopRequireDefault(require('./patchAtomWorkspaceReplace'));
}

var _AtomNotifications;

function _load_AtomNotifications() {
  return _AtomNotifications = require('./AtomNotifications');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Stores the host and cwd of a remote connection.
 */
let packageSubscriptions = null; /**
                                  * Copyright (c) 2015-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the license found in the LICENSE file in
                                  * the root directory of this source tree.
                                  *
                                  * 
                                  * @format
                                  */

let controller = null;
let remoteProjectsService = null;
let workingSetsStore = null;

const CLOSE_PROJECT_DELAY_MS = 100;
const pendingFiles = {};

function createSerializableRemoteConnectionConfiguration(config) {
  return {
    host: config.host,
    cwd: config.cwd,
    displayTitle: config.displayTitle
  };
}

function addRemoteFolderToProject(connection) {
  const workingDirectoryUri = connection.getUriForInitialWorkingDirectory();
  // If restoring state, then the project already exists with local directory and wrong repo
  // instances. Hence, we remove it here, if existing, and add the new path for which we added a
  // workspace opener handler.
  atom.project.removePath(workingDirectoryUri);

  atom.project.addPath(workingDirectoryUri);

  const subscription = atom.project.onDidChangePaths(paths => {
    if (paths.indexOf(workingDirectoryUri) !== -1) {
      return;
    }

    // The project was removed from the tree.
    subscription.dispose();
    if (connection.isOnlyConnection()) {
      closeOpenFilesForRemoteProject(connection);
    }

    // Integration tests close the connection manually, so skip the rest.
    if (atom.inSpecMode()) {
      return;
    }

    // Delay closing the underlying socket connection until registered subscriptions have closed.
    // We should never depend on the order of registration of the `onDidChangePaths` event,
    // which also dispose consumed service's resources.
    setTimeout(closeRemoteConnection, CLOSE_PROJECT_DELAY_MS);
  });

  function closeRemoteConnection() {
    const closeConnection = shutdownIfLast => {
      connection.close(shutdownIfLast);
    };

    if (!connection.isOnlyConnection()) {
      (_constants || _load_constants()).logger.info('Remaining remote projects using Nuclide Server - no prompt to shutdown');
      const shutdownIfLast = false;
      closeConnection(shutdownIfLast);
      return;
    }

    if (connection.alwaysShutdownIfLast()) {
      closeConnection(true);
      return;
    }

    const shutdownServerAfterDisconnection = (_featureConfig || _load_featureConfig()).default.get('nuclide-remote-projects.shutdownServerAfterDisconnection');

    if (!(typeof shutdownServerAfterDisconnection === 'boolean')) {
      throw new Error('Invariant violation: "typeof shutdownServerAfterDisconnection === \'boolean\'"');
    }

    closeConnection(shutdownServerAfterDisconnection);
  }

  return subscription;
}

function closeOpenFilesForRemoteProject(connection) {
  const remoteProjectConfig = connection.getConfig();
  const openInstances = (0, (_utils || _load_utils()).getOpenFileEditorForRemoteProject)(remoteProjectConfig);
  for (const openInstance of openInstances) {
    const { uri, editor, pane } = openInstance;
    // It's possible to open files outside of the root of the connection.
    // Only clean up these files if we're the only connection left.
    if (connection.isOnlyConnection() || (_nuclideUri || _load_nuclideUri()).default.contains(connection.getUriForInitialWorkingDirectory(), uri)) {
      pane.removeItem(editor);
      editor.destroy();
    }
  }
}

function getRemoteRootDirectories() {
  // TODO: Use nuclideUri instead.
  return atom.project.getDirectories().filter(directory => directory.getPath().startsWith('nuclide:'));
}

/**
 * Removes any Directory (not RemoteDirectory) objects that have Nuclide
 * remote URIs.
 */
function deleteDummyRemoteRootDirectories() {
  for (const directory of atom.project.getDirectories()) {
    if ((_nuclideUri || _load_nuclideUri()).default.isRemote(directory.getPath()) && !(_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteDirectory.isRemoteDirectory(directory)) {
      atom.project.removePath(directory.getPath());
    }
  }
}function isRemoteBufferInitialized(editor) {
  const buffer = editor.getBuffer();
  if (buffer && buffer.constructor.name === 'NuclideTextBuffer') {
    return true;
  }
  return false;
}

function shutdownServersAndRestartNuclide() {
  atom.confirm({
    message: 'This will shutdown your Nuclide servers and restart Atom, ' + 'discarding all unsaved changes. Continue?',
    buttons: {
      'Shutdown & Restart': (() => {
        var _ref3 = (0, _asyncToGenerator.default)(function* () {
          try {
            yield (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackImmediate)('nuclide-remote-projects:kill-and-restart');
          } finally {
            // This directly kills the servers without removing the RemoteConnections
            // so that restarting Nuclide preserves the existing workspace state.
            yield (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.forceShutdownAllServers();
            atom.reload();
          }
        });

        return function ShutdownRestart() {
          return _ref3.apply(this, arguments);
        };
      })(),
      Cancel: () => {}
    }
  });
}

function activate(state) {
  const subscriptions = new _atom.CompositeDisposable();

  controller = new (_RemoteProjectsController || _load_RemoteProjectsController()).default();
  remoteProjectsService = new (_RemoteProjectsService || _load_RemoteProjectsService()).default();

  subscriptions.add((_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.onDidAddRemoteConnection(connection => {
    subscriptions.add(addRemoteFolderToProject(connection));

    // On Atom restart, it tries to open uri paths as local `TextEditor` pane items.
    // Here, Nuclide reloads the remote project files that have empty text editors open.
    const config = connection.getConfig();
    const openInstances = (0, (_utils || _load_utils()).getOpenFileEditorForRemoteProject)(config);
    for (const openInstance of openInstances) {
      // Keep the original open editor item with a unique name until the remote buffer is loaded,
      // Then, we are ready to replace it with the remote tab in the same pane.
      const { pane, editor, uri, filePath } = openInstance;

      // Skip restoring the editer who has remote content loaded.
      if (isRemoteBufferInitialized(editor)) {
        continue;
      }

      // Atom ensures that each pane only has one item per unique URI.
      // Null out the existing pane item's URI so we can insert the new one
      // without closing the pane.
      editor.getURI = () => null;
      // Cleanup the old pane item on successful opening or when no connection could be
      // established.
      const cleanupBuffer = () => {
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
    }
  }));

  subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-remote-projects:connect', () => (0, (_openConnection || _load_openConnection()).openConnectionDialog)()));

  subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-remote-projects:kill-and-restart', () => shutdownServersAndRestartNuclide()));

  // Subscribe opener before restoring the remote projects.
  subscriptions.add(atom.workspace.addOpener((uri = '') => {
    if (uri.startsWith('nuclide:')) {
      const serverConnection = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.getForUri(uri);
      if (serverConnection == null) {
        // It's possible that the URI opens before the remote connection has finished loading
        // (or the remote connection cannot be restored for some reason).
        //
        // In this case, we can just let Atom open a blank editor. Once the connection
        // is re-established, the `onDidAddRemoteConnection` logic above will restore the
        // editor contents as appropriate.
        return;
      }
      const connection = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.getForUri(uri);
      // On Atom restart, it tries to open the uri path as a file tab because it's not a local
      // directory. We can't let that create a file with the initial working directory path.
      if (connection != null && uri === connection.getUriForInitialWorkingDirectory()) {
        const blankEditor = atom.workspace.buildTextEditor({});
        // No matter what we do here, Atom is going to create a blank editor.
        // We don't want the user to see this, so destroy it as soon as possible.
        setImmediate(() => blankEditor.destroy());
        return blankEditor;
      }
      if (pendingFiles[uri]) {
        return pendingFiles[uri];
      }
      const textEditorPromise = pendingFiles[uri] = createEditorForNuclide(uri);
      const removeFromCache = () => delete pendingFiles[uri];
      textEditorPromise.then(removeFromCache, removeFromCache);
      return textEditorPromise;
    }
  }));

  subscriptions.add((0, (_patchAtomWorkspaceReplace || _load_patchAtomWorkspaceReplace()).default)());

  // If RemoteDirectoryProvider is called before this, and it failed
  // to provide a RemoteDirectory for a
  // given URI, Atom will create a generic Directory to wrap that. We want
  // to delete these instead, because those directories aren't valid/useful
  // if they are not true RemoteDirectory objects (connected to a real
  // real remote folder).
  deleteDummyRemoteRootDirectories();

  // Attempt to reload previously open projects.
  const remoteProjectsConfig = state && state.remoteProjectsConfig;
  reloadRemoteProjects(remoteProjectsConfig || []);
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
  const remoteProjectsConfig = getRemoteRootDirectories().map(directory => {
    const connection = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.getForUri(directory.getPath());
    return connection ? createSerializableRemoteConnectionConfiguration(connection.getConfig()) : null;
  }).filter(config => config != null);
  return {
    remoteProjectsConfig
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

  if (remoteProjectsService != null) {
    remoteProjectsService.dispose();
    remoteProjectsService = null;
  }

  // Gracefully shutdown all server connections and leave servers running.
  const shutdown = false;
  (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.closeAll(shutdown);
}

function createRemoteDirectoryProvider() {
  return new (_RemoteDirectoryProvider || _load_RemoteDirectoryProvider()).default();
}

function createRemoteDirectorySearcher() {
  return new (_RemoteDirectorySearcher || _load_RemoteDirectorySearcher()).default(dir => {
    return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getGrepServiceByNuclideUri)(dir.getPath());
  }, () => workingSetsStore);
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

function provideRemoteProjectsService() {
  if (!(remoteProjectsService != null)) {
    throw new Error('Invariant violation: "remoteProjectsService != null"');
  }

  return remoteProjectsService;
}

function consumeNotifications(raiseNativeNotification) {
  (0, (_AtomNotifications || _load_AtomNotifications()).setNotificationService)(raiseNativeNotification);
}

function consumeWorkingSetsStore(store) {
  workingSetsStore = store;
}