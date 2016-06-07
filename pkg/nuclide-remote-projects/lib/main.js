'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HomeFragments} from '../../nuclide-home/lib/types';
import type {
  RemoteConnectionConfiguration,
} from '../../nuclide-remote-connection/lib/RemoteConnection';
import type {NuclideUri} from '../../nuclide-remote-uri';
import type RemoteDirectoryProviderT from './RemoteDirectoryProvider';
import type RemoteDirectorySearcherT from './RemoteDirectorySearcher';
import type RemoteProjectsControllerT from './RemoteProjectsController';
import typeof * as FindInProjectService from '../../nuclide-remote-search';

import {loadBufferForUri} from '../../commons-atom/text-editor';
import {getLogger} from '../../nuclide-logging';
import {getOpenFileEditorForRemoteProject} from './utils';
import featureConfig from '../../nuclide-feature-config';
import invariant from 'assert';
import {CompositeDisposable} from 'atom';
import {RemoteConnection, ServerConnection} from '../../nuclide-remote-connection';
import {trackImmediate} from '../../nuclide-analytics';
import {openConnectionDialog} from './open-connection';

const logger = getLogger();

/**
 * Stores the host and cwd of a remote connection.
 */
type SerializableRemoteConnectionConfiguration = {
  host: string;
  cwd: string;
  displayTitle: string;
};

let packageSubscriptions: ?CompositeDisposable = null;
let controller: ?RemoteProjectsControllerT = null;

const CLOSE_PROJECT_DELAY_MS = 100;
const pendingFiles = {};

function createSerializableRemoteConnectionConfiguration(
  config: RemoteConnectionConfiguration,
): SerializableRemoteConnectionConfiguration {
  return {
    host: config.host,
    cwd: config.cwd,
    displayTitle: config.displayTitle,
  };
}

async function createRemoteConnection(
  remoteProjectConfig: SerializableRemoteConnectionConfiguration,
): Promise<?RemoteConnection> {
  const {host, cwd, displayTitle} = remoteProjectConfig;
  let connection = RemoteConnection.getByHostnameAndPath(host, cwd);
  if (connection != null) {
    return connection;
  }

  connection = await RemoteConnection.createConnectionBySavedConfig(host, cwd, displayTitle);
  if (connection != null) {
    return connection;
  }

  // If connection fails using saved config, open connect dialog.
  return openConnectionDialog({
    initialServer: remoteProjectConfig.host,
    initialCwd: remoteProjectConfig.cwd,
  });
}

function addRemoteFolderToProject(connection: RemoteConnection) {
  const workingDirectoryUri = connection.getUriForInitialWorkingDirectory();
  // If restoring state, then the project already exists with local directory and wrong repo
  // instances. Hence, we remove it here, if existing, and add the new path for which we added a
  // workspace opener handler.
  atom.project.removePath(workingDirectoryUri);

  atom.project.addPath(workingDirectoryUri);

  const subscription = atom.project.onDidChangePaths(() => {
    // Delay closing the underlying socket connection until registered subscriptions have closed.
    // We should never depend on the order of registration of the `onDidChangePaths` event,
    // which also dispose consumed service's resources.
    setTimeout(checkClosedProject, CLOSE_PROJECT_DELAY_MS);
  });

  function checkClosedProject() {
    // The project paths may have changed during the delay time.
    // Hence, the latest project paths are fetched here.
    const paths = atom.project.getPaths();
    if (paths.indexOf(workingDirectoryUri) !== -1) {
      return;
    }
    // The project was removed from the tree.
    subscription.dispose();

    closeOpenFilesForRemoteProject(connection.getConfig());

    const hostname = connection.getRemoteHostname();
    const closeConnection = (shutdownIfLast: boolean) => {
      connection.close(shutdownIfLast);
    };

    if (!connection.isOnlyConnection()) {
      logger.info('Remaining remote projects using Nuclide Server - no prompt to shutdown');
      const shutdownIfLast = false;
      closeConnection(shutdownIfLast);
      return;
    }

    const buttons = ['Keep It', 'Shutdown'];
    const buttonToActions = new Map();

    buttonToActions.set(buttons[0], () => closeConnection(/* shutdownIfLast */ false));
    buttonToActions.set(buttons[1], () => closeConnection(/* shutdownIfLast */ true));

    if (featureConfig.get(
      'nuclide-remote-projects.shutdownServerAfterDisconnection',
    )) {
      // Atom takes the first button in the list as default option.
      buttons.reverse();
    }

    const choice = global.atom.confirm({
      message: 'No more remote projects on the host: \'' + hostname +
        '\'. Would you like to shutdown Nuclide server there?',
      buttons,
    });

    const action = buttonToActions.get(buttons[choice]);
    invariant(action);
    action();
  }
}

