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

import invariant from 'assert';

/**
 * Version of RemoteConnectionConfiguration that uses string instead of Buffer for fields so it can
 * be translated directly to/from JSON.
 */
type SerializableRemoteConnectionConfiguration = {
  host: string;
  port: number;
  cwd: string;
  certificateAuthorityCertificate?: string;
  clientCertificate?: string;
  clientKey?: string;
}

var {CompositeDisposable, TextEditor} = require('atom');

var packageSubscriptions: ?CompositeDisposable = null;
var controller: ?RemoteProjectsController = null;
var CLOSE_PROJECT_DELAY_MS = 100;

var pendingFiles = {};

var logger = null;
function getLogger() {
  return logger || (logger = require('nuclide-logging').getLogger());
}

var RemoteConnection = null;
function getRemoteConnection() {
  return RemoteConnection ||
    (RemoteConnection = require('nuclide-remote-connection').RemoteConnection);
}

async function createRemoteConnection(
  remoteProjectConfig: SerializableRemoteConnectionConfiguration,
): Promise<?RemoteConnection> {
  var RemoteConnection = getRemoteConnection();

  try {
    var connection = new RemoteConnection(restoreClientKey(remoteProjectConfig));
    await connection.initialize();
    return connection;
  } catch (e) {
    // If connection fails using saved config, open connect dialog.
    var {openConnectionDialog} = require('nuclide-ssh-dialog');
    return openConnectionDialog({
      initialServer: remoteProjectConfig.host,
      initialCwd: remoteProjectConfig.cwd,
    });
  }
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

    var choice = atom.confirm({
      message: 'No more remote projects on the host: \'' + hostname +
        '\'. Would you like to shutdown Nuclide server there?',
      buttons: ['Shutdown', 'Keep It'],
    });
    if (choice === 1) {
      return connection.close();
    }
    if (choice === 0) {
      connection.getClient().shutdownServer();
      return connection.close();
    }
  }
}

function closeOpenFilesForRemoteProject(
  remoteProjectConfig: {host: string, cwd: string},
): Array<string> {
  var {closeTabForBuffer} = require('nuclide-atom-helpers');
  var {sanitizeNuclideUri} = require('./utils');

  var {host: projectHostname, cwd: projectDirectory} = remoteProjectConfig;
  var closedUris = [];
  atom.workspace.getTextEditors().forEach(editor => {
    var rawUrl = editor.getPath();
    if (!rawUrl) {
      return;
    }
    var uri = sanitizeNuclideUri(rawUrl);
    var {hostname: fileHostname, path: filePath} = require('nuclide-remote-uri').parse(uri);
    if (fileHostname === projectHostname && filePath.startsWith(projectDirectory)) {
      closeTabForBuffer(editor.getBuffer());
      if (filePath !== projectDirectory) {
        closedUris.push(uri);
      }
    }
  });
  return closedUris;
}

/**
 * Restore a nuclide project state from a serialized state of the remote connection config.
 */
async function restoreNuclideProjectState(
  remoteProjectConfig: SerializableRemoteConnectionConfiguration,
) {
  // TODO use the rest of the config for the connection dialog.
  var {host: projectHostname, cwd: projectDirectory} = remoteProjectConfig;
  // try to re-connect, then, add the project to atom.project and the tree.
  var connection = await createRemoteConnection(remoteProjectConfig);
  if (!connection) {
    getLogger().info(
      'No RemoteConnection returned on restore state trial:',
      projectHostname,
      projectDirectory,
    );
  }
  // Reload the project files that have empty text editors/buffers open.
  var closedUris = closeOpenFilesForRemoteProject(remoteProjectConfig);
  // On Atom restart, it tries to open the uri path as a file tab because it's not a local
  // directory. Hence, we close it in the cleanup, because we have the needed connection config
  // saved with the last opened files in the package state.
  if (connection) {
    closedUris.forEach(uri => atom.workspace.open(uri));
  }
}

function getRemoteRootDirectories(): Array<atom$Directory> {
  // TODO: Use nuclide-remote-uri instead.
  return atom.project.getDirectories().filter(
    directory => directory.getPath().startsWith('nuclide:'));
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
  return new TextEditor(/*editorOptions*/ {buffer, registerEditor: true});
}

/**
 * Encrypts the clientKey of a RemoteConnectionConfiguration.
 * @param remoteProjectConfig - The config with the clientKey we want encrypted.
 * @return returns the passed in config with the clientKey encrypted.
 */
