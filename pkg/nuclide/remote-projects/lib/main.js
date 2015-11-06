'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type RemoteProjectsController from './RemoteProjectsController';
import type {HomeFragments} from 'nuclide-home-interfaces';
import type {RemoteConnectionConfiguration} from 'nuclide-remote-connection/lib/RemoteConnection';

import {createTextEditor} from 'nuclide-atom-helpers';
import {getOpenFileEditorForRemoteProject} from './utils';
import {CompositeDisposable} from 'atom';

/**
 * Stores the host and cwd of a remote connection.
 */
type SerializableRemoteConnectionConfiguration = {
  host: string;
  cwd: string;
}

var packageSubscriptions: ?CompositeDisposable = null;
var controller: ?RemoteProjectsController = null;

const CLOSE_PROJECT_DELAY_MS = 100;
const pendingFiles = {};

var logger = null;
function getLogger() {
  return logger || (logger = require('nuclide-logging').getLogger());
}

var RemoteConnection = null;
function getRemoteConnection() {
  return RemoteConnection ||
    (RemoteConnection = require('nuclide-remote-connection').RemoteConnection);
}

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
  var RemoteConnection = getRemoteConnection();

  const connection = await RemoteConnection.createConnectionBySavedConfig(
    remoteProjectConfig.host,
    remoteProjectConfig.cwd,
  );

  if (connection) {
    return connection;
  }

  // If connection fails using saved config, open connect dialog.
  var {openConnectionDialog} = require('nuclide-ssh-dialog');
  return openConnectionDialog({
    initialServer: remoteProjectConfig.host,
    initialCwd: remoteProjectConfig.cwd,
  });
}