function closeOpenFilesForRemoteProject(remoteProjectConfig: RemoteConnectionConfiguration): void {
  const openInstances = getOpenFileEditorForRemoteProject(remoteProjectConfig);
  for (const openInstance of openInstances) {
    const {editor, pane} = openInstance;
    pane.removeItem(editor);
    editor.destroy();
  }
}

function getRemoteRootDirectories(): Array<atom$Directory> {
  // TODO: Use nuclide-remote-uri instead.
  return atom.project.getDirectories().filter(
    directory => directory.getPath().startsWith('nuclide:'));
}

/**
 * Removes any Directory (not RemoteDirectory) objects that have Nuclide
 * remote URIs.
 */
function deleteDummyRemoteRootDirectories() {
  const {RemoteDirectory} = require('../../nuclide-remote-connection');
  const {isRemote} = require('../../nuclide-remote-uri');
  for (const directory of atom.project.getDirectories()) {
    if (isRemote(directory.getPath()) &&
        !(RemoteDirectory.isRemoteDirectory(directory))) {
      atom.project.removePath(directory.getPath());
    }
  }
}

/**
 * The same TextEditor must be returned to prevent Atom from creating multiple tabs
 * for the same file, because Atom doesn't cache pending opener promises.
 */
async function createEditorForNuclide(
  uri: NuclideUri,
): Promise<TextEditor> {
  try {
    let buffer;
    try {
      buffer = await loadBufferForUri(uri);
    } catch (err) {
      // Suppress ENOENT errors which occur if the file doesn't exist.
      // This is the same thing Atom does when opening a file (given a URI) that doesn't exist.
      if (err.code !== 'ENOENT' || err._nuclideTextBufferRemnant == null) {
        throw err;
      }
      // If `loadBufferForURI` fails, then the buffer is removed from Atom's list of buffers.
      // Additionally, `buffer` will still be null. So, the NuclideTextBuffer is passed through
      // the exception handling control flow for this special case. The buffer is also added back
      // to the internal list for consistency's sake.
      buffer = err._nuclideTextBufferRemnant;
      atom.project.addBuffer(buffer);
    }
    return atom.workspace.buildTextEditor({buffer});
  } catch (err) {
    logger.warn('buffer load issue:', err);
    atom.notifications.addError(`Failed to open ${uri}: ${err.message}`);
    throw err;
  }
}

/**
 * Check if the remote buffer has already been initialized in editor.
 * This checks if the buffer is instance of NuclideTextBuffer.
 */
function isRemoteBufferInitialized(editor: TextEditor): boolean {
  const buffer = editor.getBuffer();
  if (buffer && buffer.constructor.name === 'NuclideTextBuffer') {
    return true;
  }
  return false;
}

async function reloadRemoteProjects(
  remoteProjects: Array<SerializableRemoteConnectionConfiguration>,
): Promise<void> {
  // This is intentionally serial.
  // The 90% use case is to have multiple remote projects for a single connection;
  // after the first one succeeds the rest should require no user action.
  for (const config of remoteProjects) {
    /* eslint-disable babel/no-await-in-loop */
    const connection = await createRemoteConnection(config);
    if (!connection) {
      logger.info(
        'No RemoteConnection returned on restore state trial:',
        config.host,
        config.cwd,
      );
    } else {
      // It's fine the user connected to a different project on the same host:
      // we should still be able to restore this using the new connection.
      const {cwd, host, displayTitle} = config;
      if (connection.getPathForInitialWorkingDirectory() !== cwd &&
          connection.getRemoteHostname() === host) {
        await RemoteConnection.createConnectionBySavedConfig(host, cwd, displayTitle);
      }
    }
    /* eslint-enable babel/no-await-in-loop */
  }
}

async function shutdownServersAndRestartNuclide(): Promise<void> {
  atom.confirm({
    message: 'This will shutdown your Nuclide servers and restart Atom, ' +
      'discarding all unsaved changes. Continue?',
    buttons: {
      'Shutdown & Restart': async () => {
        try {
          await trackImmediate('nuclide-remote-projects:kill-and-restart');
        } finally {
          // This directly kills the servers without removing the RemoteConnections
          // so that restarting Nuclide preserves the existing workspace state.
          await ServerConnection.forceShutdownAllServers();
          atom.reload();
        }
      },
      'Cancel': () => {},
    },
  });
}

