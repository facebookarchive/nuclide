/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {HomeFragments} from '../../nuclide-home/lib/types';
import type {RemoteConnectionConfiguration} from '../../nuclide-remote-connection/lib/RemoteConnection';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {OpenConnectionDialogOptions} from './open-connection';
import type {WorkingSetsStore} from '../../nuclide-working-sets/lib/types';

import createPackage from 'nuclide-commons-atom/createPackage';
import {enforceReadOnlyEditor} from 'nuclide-commons-atom/text-editor';
import {
  loadBufferForUri,
  bufferForUri,
  getServiceByNuclideUri,
} from '../../nuclide-remote-connection';
import {logger} from './constants';
import {
  RemoteTextEditorPlaceholder,
  type RemoteTextEditorPlaceholderState,
} from './RemoteTextEditorPlaceholder';
import {getOpenFileEditorForRemoteProject} from './utils';
import featureConfig from 'nuclide-commons-atom/feature-config';
import loadingNotification from '../../commons-atom/loading-notification';
import invariant from 'assert';
import {TextEditor} from 'atom';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {
  RemoteConnection,
  RemoteDirectory,
  RemoteFile,
  ServerConnection,
  getCodeSearchServiceByNuclideUri,
} from '../../nuclide-remote-connection';
import {trackImmediate} from '../../nuclide-analytics';
import {openConnectionDialog} from './open-connection';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {sleep} from 'nuclide-commons/promise';
import RemoteDirectorySearcher from './RemoteDirectorySearcher';
import RemoteDirectoryProvider from './RemoteDirectoryProvider';
import RemoteProjectsController from './RemoteProjectsController';
import RemoteProjectsServiceImpl from './RemoteProjectsService';
import patchAtomWorkspaceReplace from './patchAtomWorkspaceReplace';
import {setNotificationService} from './AtomNotifications';

export type RemoteProjectsService = {
  /**
   * A simple way to wait for remote projects to finish reloading after startup.
   * Resolves with a list of successfully reloaded project paths.
   * If reloading has already finished, this immediately resolves.
   */
  waitForRemoteProjectReload(
    callback: (loadedProjects: Array<string>) => mixed,
  ): IDisposable,

  /**
   * Attempts to open a remote connection, first by attempting the previously cached connection
   * and then by opening a connection dialog.
   */
  createRemoteConnection(
    config: SerializableRemoteConnectionConfiguration,
  ): Promise<?RemoteConnection>,

  /**
   * Start the flow to open a remote connection by opening a connection dialog, regardless of
   * the previously cached connections.
   */
  openConnectionDialog(
    config: OpenConnectionDialogOptions,
  ): Promise<?RemoteConnection>,

  /**
   * Find an existing connection or create one given the remote connetion details.
   */
  findOrCreate(
    config: RemoteConnectionConfiguration,
  ): Promise<RemoteConnection>,
};

/**
 * Stores the host, path, displayTitle of a remote connection and
 * a property switch for whether to prompt to connect again if reconnect attempt fails.
 */
export type SerializableRemoteConnectionConfiguration = {
  host: string,
  path: string,
  displayTitle: string,
  promptReconnectOnFailure?: boolean,
};

const CLOSE_PROJECT_DELAY_MS = 100;

class Activation {
  _subscriptions = new UniversalDisposable();
  _pendingFiles = {};
  _controller = new RemoteProjectsController();
  _remoteProjectsService = new RemoteProjectsServiceImpl();
  _workingSetsStore: ?WorkingSetsStore;

