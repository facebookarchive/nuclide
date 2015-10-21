'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RemoteConnection} from 'nuclide-remote-connection';
import type {NuclideSavedConnectionDialogConfig} from './connection-types';

var dialogPromiseQueue: ?PromiseQueue = null;

/**
 * Opens the remote connection dialog flow, which includes asking the user
 * for connection parameters (e.g. username, server name, etc), and optionally
 * asking for additional (e.g. 2-fac) authentication.
 */
export function openConnectionDialog(props): Promise<?RemoteConnection> {
  var {extend, PromiseQueue} = require('nuclide-commons');
  if (!dialogPromiseQueue) {
    dialogPromiseQueue = new PromiseQueue();
  }

  return dialogPromiseQueue.submit((resolve, reject) => {
    // Prefill the dialog by combining the user's last inputs to this dialog
    // with the default settings.
    var defaultConnectionSettings = getDefaultConfig();
    const currentOfficialRSC = defaultConnectionSettings.remoteServerCommand;

    var lastConnectionDetails = getSavedConnectionConfig() || {};
    var lastConfig = lastConnectionDetails.config || {};

    // Only use the user's last saved remote server command if there has been no
    // change (upgrade) in the official remote server command.
    var remoteServerCommand = currentOfficialRSC;
    if (lastConnectionDetails.lastOfficialRemoteServerCommand === currentOfficialRSC
        && lastConfig.remoteServerCommand) {
      remoteServerCommand = lastConfig.remoteServerCommand;
    }
    var dialogSettings = {...defaultConnectionSettings, ...lastConfig};

    var dialogProps = extend.immutableExtend({
      initialUsername: dialogSettings.username,
      initialServer: dialogSettings.server,
      initialRemoteServerCommand: remoteServerCommand,
      initialCwd: dialogSettings.cwd,
      initialSshPort: String(dialogSettings.sshPort),
      initialPathToPrivateKey: dialogSettings.pathToPrivateKey,
      initialAuthMethod: dialogSettings.authMethod,
      onConnect: async (connection, config) => {
        resolve(connection);
        saveConnectionConfig(config, currentOfficialRSC);
      },
      onError: (err, config) => {
        resolve(/*connection*/ null);
        saveConnectionConfig(config, currentOfficialRSC);
      },
      onCancel: () => resolve(/*connection*/ null),
    }, props);

    var React = require('react-for-atom');
    var ConnectionDialog = require('./ConnectionDialog');

    var workspaceEl = atom.views.getView(atom.workspace);
    var hostEl = document.createElement('div');
    workspaceEl.appendChild(hostEl);

    React.render(<ConnectionDialog {...dialogProps} />, hostEl);
  });
}

/**
 * Gets the NuclideSavedConnectionDialogConfig representing the user's last
 * connection.
 */
function getSavedConnectionConfig(): ?NuclideSavedConnectionDialogConfig {
  var savedConfig = atom.config.get('nuclide.lastConnectionDetails');
  (savedConfig : ?NuclideSavedConnectionDialogConfig);
  return savedConfig;
}

/**
 * Saves a connection configuration along with the last official server command.
 */
function saveConnectionConfig(
  config: SshConnectionConfiguration,
  lastOfficialRemoteServerCommand: string
): void {
  // Don't store user's password.
  config = {...config, password: ''};
  atom.config.set('nuclide.lastConnectionDetails', {
    config,
    // Save last official command to detect upgrade.
    lastOfficialRemoteServerCommand,
  });
}

var defaultConfig: ?any = null;
/**
 * This fetches the 'default' connection configuration supplied to the user
 * regardless of any connection profiles they might have saved.
 */
function getDefaultConfig(): any {
  if (defaultConfig) {
    return defaultConfig;
  }
  var defaultConfigGetter;
  try {
    defaultConfigGetter = require('./fb/config');
  } catch (e) {
    defaultConfigGetter = require('./config');
  }
  defaultConfig = defaultConfigGetter.getConnectionDialogDefaultSettings();
  return defaultConfig;
}