export function activate(
  state: ?{remoteProjectsConfig: SerializableRemoteConnectionConfiguration[]},
): void {
  const subscriptions = new CompositeDisposable();

  const RemoteProjectsController = require('./RemoteProjectsController');
  controller = new RemoteProjectsController();

  subscriptions.add(RemoteConnection.onDidAddRemoteConnection(connection => {
    addRemoteFolderToProject(connection);


    // On Atom restart, it tries to open uri paths as local `TextEditor` pane items.
    // Here, Nuclide reloads the remote project files that have empty text editors open.
    const config = connection.getConfig();
    const openInstances = getOpenFileEditorForRemoteProject(config);
    for (const openInstance of openInstances) {
      // Keep the original open editor item with a unique name until the remote buffer is loaded,
      // Then, we are ready to replace it with the remote tab in the same pane.
      const {pane, editor, uri, filePath} = openInstance;

      // Skip restoring the editer who has remote content loaded.
      if (isRemoteBufferInitialized(editor)) {
        continue;
      }

      // Atom ensures that each pane only has one item per unique URI.
      // Null out the existing pane item's URI so we can insert the new one
      // without closing the pane.
      /* $FlowFixMe */
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

  subscriptions.add(atom.commands.add(
    'atom-workspace',
    'nuclide-remote-projects:connect',
    () => openConnectionDialog()
  ));

  subscriptions.add(atom.commands.add(
    'atom-workspace',
    'nuclide-remote-projects:kill-and-restart',
    () => shutdownServersAndRestartNuclide(),
  ));

  // Subscribe opener before restoring the remote projects.
  subscriptions.add(atom.workspace.addOpener((uri = '') => {
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

  // If RemoteDirectoryProvider is called before this, and it failed
  // to provide a RemoteDirectory for a
  // given URI, Atom will create a generic Directory to wrap that. We want
  // to delete these instead, because those directories aren't valid/useful
  // if they are not true RemoteDirectory objects (connected to a real
  // real remote folder).
  deleteDummyRemoteRootDirectories();

  // Attempt to reload previously open projects.
  const remoteProjectsConfig = state && state.remoteProjectsConfig;
  if (remoteProjectsConfig != null) {
    reloadRemoteProjects(remoteProjectsConfig);
  }
  packageSubscriptions = subscriptions;
}

export function consumeStatusBar(statusBar: atom$StatusBar): void {
  if (controller) {
    controller.consumeStatusBar(statusBar);
  }
}

// TODO: All of the elements of the array are non-null, but it does not seem possible to convince
// Flow of that.
export function serialize(
): {remoteProjectsConfig: Array<?SerializableRemoteConnectionConfiguration>} {
  const remoteProjectsConfig: Array<?SerializableRemoteConnectionConfiguration> =
    getRemoteRootDirectories()
      .map((directory: atom$Directory): ?SerializableRemoteConnectionConfiguration => {
        const connection = RemoteConnection.getForUri(directory.getPath());
        return connection ?
          createSerializableRemoteConnectionConfiguration(connection.getConfig()) : null;
      })
      .filter((config: ?SerializableRemoteConnectionConfiguration) => config != null);
  return {
    remoteProjectsConfig,
  };
}

export function deactivate(): void {
  if (packageSubscriptions) {
    packageSubscriptions.dispose();
    packageSubscriptions = null;
  }

  if (controller != null) {
    controller.destroy();
    controller = null;
  }
}

export function createRemoteDirectoryProvider(): RemoteDirectoryProviderT {
  const RemoteDirectoryProvider = require('./RemoteDirectoryProvider');
  return new RemoteDirectoryProvider();
}

export function createRemoteDirectorySearcher(): RemoteDirectorySearcherT {
  const {getServiceByNuclideUri} = require('../../nuclide-client');
  const {RemoteDirectory} = require('../../nuclide-remote-connection');
  const RemoteDirectorySearcher = require('./RemoteDirectorySearcher');
  return new RemoteDirectorySearcher((dir: RemoteDirectory) => {
    const service = getServiceByNuclideUri('FindInProjectService', dir.getPath());
    invariant(service);
    return (service: FindInProjectService);
  });
}

export function getHomeFragments(): HomeFragments {
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
