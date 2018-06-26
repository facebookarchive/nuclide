'use strict';

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../../modules/nuclide-commons-atom/text-editor');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _RemoteTextEditorPlaceholder;

function _load_RemoteTextEditorPlaceholder() {
  return _RemoteTextEditorPlaceholder = require('./RemoteTextEditorPlaceholder');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _loadingNotification;

function _load_loadingNotification() {
  return _loadingNotification = _interopRequireDefault(require('../../commons-atom/loading-notification'));
}

var _atom = require('atom');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

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
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _promise;

function _load_promise() {
  return _promise = require('../../../modules/nuclide-commons/promise');
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
 * Stores the host, path, displayTitle of a remote connection and
 * a property switch for whether to prompt to connect again if reconnect attempt fails.
 */
const CLOSE_PROJECT_DELAY_MS = 100; /**
                                     * Copyright (c) 2015-present, Facebook, Inc.
                                     * All rights reserved.
                                     *
                                     * This source code is licensed under the license found in the LICENSE file in
                                     * the root directory of this source tree.
                                     *
                                     *  strict-local
                                     * @format
                                     */

class Activation {

  constructor(state) {
    var _ref;

    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._pendingFiles = {};
    this._controller = new (_RemoteProjectsController || _load_RemoteProjectsController()).default();
    this._remoteProjectsService = new (_RemoteProjectsService || _load_RemoteProjectsService()).default();

    this._openRemoteFile = (uri = '') => {
      if ((_nuclideUri || _load_nuclideUri()).default.looksLikeImageUri(uri) && atom.packages.getLoadedPackage('nuclide-image-view') != null) {
        // Images will be handled by the nuclide-remote-images package. Ideally, all remote files
        // would go through one code path and then be delegated to the appropriate handler (instead
        // of having this need to be aware of the nuclide-remote-images package implementation), but
        // this is quick and dirty.
        return;
      }
      if (!uri.startsWith('nuclide:') && !(_nuclideUri || _load_nuclideUri()).default.isInArchive(uri)) {
        return;
      }
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
        if (connection != null && uri === connection.getUri()) {
          const blankEditor = atom.workspace.buildTextEditor({});
          // No matter what we do here, Atom is going to create a blank editor.
          // We don't want the user to see this, so destroy it as soon as possible.
          setImmediate(() => blankEditor.destroy());
          return blankEditor;
        }
      }
      if (this._pendingFiles[uri]) {
        return this._pendingFiles[uri];
      }
      const textEditorPromise = createEditorForNuclide(uri);
      this._pendingFiles[uri] = textEditorPromise;
      const removeFromCache = () => delete this._pendingFiles[uri];
      textEditorPromise.then(removeFromCache, removeFromCache);
      return textEditorPromise;
    };

    this._subscriptions.add((_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.onDidAddRemoteConnection(connection => {
      this._subscriptions.add(addRemoteFolderToProject(connection));
      replaceRemoteEditorPlaceholders(connection);
    }));

    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-remote-projects:connect', event => {
      const { initialCwd, project } = event.detail || {};
      (0, (_openConnection || _load_openConnection()).openConnectionDialog)({
        initialCwd,
        project
      });
    }), atom.commands.add('atom-workspace', 'nuclide-remote-projects:kill-and-restart', () => shutdownServersAndRestartNuclide()));

    // Subscribe opener before restoring the remote projects.
    this._subscriptions.add(atom.workspace.addOpener(this._openRemoteFile));

    this._subscriptions.add(atom.workspace.observeTextEditors(editor => {
      const uri = editor.getURI();
      if (uri != null && (_nuclideUri || _load_nuclideUri()).default.isInArchive(uri)) {
        (0, (_textEditor || _load_textEditor()).enforceReadOnlyEditor)(editor);
      }
    }));

    this._subscriptions.add((0, (_patchAtomWorkspaceReplace || _load_patchAtomWorkspaceReplace()).default)());

    // If RemoteDirectoryProvider is called before this, and it failed
    // to provide a RemoteDirectory for a
    // given URI, Atom will create a generic Directory to wrap that. We want
    // to delete these instead, because those directories aren't valid/useful
    // if they are not true RemoteDirectory objects (connected to a real
    // real remote folder).
    deleteDummyRemoteRootDirectories();

    // Attempt to reload previously open projects.
    const remoteProjectsConfig = validateRemoteProjectConfig(typeof state === 'object' ? (_ref = state) != null ? _ref.remoteProjectsConfig : _ref : null);
    reloadRemoteProjects(remoteProjectsConfig, this._remoteProjectsService);
  }

  dispose() {
    this._subscriptions.dispose();
    this._controller.dispose();
    this._remoteProjectsService.dispose();

    // Gracefully shutdown all server connections and leave servers running.
    const shutdown = false;
    const shutdownTimeout = 1000;
    // This tells Atom to wait for the close request to be acknowledged -
    // but don't wait too long.
    return Promise.race([(_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.closeAll(shutdown).catch(err => {
      // log4js is potentially also being shut down during deactivation.
      // eslint-disable-next-line no-console
      console.error('Error closing server connections in deactivate', err);
    }), (0, (_promise || _load_promise()).sleep)(shutdownTimeout)]);
  }

  serialize() {
    var _ref2;

    const currentProjectSpec =
    // $FlowIgnore: Add this to our types once we upstream
    atom.project.getSpecification == null ? null : atom.project.getSpecification();
    const projectFileUri = (_ref2 = currentProjectSpec) != null ? _ref2.originPath : _ref2;
    let remoteProjectSpecUris;
    if (projectFileUri != null && (_nuclideUri || _load_nuclideUri()).default.isRemote(projectFileUri)) {
      var _ref3;

      const projectSpecPaths = ((_ref3 = currentProjectSpec) != null ? _ref3.paths : _ref3) || [];
      remoteProjectSpecUris = new Set(projectSpecPaths.map(path => (_nuclideUri || _load_nuclideUri()).default.resolve(projectFileUri, path)));
    } else {
      remoteProjectSpecUris = new Set();
    }

    // Get the directories that aren't part of the project file. They were added by the user so we
    // want to restore those too.
    const remoteConnections = getRemoteRootDirectories().map(dir => (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.getForUri(dir.getPath())).filter(Boolean);
    const projectConnections = remoteConnections.filter(conn => remoteProjectSpecUris.has(conn.getUri()));
    const nonProjectConnections = remoteConnections.filter(conn => !projectConnections.includes(conn));

    const projectConfig = projectConnections.length === 0 ? null : projectConnections[0].getConfig();
    const activeProject = projectFileUri == null || projectConfig == null ? null : Object.assign({}, projectConfig, {
      host: (_nuclideUri || _load_nuclideUri()).default.getHostname(projectFileUri),
      path: (_nuclideUri || _load_nuclideUri()).default.getPath(projectFileUri)
    });

    const remoteProjectsConfig = [activeProject, ...nonProjectConnections.map(conn => createSerializableRemoteConnectionConfiguration(conn.getConfig()))].filter(Boolean);

    return { remoteProjectsConfig };
  }

  //
  // Services
  //

  getHomeFragments() {
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

  provideRemoteProjectsService() {
    return this._remoteProjectsService;
  }

  provideRpcServices() {
    return Object.freeze({
      getServiceByNuclideUri: (serviceName, uri) => (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)(serviceName, uri)
    });
  }

  createRemoteDirectorySearcher() {
    return new (_RemoteDirectorySearcher || _load_RemoteDirectorySearcher()).default(dir => {
      return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getCodeSearchServiceByNuclideUri)(dir.getPath());
    }, () => this._workingSetsStore);
  }

  consumeStatusBar(statusBar) {
    this._controller.consumeStatusBar(statusBar);
  }

  consumeNotifications(raiseNativeNotification) {
    (0, (_AtomNotifications || _load_AtomNotifications()).setNotificationService)(raiseNativeNotification);
  }

  consumeWorkingSetsStore(store) {
    this._workingSetsStore = store;
  }

  //
  // Deserializers
  //

  deserializeRemoteTextEditorPlaceholder(state) {
    return new (_RemoteTextEditorPlaceholder || _load_RemoteTextEditorPlaceholder()).RemoteTextEditorPlaceholder(state);
  }
}

function createSerializableRemoteConnectionConfiguration(config) {
  return {
    host: config.host,
    path: config.path,
    displayTitle: config.displayTitle,
    promptReconnectOnFailure: config.promptReconnectOnFailure
  };
}

function addRemoteFolderToProject(connection) {
  const workingDirectoryUri = connection.getUri();
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
    (_constants || _load_constants()).logger.info(`Project ${workingDirectoryUri} removed from the tree`);
    subscription.dispose();
    if (connection.getConnection().hasSingleMountPoint()) {
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
      (_constants || _load_constants()).logger.info('Closing remote connection.', { shutdownIfLast });
      connection.close(shutdownIfLast);
    };

    (_constants || _load_constants()).logger.info('Closing connection to remote project.');
    if (!connection.getConnection().hasSingleMountPoint()) {
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

    (_constants || _load_constants()).logger.info({ shutdownServerAfterDisconnection });
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
    if (connection.getConnection().hasSingleMountPoint() || (_nuclideUri || _load_nuclideUri()).default.contains(connection.getUri(), uri)) {
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
}

/**
 * The same TextEditor must be returned to prevent Atom from creating multiple tabs
 * for the same file, because Atom doesn't cache pending opener promises.
 */
async function createEditorForNuclide(uri) {
  try {
    let buffer;
    try {
      buffer = await (0, (_loadingNotification || _load_loadingNotification()).default)((0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).loadBufferForUri)(uri), `Opening \`${(_nuclideUri || _load_nuclideUri()).default.nuclideUriToDisplayString(uri)}\`...`, 1000 /* delay */
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
    const textEditor = atom.textEditors.build({
      buffer,
      largeFileMode,
      autoHeight: false
    });
    // Add a custom serializer that deserializes to a placeholder TextEditor
    // that we have total control over. The usual Atom deserialization flow for editors
    // typically involves attempting to load the file from disk, which tends to throw.
    const textEditorSerialize = textEditor.serialize;
    // $FlowIgnore
    textEditor.serialize = function () {
      const path = textEditor.getPath();
      // It's possible for an editor's path to become local (via Save As).
      if (path == null || !(_nuclideUri || _load_nuclideUri()).default.isRemote(path)) {
        return textEditorSerialize.call(textEditor);
      }
      return {
        deserializer: 'RemoteTextEditorPlaceholder',
        data: {
          uri: path,
          contents: textEditor.getText(),
          // If the editor was unsaved, we'll restore the unsaved contents after load.
          isModified: textEditor.isModified()
        }
      };
    };
    // Null out the buffer's serializer.
    // We don't need to waste time deserializing this (especially on Windows, where
    // attempting to read the path blocks Atom from loading)
    // As of Atom 1.22 null just gets filtered out by the project serializer.
    // https://github.com/atom/atom/blob/master/src/project.js#L117
    // $FlowIgnore
    const bufferSerialize = buffer.serialize;
    // $FlowIgnore
    buffer.serialize = function () {
      const path = buffer.getPath();
      if (path == null || !(_nuclideUri || _load_nuclideUri()).default.isRemote(path)) {
        return bufferSerialize.call(buffer);
      }
      return null;
    };
    return textEditor;
  } catch (err) {
    (_constants || _load_constants()).logger.warn('buffer load issue:', err);
    atom.notifications.addError(`Failed to open ${uri}: ${err.message}`);
    throw err;
  }
}

async function reloadRemoteProjects(remoteProjects, remoteProjectsService) {
  // This is intentionally serial.
  // The 90% use case is to have multiple remote projects for a single connection;
  const reloadedProjects = [];
  for (const config of remoteProjects) {
    // eslint-disable-next-line no-await-in-loop
    const connection = await remoteProjectsService.createRemoteConnection(config);
    if (!connection) {
      (_constants || _load_constants()).logger.info('No RemoteConnection returned on restore state trial:', config.host, config.path);

      // Atom restores remote files with a malformed URIs, which somewhat resemble local paths.
      // If after an unsuccessful connection user modifies and saves them he's presented
      // with a credential requesting dialog, as the file is attempted to be saved into
      // /nuclide:/<hostname> folder. If the user will approve the elevation and actually save
      // the file all kind of weird stuff happens (see t10842295) since the difference between the
      // remote and the valid local path becomes less aparent.
      // Anyway - these files better be closed.
      atom.workspace.getTextEditors().forEach(textEditor => {
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

      (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.cancelConnection(config.host);
    } else {
      reloadedProjects.push(connection.getUri());
    }
  }
  remoteProjectsService._reloadFinished(reloadedProjects);
}

function shutdownServersAndRestartNuclide() {
  atom.confirm({
    message: 'This will shutdown your Nuclide servers and restart Atom, ' + 'discarding all unsaved changes. Continue?',
    buttons: {
      'Shutdown && Restart': async () => {
        try {
          await (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackImmediate)('nuclide-remote-projects:kill-and-restart');
        } finally {
          // This directly kills the servers without removing the RemoteConnections
          // so that restarting Nuclide preserves the existing workspace state.
          await (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.forceShutdownAllServers();
          atom.reload();
        }
      },
      Cancel: () => {}
    }
  });
}

function replaceRemoteEditorPlaceholders(connection) {
  // On Atom restart, it tries to open uri paths as local `TextEditor` pane items.
  // Here, Nuclide reloads the remote project files that have empty text editors open.
  const config = connection.getConfig();
  const openInstances = (0, (_utils || _load_utils()).getOpenFileEditorForRemoteProject)(config);
  for (const openInstance of openInstances) {
    // Keep the original open editor item with a unique name until the remote buffer is loaded,
    // Then, we are ready to replace it with the remote tab in the same pane.
    const { pane, editor, uri, filePath } = openInstance;

    // Skip restoring the editor who has remote content loaded.
    if (editor instanceof _atom.TextEditor && editor.getBuffer().file instanceof (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteFile) {
      continue;
    }

    // Atom ensures that each pane only has one item per unique URI.
    // Null out the existing pane item's URI so we can insert the new one
    // without closing the pane.
    if (editor instanceof _atom.TextEditor) {
      editor.getURI = () => null;
    }
    // Cleanup the old pane item on successful opening or when no connection could be
    // established.
    const cleanupBuffer = () => {
      pane.removeItem(editor);
      editor.destroy();
    };
    if (filePath === config.path) {
      cleanupBuffer();
    } else {
      // If we clean up the buffer before the `openUriInPane` finishes,
      // the pane will be closed, because it could have no other items.
      // So we must clean up after.
      atom.workspace.openURIInPane(uri, pane).then(newEditor => {
        if (editor instanceof (_RemoteTextEditorPlaceholder || _load_RemoteTextEditorPlaceholder()).RemoteTextEditorPlaceholder && editor.isModified()) {
          // If we had unsaved changes previously, restore them.
          newEditor.setText(editor.getText());
        }
      }).then(cleanupBuffer, cleanupBuffer);
    }
  }
}

function validateRemoteProjectConfig(raw) {
  if (raw == null || !Array.isArray(raw)) {
    return [];
  }
  return raw.map(config => {
    if (config == null || typeof config !== 'object') {
      return null;
    }
    const {
      host,
      path: path_,
      cwd,
      displayTitle,
      promptReconnectOnFailure
    } = config;
    const path = cwd == null ? path_ : cwd; // We renamed this. Make sure we check the old name.
    if (host == null || path == null || displayTitle == null) {
      return null;
    }
    const formatted = {
      host: String(host),
      path: String(path),
      displayTitle: String(displayTitle)
    };
    if (typeof promptReconnectOnFailure === 'boolean') {
      formatted.promptReconnectOnFailure = promptReconnectOnFailure;
    }
    return formatted;
  }).filter(Boolean);
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);

// The "atom.directory-provider" service is unique in that it's requested prior to package
// activation. Since the Activation class pattern guards against this, we need to special-case it.
// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports.createRemoteDirectoryProvider = () => new (_RemoteDirectoryProvider || _load_RemoteDirectoryProvider()).default();