function addRemoteFolderToProject(connection: RemoteConnection) {
  var workingDirectoryUri = connection.getUriForInitialWorkingDirectory();
  // If restoring state, then the project already exists with local directory and wrong repo
  // instances. Hence, we remove it here, if existing, and add the new path for which we added a
  // workspace opener handler.
  atom.project.removePath(workingDirectoryUri);

  atom.project.addPath(workingDirectoryUri);

  var subscription = atom.project.onDidChangePaths(() => {
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
    if (getRemoteConnection().getByHostname(hostname).length > 1) {
      getLogger().info('Remaining remote projects using Nuclide Server - no prompt to shutdown');
      return connection.close();
    }

    const buttons = ['Keep It', 'Shutdown'];
    const buttonToActions = new Map();

    buttonToActions.set(buttons[0], () => connection.close());
    buttonToActions.set(buttons[1], () => {
      connection.getClient().shutdownServer();
      return connection.close();
    });

    if (atom.config.get(
      'nuclide-remote-projects.shutdownServerAfterDisconnection',
    )) {
      // Atom takes the first button in the list as default option.
      buttons.reverse();
    }

    var choice = atom.confirm({
      message: 'No more remote projects on the host: \'' + hostname +
        '\'. Would you like to shutdown Nuclide server there?',
      buttons,
    });

    return buttonToActions.get(buttons[choice])();
  }
}

function closeOpenFilesForRemoteProject(remoteProjectConfig: RemoteConnectionConfiguration): void {
  var openInstances = getOpenFileEditorForRemoteProject(remoteProjectConfig);
  for (const openInstance of openInstances) {
    const {editor, pane} = openInstance;
    pane.removeItem(editor);
  }
}

/**
 * Restore a nuclide project state from a serialized state of the remote connection config.
 */
async function restoreNuclideProjectState(
  remoteProjectConfig: SerializableRemoteConnectionConfiguration,
) {
  // try to re-connect, then, add the project to atom.project and the tree.
  const connection = await createRemoteConnection(remoteProjectConfig);
  if (!connection) {
    getLogger().info(
      'No RemoteConnection returned on restore state trial:',
      remoteProjectConfig.host,
      remoteProjectConfig.cwd,
    );
  }

  // On Atom restart, it tries to open uri paths as local `TextEditor` pane items.
  // Here, Nuclide reloads the remote project files that have empty text editors open.
  var openInstances = getOpenFileEditorForRemoteProject(connection.getConfig());
  for (const openInstance of openInstances) {
    // Keep the original open editor item with a unique name until the remote buffer is loaded,
    // Then, we are ready to replace it with the remote tab in the same pane.
    const {pane, editor, uri, filePath} = openInstance;
    // Here, a unique uri is picked to the pending open pane item to maintain the pane layout.
    // Otherwise, the open won't be completed because there exists a pane item with the same uri.
    editor.getBuffer().file.path = `${uri}.to-close`;
    // Cleanup the old pane item on successful opening or when no connection could be established.
    const cleanupBuffer = () => pane.removeItem(editor);
    if (!connection || filePath === remoteProjectConfig.cwd) {
      cleanupBuffer();
    } else {
      // If we clean up the buffer before the `openUriInPane` finishes,
      // the pane will be closed, because it could have no other items.
      // So we must clean up after.
      atom.workspace.openURIInPane(uri, pane).then(cleanupBuffer, cleanupBuffer);
    }
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
    buffer.setEncoding(atom.config.get('core.fileEncoding'));
    try {
      await buffer.load();
    } catch(err) {
      getLogger().warn('buffer load issue:', err);
      throw err;
    }
  }

  let textEditorParams = {buffer};
  return createTextEditor(textEditorParams);
}

module.exports = {

  config: {
    shutdownServerAfterDisconnection: {
      type: 'boolean',
      description: 'Shutdown nuclide server after all remote projects are disconnected',
      default: true,
    },
  },

  activate(state: ?{remoteProjectsConfig: SerializableRemoteConnectionConfiguration[]}): void {
    let subscriptions = new CompositeDisposable();

    var RemoteProjectsController = require('./RemoteProjectsController');
    controller = new RemoteProjectsController();

    subscriptions.add(getRemoteConnection().onDidAddRemoteConnection(connection => {
      addRemoteFolderToProject(connection);
    }));

    subscriptions.add(atom.commands.add(
        'atom-workspace',
        'nuclide-remote-projects:connect',
        () => require('nuclide-ssh-dialog').openConnectionDialog()
    ));

    // Subscribe opener before restoring the remote projects.
    subscriptions.add(atom.workspace.addOpener((uri = '') => {
      if (uri.startsWith('nuclide:')) {
        var connection = getRemoteConnection().getForUri(uri);
        // On Atom restart, it tries to open the uri path as a file tab because it's not a local
        // directory. We can't let that create a file with the initial working directory path.
        if (connection && uri !== connection.getUriForInitialWorkingDirectory()) {
          if (pendingFiles[uri]) {
            return pendingFiles[uri];
          }
          var textEditorPromise = pendingFiles[uri] = createEditorForNuclide(connection, uri);
          var removeFromCache = () => delete pendingFiles[uri];
          textEditorPromise.then(removeFromCache, removeFromCache);
          return textEditorPromise;
        }
      }
    }));

    // Don't do require or any other expensive operations in activate().
    subscriptions.add(atom.packages.onDidActivateInitialPackages(() => {
      // RemoteDirectoryProvider will be called before this.
      // If RemoteDirectoryProvider failed to provide a RemoteDirectory for a
      // given URI, Atom will create a generic Directory to wrap that. We want
      // to delete these instead, because those directories aren't valid/useful
      // if they are not true RemoteDirectory objects (connected to a real
      // real remote folder).
      deleteDummyRemoteRootDirectories();

      // Remove remote projects added in case of reloads.
      // We already have their connection config stored.
      let remoteProjectsConfigAsDeserializedJson: SerializableRemoteConnectionConfiguration[] =
        (state && state.remoteProjectsConfig) || [];
      remoteProjectsConfigAsDeserializedJson.forEach(restoreNuclideProjectState);
      // Clear obsolete config.
      atom.config.set('nuclide.remoteProjectsConfig', []);
    }));

    packageSubscriptions = subscriptions;
  },

  consumeStatusBar(statusBar: Element): void {
    if (controller) {
      controller.consumeStatusBar(statusBar);
    }
  },

  // TODO: All of the elements of the array are non-null, but it does not seem possible to convince
  // Flow of that.
  serialize(): {remoteProjectsConfig: Array<?SerializableRemoteConnectionConfiguration>} {
    let remoteProjectsConfig: Array<?SerializableRemoteConnectionConfiguration> =
      getRemoteRootDirectories()
        .map((directory: atom$Directory): ?SerializableRemoteConnectionConfiguration => {
          let connection = getRemoteConnection().getForUri(directory.getPath());
          return connection ?
            createSerializableRemoteConnectionConfiguration(connection.getConfig()) : null;
        })
        .filter((config: ?SerializableRemoteConnectionConfiguration) => config != null);
    return {
      remoteProjectsConfig,
    };
  },

  deactivate(): void {
    // This should always be true here, but we do this to appease Flow.
    if (packageSubscriptions) {
      packageSubscriptions.dispose();
      packageSubscriptions = null;
    }
  },

  createRemoteDirectoryProvider(): RemoteDirectoryProvider {
    var RemoteDirectoryProvider = require('./RemoteDirectoryProvider');
    return new RemoteDirectoryProvider();
  },

  createRemoteDirectorySearcher(): RemoteDirectorySearcher {
    var {getServiceByNuclideUri} = require('nuclide-client');
    var {RemoteDirectory} = require('nuclide-remote-connection');
    var RemoteDirectorySearcher = require('./RemoteDirectorySearcher');
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
