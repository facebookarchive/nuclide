'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var url = require('url');
var path = require('path');
var {CompositeDisposable, Disposable} = require('atom');
var subscriptions: ?CompositeDisposable = null;
var defaultConfig: ?mixed = null;

var dialogPromiseQueue: ?PromiseQueue = null;

function openConnectionDialog(props): Promise<?RemoteConnection> {
  var {extend, PromiseQueue} = require('nuclide-commons');
  if (!dialogPromiseQueue) {
    dialogPromiseQueue = new PromiseQueue();
  }

  return dialogPromiseQueue.submit((resolve, reject) => {
    var workspaceEl = atom.views.getView(atom.workspace);
    var hostEl = document.createElement('div');
    workspaceEl.appendChild(hostEl);

    var ConnectionDialog = require('./ConnectionDialog');

    var defaultConnectionSettings = getDefaultConfig().getConnectionDialogDefaultSettings();

    function saveConfig(config: SshConnectionConfiguration) {
      atom.config.set('nuclide.lastConnectionDetails', {
        config,
        // Save last official command to detect upgrade.
        lastOfficialRemoteServerCommand: defaultConnectionSettings.remoteServerCommand,
      });
    }

    var lastConnectionDetails = atom.config.get('nuclide.lastConnectionDetails') || {};
    var lastConfig = lastConnectionDetails.config || {};
    var remoteServerCommand = defaultConnectionSettings.remoteServerCommand;
    // If there has not been any upgrade and there is a persisted remote server command, use it.
    if (lastConnectionDetails.lastOfficialRemoteServerCommand === defaultConnectionSettings.remoteServerCommand
        && lastConfig.remoteServerCommand) {
        remoteServerCommand = lastConfig.remoteServerCommand;
    }
    var rememberedDialogSettings = extend.immutableExtend(defaultConnectionSettings, lastConfig);

    var dialogProps = extend.immutableExtend({
      initialUsername: rememberedDialogSettings.username,
      initialServer: rememberedDialogSettings.host,
      initialRemoteServerCommand: remoteServerCommand,
      initialCwd: rememberedDialogSettings.cwd,
      initialSshPort: String(rememberedDialogSettings.sshPort),
      initialPathToPrivateKey: rememberedDialogSettings.pathToPrivateKey,
      initialUseSshAgent: rememberedDialogSettings.useSshAgent,
      onConnect: async (connection, config) => {
        resolve(connection);
        saveConfig(config);
      },
      onError: (err, config) => {
        resolve(/*connection*/ null);
        saveConfig(config);
      },
      onCancel: () => resolve(/*connection*/ null),
    }, props);
    var React = require('react-for-atom');
    React.render(<ConnectionDialog {...dialogProps} />, hostEl);
  });
}

function getDefaultConfig(): mixed {
  if (defaultConfig) {
    return defaultConfig;
  }
  try {
    defaultConfig = require('./fb/config');
  } catch (e) {
    defaultConfig = require('./config');
  }
  return defaultConfig;
}

module.exports = {
  activate(state: ?mixed): void {
    subscriptions = new CompositeDisposable();
    // If this package was activated by an nuclide-ssh-dialog:connect event,
    // the listener registered here will fire after this method finishes.
    subscriptions.add(atom.commands.add(
        'atom-workspace',
        'nuclide-ssh-dialog:connect',
        openConnectionDialog
    ));
  },

  openConnectionDialog,

  deactivate(): void {
    // This should always be true here, but we do this to appease Flow.
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
  },
};
