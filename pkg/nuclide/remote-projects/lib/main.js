'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable, TextEditor} = require('atom');
var subscriptions: ?CompositeDisposable = null;

var logger = null;
function getLogger() {
  return logger || (logger = require('nuclide-logging').getLogger());
}

var RemoteConnection: ?RemoteConnection = null;
function getRemoteConnection(): RemoteConnection {
  return RemoteConnection || (RemoteConnection = require('nuclide-remote-connection').RemoteConnection);
}

async function createRemoteConnection(remoteProjectConfig: RemoteConnectionConfiguration): Promise<?RemoteConnection> {
  var RemoteConnection = getRemoteConnection();
  var connection = new RemoteConnection(remoteProjectConfig);
  try {
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

/**
 * Restore a nuclide project state from a serialized state of the remote connection config.
 */
async function restoreNuclideProjectState(remoteProjectConfig: RemoteConnectionConfiguration) {
  var {closeTabForBuffer} = require('nuclide-atom-helpers');
  var {sanitizeNuclideUri} = require('./utils');

  // TODO use the rest of the config for the connection dialog.
  var {host: projectHostname, cwd: projectDirectory} = remoteProjectConfig;
  // try to re-connect, then, add the project to atom.project and the tree.
  var connection = await createRemoteConnection(remoteProjectConfig);
  if (!connection) {
    getLogger().info('No RemoteConnection returned on restore state trial:', projectHostname, projectDirectory);
  }
  // Reload the project files that have empty text editors/buffers open.
  atom.workspace.getTextEditors().forEach(editor => {
    var rawUrl = editor.getURI();
    if (!rawUrl) {
      return;
    }
    var uri = sanitizeNuclideUri(rawUrl);
    var {hostname: fileHostname, path: filePath} = require('nuclide-remote-uri').parse(uri);
    if (fileHostname === projectHostname && filePath.startsWith(projectDirectory)) {
      closeTabForBuffer(editor.getBuffer());
      // On Atom restart, it tries to open the uri path as a file tab because it's not a local directory.
      // Hence, we close it in the cleanup, because we have the needed connection config saved
      // with the last opened files in the package state.
      if (connection && filePath !== projectDirectory) {
        atom.workspace.open(uri);
      }
    }
  });
}

function cleanupRemoteNuclideProjects() {
  getRemoteRootDirectories().forEach(directory => atom.project.removePath(directory.getPath()));
}

function getRemoteRootDirectories() {
  return atom.project.getDirectories().filter(directory => directory.getPath().startsWith('nuclide:'));
}

async function createEditorForNuclide(connection: RemoteConnection, uri: string): Promise<TextEditor> {
  var NuclideTextBuffer = require('./NuclideTextBuffer');
  var buffer = new NuclideTextBuffer(connection, {filePath: uri});
  buffer.setEncoding(atom.config.get('core.fileEncoding'));
  try {
    await buffer.load();
  } catch (err) {
    getLogger().warn('buffer load issue:', err);
    throw err;
  }
  return new TextEditor(/*editorOptions*/ {buffer, registerEditor: true});
}

module.exports = {

  activate(state: ?any): void {
    subscriptions = new CompositeDisposable();
    // Don't do require or any other expensive operations in activate().
    subscriptions.add(atom.packages.onDidActivateInitialPackages(() =>{
      // Subscribe opener before restoring the remote projects.
      subscriptions.add(atom.workspace.addOpener((uri = '') => {
        if (uri.startsWith('nuclide:')) {
          var connection = getRemoteConnection().getForUri(uri);
          // On Atom restart, it tries to open the uri path as a file tab because it's not a local directory.
          // We can't let that create a file with the initial working directory path.
          if (connection && uri !== connection.getUriForInitialWorkingDirectory()) {
            return createEditorForNuclide(connection, uri);
          }
        }
      }));

      // Remove remote projects added in case of reloads.
      // We already have their connection config stored.
      cleanupRemoteNuclideProjects();
      var remoteProjectsConfig = (state && state.remoteProjectsConfig) || [];
      remoteProjectsConfig.forEach(restoreNuclideProjectState);
    }));
  },

  serialize(): ?any {
    var remoteProjectsConfig = getRemoteRootDirectories()
        .map(directory => {
          var connection = getRemoteConnection().getForUri(directory.getPath());
          return connection && connection.getConfig();
        }).filter(config => !!config);
    return {
      remoteProjectsConfig,
    };
  },

  deactivate(): void {
    // This should always be true here, but we do this to appease Flow.
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
  },

  createRemoteDirectoryProvider(): RemoteDirectoryProvider {
    var RemoteDirectoryProvider = require('./RemoteDirectoryProvider');
    return new RemoteDirectoryProvider();
  },
};