  constructor(
    state: ?{remoteProjectsConfig: SerializableRemoteConnectionConfiguration[]},
  ) {
    this._subscriptions.add(
      RemoteConnection.onDidAddRemoteConnection(connection => {
        this._subscriptions.add(addRemoteFolderToProject(connection));
        replaceRemoteEditorPlaceholders(connection);
      }),
    );

    this._subscriptions.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-remote-projects:connect',
        event => {
          let args;
          if (event.detail != null) {
            const {initialCwd} = event.detail;
            if (initialCwd != null) {
              args = {initialCwd};
            }
          }
          openConnectionDialog(args);
        },
      ),
      atom.commands.add(
        'atom-workspace',
        'nuclide-remote-projects:kill-and-restart',
        () => shutdownServersAndRestartNuclide(),
      ),
    );

    // Subscribe opener before restoring the remote projects.
    this._subscriptions.add(atom.workspace.addOpener(this._openRemoteFile));

    this._subscriptions.add(
      atom.workspace.observeTextEditors(editor => {
        const uri = editor.getURI();
        if (uri != null && nuclideUri.isInArchive(uri)) {
          enforceReadOnlyEditor(editor);
        }
      }),
    );

    this._subscriptions.add(patchAtomWorkspaceReplace());

    // If RemoteDirectoryProvider is called before this, and it failed
    // to provide a RemoteDirectory for a
    // given URI, Atom will create a generic Directory to wrap that. We want
    // to delete these instead, because those directories aren't valid/useful
    // if they are not true RemoteDirectory objects (connected to a real
    // real remote folder).
    deleteDummyRemoteRootDirectories();

    // Attempt to reload previously open projects.
    const remoteProjectsConfig = validateRemoteProjectConfig(
      state && state.remoteProjectsConfig,
    );
    reloadRemoteProjects(remoteProjectsConfig, this._remoteProjectsService);
  }

  dispose(): Promise<void> {
    this._subscriptions.dispose();
    this._controller.dispose();
    this._remoteProjectsService.dispose();

    // Gracefully shutdown all server connections and leave servers running.
    const shutdown = false;
    const shutdownTimeout = 1000;
    // This tells Atom to wait for the close request to be acknowledged -
    // but don't wait too long.
    return Promise.race([
      ServerConnection.closeAll(shutdown).catch(err => {
        // log4js is potentially also being shut down during deactivation.
        // eslint-disable-next-line no-console
        console.error('Error closing server connections in deactivate', err);
      }),
      sleep(shutdownTimeout),
    ]);
  }

  serialize(): {
    remoteProjectsConfig: Array<SerializableRemoteConnectionConfiguration>,
  } {
    const remoteProjectsConfig = getRemoteRootDirectories()
      .map(directory => {
        const connection = RemoteConnection.getForUri(directory.getPath());
        return connection == null
          ? null
          : createSerializableRemoteConnectionConfiguration(
              connection.getConfig(),
            );
      })
      .filter(Boolean);
    return {remoteProjectsConfig};
  }

  _openRemoteFile = (uri = '') => {
    if (
      nuclideUri.looksLikeImageUri(uri) &&
      atom.packages.getLoadedPackage('nuclide-image-view') != null
    ) {
      // Images will be handled by the nuclide-remote-images package. Ideally, all remote files
      // would go through one code path and then be delegated to the appropriate handler (instead
      // of having this need to be aware of the nuclide-remote-images package implementation), but
      // this is quick and dirty.
      return;
    }
    if (!uri.startsWith('nuclide:') && !nuclideUri.isInArchive(uri)) {
      return;
    }
    if (uri.startsWith('nuclide:')) {
      const serverConnection = ServerConnection.getForUri(uri);
      if (serverConnection == null) {
        // It's possible that the URI opens before the remote connection has finished loading
        // (or the remote connection cannot be restored for some reason).
        //
        // In this case, we can just let Atom open a blank editor. Once the connection
        // is re-established, the `onDidAddRemoteConnection` logic above will restore the
        // editor contents as appropriate.
        return;
      }
      const connection = RemoteConnection.getForUri(uri);
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

  //
  // Services
  //

  getHomeFragments(): HomeFragments {
    return {
      feature: {
        title: 'Remote Connection',
        icon: 'cloud-upload',
        description: 'Connect to a remote server to edit files.',
        command: 'nuclide-remote-projects:connect',
      },
      priority: 8,
    };
  }

  provideRemoteProjectsService(): RemoteProjectsService {
    return this._remoteProjectsService;
  }

  provideRpcServices(): nuclide$RpcService {
    return Object.freeze({
      getServiceByNuclideUri: (serviceName: string, uri: ?string) =>
        getServiceByNuclideUri(serviceName, uri),
    });
  }

  createRemoteDirectorySearcher(): RemoteDirectorySearcher {
    return new RemoteDirectorySearcher((dir: RemoteDirectory) => {
      return getCodeSearchServiceByNuclideUri(dir.getPath());
    }, () => this._workingSetsStore);
  }

  consumeStatusBar(statusBar: atom$StatusBar): void {
    this._controller.consumeStatusBar(statusBar);
  }

  consumeNotifications(
    raiseNativeNotification: (
      title: string,
      body: string,
      timeout: number,
      raiseIfAtomHasFocus: boolean,
    ) => ?IDisposable,
  ): void {
    setNotificationService(raiseNativeNotification);
  }

  consumeWorkingSetsStore(store: WorkingSetsStore): void {
    this._workingSetsStore = store;
  }

  //
  // Deserializers
  //

  deserializeRemoteTextEditorPlaceholder(
    state: RemoteTextEditorPlaceholderState,
  ): RemoteTextEditorPlaceholder {
    return new RemoteTextEditorPlaceholder(state);
  }
}

function createSerializableRemoteConnectionConfiguration(
  config: RemoteConnectionConfiguration,
): SerializableRemoteConnectionConfiguration {
  return {
    host: config.host,
    path: config.path,
    displayTitle: config.displayTitle,
    promptReconnectOnFailure: config.promptReconnectOnFailure,
  };
}

function addRemoteFolderToProject(connection: RemoteConnection): IDisposable {
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
    logger.info(`Project ${workingDirectoryUri} removed from the tree`);
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
    const closeConnection = (shutdownIfLast: boolean) => {
      logger.info('Closing remote connection.', {shutdownIfLast});
      connection.close(shutdownIfLast);
    };

    logger.info('Closing connection to remote project.');
    if (!connection.getConnection().hasSingleMountPoint()) {
      logger.info(
        'Remaining remote projects using Nuclide Server - no prompt to shutdown',
      );
      const shutdownIfLast = false;
      closeConnection(shutdownIfLast);
      return;
    }

    if (connection.alwaysShutdownIfLast()) {
      closeConnection(true);
      return;
    }

    const shutdownServerAfterDisconnection = featureConfig.get(
      'nuclide-remote-projects.shutdownServerAfterDisconnection',
    );
    invariant(typeof shutdownServerAfterDisconnection === 'boolean');
    logger.info({shutdownServerAfterDisconnection});
    closeConnection(shutdownServerAfterDisconnection);
  }

  return subscription;
}

