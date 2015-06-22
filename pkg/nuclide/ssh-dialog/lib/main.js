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
var defaultConfig: ?any = null;

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
      initialAuthMethod: rememberedDialogSettings.authMethod,
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

function getDefaultConfig(): any {
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

module.exports = {openConnectionDialog};
