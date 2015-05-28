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
var {RemoteConnection} = require('nuclide-remote-connection');
var subscriptions: ?CompositeDisposable = null;
var logger = null;

function getLogger() {
  return logger  || (logger = require('nuclide-logging').getLogger());
}

async function createRemoteConnection(remoteProjectConfig: RemoteConnectionConfiguration): Promise<?RemoteConnection> {
  var connection = new RemoteConnection(remoteProjectConfig);
  try {
    // TODO: better RemoteConnection API.
    await connection.verifyServer();
    await connection.addToProject();
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
  atom.workspace.getTextEditors().forEach((editor) => {
    var rawUrl = editor.getURI();
    if (!rawUrl) {
      return;
    }
    var uri = sanitizeNuclideUri(rawUrl);
    var {hostname: fileHostname, path: filePath} = require('nuclide-remote-uri').parse(uri);
    if (fileHostname === projectHostname && filePath.startsWith(projectDirectory)) {
      closeTabForBuffer(editor.getBuffer());
      if (connection) {
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

  activate(state: ?mixed): void {
    subscriptions = new CompositeDisposable();
    // Don't do require or any other expensive operations in activate().
    subscriptions.add(atom.packages.onDidActivateInitialPackages(() =>{
      // Subscribe opener before restoring the remote projects.
      subscriptions.add(atom.workspace.addOpener((uri = '') => {
        if (uri.startsWith('nuclide:')) {
          var connection = RemoteConnection.getForUri(uri);
          if (connection) {
            return createEditorForNuclide(connection, uri);
          }
        }
      }));

      // Remove remote projects added in case of reloads.
      // We already have their connection config stored.
      cleanupRemoteNuclideProjects();
      var remoteProjectsConfig = atom.config.get('nuclide.remoteProjectsConfig') || [];
      remoteProjectsConfig.forEach(restoreNuclideProjectState);

      subscriptions.add(atom.project.onDidChangePaths((paths) => {
        var remoteProjectsConfig = getRemoteRootDirectories()
            .map(directory => RemoteConnection.getForUri(directory.getPath()).getConfig());
        atom.config.set('nuclide.remoteProjectsConfig', remoteProjectsConfig);
      }));
    }));
  },

  deactivate(): void {
    // Remove the remote project roots from the project to not include it in Atom's state-saving hash calculation.
    cleanupRemoteNuclideProjects();
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