function closeOpenFilesForRemoteProject(connection: RemoteConnection): void {
  const remoteProjectConfig = connection.getConfig();
  const openInstances = getOpenFileEditorForRemoteProject(remoteProjectConfig);
  for (const openInstance of openInstances) {
    const {uri, editor, pane} = openInstance;
    // It's possible to open files outside of the root of the connection.
    // Only clean up these files if we're the only connection left.
    if (
      connection.getConnection().hasSingleMountPoint() ||
      nuclideUri.contains(connection.getUri(), uri)
    ) {
      pane.removeItem(editor);
      editor.destroy();
    }
  }
}

function getRemoteRootDirectories(): Array<atom$Directory> {
  // TODO: Use nuclideUri instead.
  return atom.project
    .getDirectories()
    .filter(directory => directory.getPath().startsWith('nuclide:'));
}

/**
 * Removes any Directory (not RemoteDirectory) objects that have Nuclide
 * remote URIs.
 */
function deleteDummyRemoteRootDirectories() {
  for (const directory of atom.project.getDirectories()) {
    if (
      nuclideUri.isRemote(directory.getPath()) &&
      !RemoteDirectory.isRemoteDirectory(directory)
    ) {
      atom.project.removePath(directory.getPath());
    }
  }
}

/**
 * The same TextEditor must be returned to prevent Atom from creating multiple tabs
 * for the same file, because Atom doesn't cache pending opener promises.
 */