function protectClientKey(
  remoteProjectConfig: RemoteConnectionConfiguration,
): SerializableRemoteConnectionConfiguration {
  let {replacePassword} = require('nuclide-keytar-wrapper');
  let crypto = require('crypto');

  let sha1 = crypto.createHash('sha1');
  sha1.update(`${remoteProjectConfig.host}:${remoteProjectConfig.port}`);
  let sha1sum = sha1.digest('hex');

  let {certificateAuthorityCertificate, clientCertificate, clientKey} = remoteProjectConfig;
  invariant(clientKey);
  let realClientKey = clientKey.toString(); // Convert from Buffer to string.
  let {salt, password, encryptedString} = encryptString(realClientKey);
  replacePassword('nuclide.remoteProjectConfig', sha1sum, password);

  let clientKeyWithSalt = encryptedString + '.' + salt;

  invariant(certificateAuthorityCertificate);
  invariant(clientCertificate);
  let buffersAsStrings = {
    certificateAuthorityCertificate: certificateAuthorityCertificate.toString(),
    clientCertificate: clientCertificate.toString(),
    clientKey: clientKeyWithSalt,
  };

  return {...remoteProjectConfig, ...buffersAsStrings};
}

/**
 * Decrypts the clientKey of a SerializableRemoteConnectionConfiguration.
 * @param remoteProjectConfig - The config with the clientKey we want encrypted.
 * @return returns the passed in config with the clientKey encrypted.
 */
function restoreClientKey(
  remoteProjectConfig: SerializableRemoteConnectionConfiguration,
): RemoteConnectionConfiguration {
  var {getPassword} = require('nuclide-keytar-wrapper');
  var crypto = require('crypto');

  var sha1 = crypto.createHash('sha1');
  sha1.update(`${remoteProjectConfig.host}:${remoteProjectConfig.port}`);
  var sha1sum = sha1.digest('hex');

  var password = getPassword('nuclide.remoteProjectConfig', sha1sum);

  if (!password) {
    throw new Error('Cannot find password for encrypted client key');
  }

  let {certificateAuthorityCertificate, clientCertificate, clientKey} = remoteProjectConfig;
  invariant(clientKey);
  let [encryptedString, salt] = clientKey.split('.');

  if (!encryptedString || !salt) {
    throw new Error('Cannot decrypt client key');
  }

  let restoredClientKey = decryptString(encryptedString, password, salt);
  if (!restoredClientKey.startsWith('-----BEGIN RSA PRIVATE KEY-----')) {
    getLogger().error(
      `decrypted client key did not start with expected header: ${restoredClientKey}`);
  }

  invariant(certificateAuthorityCertificate);
  invariant(clientCertificate);
  let stringsAsBuffers = {
    certificateAuthorityCertificate: new Buffer(certificateAuthorityCertificate),
    clientCertificate: new Buffer(clientCertificate),
    clientKey: new Buffer(restoredClientKey),
  };

  return {...remoteProjectConfig, ...stringsAsBuffers};
}

function decryptString(text: string, password: string, salt: string): string {
  var crypto = require('crypto');

  var decipher = crypto.createDecipheriv(
      'aes-128-cbc',
      new Buffer(password, 'base64'),
      new Buffer(salt, 'base64'));

  var decryptedString = decipher.update(text, 'base64', 'utf8');
  decryptedString += decipher.final('utf8');

  return decryptedString;
}

function encryptString(text: string): {password: string, salt: string, encryptedString: string} {
  var crypto = require('crypto');
  // $FlowIssue
  var password = crypto.randomBytes(16).toString('base64');
  // $FlowIssue
  var salt = crypto.randomBytes(16).toString('base64');

  var cipher = crypto.createCipheriv(
    'aes-128-cbc',
    new Buffer(password, 'base64'),
    new Buffer(salt, 'base64'));

  var encryptedString = cipher.update(
    text,
    /* input_encoding */ 'utf8',
    /* output_encoding */ 'base64',
  );
  encryptedString += cipher.final('base64');

  return {
    password,
    salt,
    encryptedString,
  };
}

module.exports = {
  __test__: {
    decryptString,
    encryptString,
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

    // Don't do require or any other expensive operations in activate().
    subscriptions.add(atom.packages.onDidActivateInitialPackages(() => {
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
          return connection ? protectClientKey(connection.getConfig()) : null;
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
