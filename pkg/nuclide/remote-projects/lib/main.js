'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HomeFragments} from 'nuclide-home-interfaces';
import type {
  RemoteConnectionConfiguration,
} from 'nuclide-remote-connection/lib/RemoteConnection';
import type RemoteDirectoryProviderT from './RemoteDirectoryProvider';
import type RemoteDirectorySearcherT from './RemoteDirectorySearcher';
import type RemoteProjectsControllerT from './RemoteProjectsController';

import {createTextEditor} from 'nuclide-atom-helpers';
import {getLogger} from 'nuclide-logging';
import {getOpenFileEditorForRemoteProject} from './utils';
import featureConfig from 'nuclide-feature-config';
import invariant from 'assert';
import {CompositeDisposable} from 'atom';
import {RemoteConnection} from 'nuclide-remote-connection';

const logger = getLogger();

/**
 * Stores the host and cwd of a remote connection.
 */
type SerializableRemoteConnectionConfiguration = {
  host: string;
  cwd: string;
}

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
  };
}

async function createRemoteConnection(
  remoteProjectConfig: SerializableRemoteConnectionConfiguration,
): Promise<?RemoteConnection> {

  const connection = await RemoteConnection.createConnectionBySavedConfig(
    remoteProjectConfig.host,
    remoteProjectConfig.cwd,
  );

  if (connection) {
    return connection;
  }

  // If connection fails using saved config, open connect dialog.
  const {openConnectionDialog} = require('nuclide-ssh-dialog');
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
    if (RemoteConnection.getByHostname(hostname).length > 1) {
      logger.info('Remaining remote projects using Nuclide Server - no prompt to shutdown');
      connection.close();
      return;
    }

    const buttons = ['Keep It', 'Shutdown'];
    const buttonToActions = new Map();

    buttonToActions.set(buttons[0], () => connection.close());
    buttonToActions.set(buttons[1], async () => {
      await connection.getService('InfoService').shutdownServer();
      connection.close();
      return;
    });

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
  const {RemoteDirectory} = require('nuclide-remote-connection');
  const {isRemote} = require('nuclide-remote-uri');
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
  connection: RemoteConnection,
  uri: string,
): Promise<TextEditor> {
  const existingEditor = atom.workspace.getTextEditors().filter(textEditor => {
    return textEditor.getPath() === uri;
  })[0];
  let buffer = null;
  if (existingEditor) {
    buffer = existingEditor.getBuffer();
  } else {
    const NuclideTextBuffer = require('./NuclideTextBuffer');
    buffer = new NuclideTextBuffer(connection, {filePath: uri});
    buffer.setEncoding(global.atom.config.get('core.fileEncoding'));
    try {
      /* $FlowFixMe Private Atom API */
      await buffer.load();
    } catch (err) {
      logger.warn('buffer load issue:', err);
      throw err;
    }
  }

  const textEditorParams = {buffer};
  return createTextEditor(textEditorParams);
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

module.exports = {

  // $FlowIssue https://github.com/facebook/flow/issues/620
  config: require('../package.json').nuclide.config,

  activate(state: ?{remoteProjectsConfig: SerializableRemoteConnectionConfiguration[]}): void {
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

        // Here, a unique uri is picked to the pending open pane item to maintain the pane layout.
        // Otherwise, the open won't be completed because there exists a pane item with the same
        // uri.
        /* $FlowFixMe */
        editor.getBuffer().file.path = `${uri}.to-close`;
        // Cleanup the old pane item on successful opening or when no connection could be
        // established.
        const cleanupBuffer = () => pane.removeItem(editor);
        if (filePath === config.cwd) {
          cleanupBuffer();
        } else {
          // If we clean up the buffer before the `openUriInPane` finishes,
          // the pane will be closed, because it could have no other items.
          // So we must clean up after.
          /* $FlowFixMe Calling Atom private API. */
          atom.workspace.openURIInPane(uri, pane).then(cleanupBuffer, cleanupBuffer);
        }
      }
    }));

    subscriptions.add(atom.commands.add(
        'atom-workspace',
        'nuclide-remote-projects:connect',
          /* $FlowIssue. */
        () => require('nuclide-ssh-dialog').openConnectionDialog()
    ));

    // Subscribe opener before restoring the remote projects.
    subscriptions.add(atom.workspace.addOpener((uri = '') => {
      if (uri.startsWith('nuclide:')) {
        const connection = RemoteConnection.getForUri(uri);
        // On Atom restart, it tries to open the uri path as a file tab because it's not a local
        // directory. We can't let that create a file with the initial working directory path.
        if (connection && uri !== connection.getUriForInitialWorkingDirectory()) {
          if (pendingFiles[uri]) {
            return pendingFiles[uri];
          }
          const textEditorPromise = pendingFiles[uri] = createEditorForNuclide(connection, uri);
          const removeFromCache = () => delete pendingFiles[uri];
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
    const remoteProjectsConfigAsDeserializedJson: SerializableRemoteConnectionConfiguration[] =
      (state && state.remoteProjectsConfig) || [];
    remoteProjectsConfigAsDeserializedJson.forEach(async config => {
      const connection = await createRemoteConnection(config);
      if (!connection) {
        logger.info(
          'No RemoteConnection returned on restore state trial:',
          config.host,
          config.cwd,
        );
      }
    });
    // Clear obsolete config.
    // $UPFixMe: These settings should go through nuclide-feature-config
    atom.config.set('nuclide.remoteProjectsConfig', []);

    packageSubscriptions = subscriptions;
  },

  consumeStatusBar(statusBar: atom$StatusBar): void {
    if (controller) {
      controller.consumeStatusBar(statusBar);
    }
  },

  // TODO: All of the elements of the array are non-null, but it does not seem possible to convince
  // Flow of that.
  serialize(): {remoteProjectsConfig: Array<?SerializableRemoteConnectionConfiguration>} {
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
  },

  deactivate(): void {
    if (packageSubscriptions) {
      packageSubscriptions.dispose();
      packageSubscriptions = null;
    }

    if (controller != null) {
      controller.destroy();
      controller = null;
    }
  },

  createRemoteDirectoryProvider(): RemoteDirectoryProviderT {
    const RemoteDirectoryProvider = require('./RemoteDirectoryProvider');
    return new RemoteDirectoryProvider();
  },

  createRemoteDirectorySearcher(): RemoteDirectorySearcherT {
    const {getServiceByNuclideUri} = require('nuclide-client');
    const {RemoteDirectory} = require('nuclide-remote-connection');
    const RemoteDirectorySearcher = require('./RemoteDirectorySearcher');
    return new RemoteDirectorySearcher((dir: RemoteDirectory) =>
      getServiceByNuclideUri('FindInProjectService', dir.getPath()));
  },

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
  },

};