async function createEditorForNuclide(uri: NuclideUri): Promise<TextEditor> {
  try {
    let buffer;
    try {
      buffer = await loadingNotification(
        loadBufferForUri(uri),
        `Opening \`${nuclideUri.nuclideUriToDisplayString(uri)}\`...`,
        1000 /* delay */,
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
      buffer = bufferForUri(uri);
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
      autoHeight: false,
    });
    // Add a custom serializer that deserializes to a placeholder TextEditor
    // that we have total control over. The usual Atom deserialization flow for editors
    // typically involves attempting to load the file from disk, which tends to throw.
    const textEditorSerialize = textEditor.serialize;
    // $FlowIgnore
    textEditor.serialize = function(): RemoteTextEditorPlaceholderState {
      const path = textEditor.getPath();
      // It's possible for an editor's path to become local (via Save As).
      if (path == null || !nuclideUri.isRemote(path)) {
        return textEditorSerialize.call(textEditor);
      }
      return {
        deserializer: 'RemoteTextEditorPlaceholder',
        data: {
          uri: path,
          contents: textEditor.getText(),
          // If the editor was unsaved, we'll restore the unsaved contents after load.
          isModified: textEditor.isModified(),
        },
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
    buffer.serialize = function() {
      const path = buffer.getPath();
      if (path == null || !nuclideUri.isRemote(path)) {
        return bufferSerialize.call(buffer);
      }
      return null;
    };
    return textEditor;
  } catch (err) {
    logger.warn('buffer load issue:', err);
    atom.notifications.addError(`Failed to open ${uri}: ${err.message}`);
    throw err;
  }
}

async function reloadRemoteProjects(
  remoteProjects: Array<SerializableRemoteConnectionConfiguration>,
  remoteProjectsService: RemoteProjectsServiceImpl,
): Promise<void> {
  // This is intentionally serial.
  // The 90% use case is to have multiple remote projects for a single connection;
  // after the first one succeeds the rest should require no user action.
  const reloadedProjects: Array<string> = [];
  for (const config of remoteProjects) {
    // eslint-disable-next-line no-await-in-loop
    const connection = await remoteProjectsService.createRemoteConnection(
      config,
    );
    if (!connection) {
      logger.info(
        'No RemoteConnection returned on restore state trial:',
        config.host,
        config.path,
      );

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

      ServerConnection.cancelConnection(config.host);
    } else {
      reloadedProjects.push(connection.getUri());
    }
  }
  remoteProjectsService._reloadFinished(reloadedProjects);
}

function shutdownServersAndRestartNuclide(): void {
  atom.confirm({
    message:
      'This will shutdown your Nuclide servers and restart Atom, ' +
      'discarding all unsaved changes. Continue?',
    buttons: {
      'Shutdown && Restart': async () => {
        try {
          await trackImmediate('nuclide-remote-projects:kill-and-restart');
        } finally {
          // This directly kills the servers without removing the RemoteConnections
          // so that restarting Nuclide preserves the existing workspace state.
          await ServerConnection.forceShutdownAllServers();
          atom.reload();
        }
      },
      Cancel: () => {},
    },
  });
}

function replaceRemoteEditorPlaceholders(connection: RemoteConnection): void {
  // On Atom restart, it tries to open uri paths as local `TextEditor` pane items.
  // Here, Nuclide reloads the remote project files that have empty text editors open.
  const config = connection.getConfig();
  const openInstances = getOpenFileEditorForRemoteProject(config);
  for (const openInstance of openInstances) {
    // Keep the original open editor item with a unique name until the remote buffer is loaded,
    // Then, we are ready to replace it with the remote tab in the same pane.
    const {pane, editor, uri, filePath} = openInstance;

    // Skip restoring the editor who has remote content loaded.
    if (
      editor instanceof TextEditor &&
      editor.getBuffer().file instanceof RemoteFile
    ) {
      continue;
    }

    // Atom ensures that each pane only has one item per unique URI.
    // Null out the existing pane item's URI so we can insert the new one
    // without closing the pane.
    if (editor instanceof TextEditor) {
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
      atom.workspace
        .openURIInPane(uri, pane)
        .then(newEditor => {
          if (
            editor instanceof RemoteTextEditorPlaceholder &&
            editor.isModified()
          ) {
            // If we had unsaved changes previously, restore them.
            newEditor.setText(editor.getText());
          }
        })
        .then(cleanupBuffer, cleanupBuffer);
    }
  }
}

function validateRemoteProjectConfig(
  raw: ?mixed,
): Array<SerializableRemoteConnectionConfiguration> {
  if (raw == null || !Array.isArray(raw)) {
    return [];
  }
  return raw
    .map(config => {
      if (config == null || typeof config !== 'object') {
        return null;
      }
      const {
        host,
        path: path_,
        cwd,
        displayTitle,
        promptReconnectOnFailure,
      } = config;
      const path = cwd == null ? path_ : cwd; // We renamed this. Make sure we check the old name.
      if (host == null || path == null || displayTitle == null) {
        return null;
      }
      const formatted: SerializableRemoteConnectionConfiguration = {
        host: String(host),
        path: String(path),
        displayTitle: String(displayTitle),
      };
      if (typeof promptReconnectOnFailure === 'boolean') {
        formatted.promptReconnectOnFailure = promptReconnectOnFailure;
      }
      return formatted;
    })
    .filter(Boolean);
}

createPackage(module.exports, Activation);

// The "atom.directory-provider" service is unique in that it's requested prior to package
// activation. Since the Activation class pattern guards against this, we need to special-case it.
// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports.createRemoteDirectoryProvider = () =>
  new RemoteDirectoryProvider();
