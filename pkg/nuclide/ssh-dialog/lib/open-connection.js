'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  getDefaultConnectionProfile,
  getOfficialRemoteServerCommand,
  saveConnectionConfig,
} from './connection-profile-utils';

import type {RemoteConnection} from 'nuclide-remote-connection';
import type {NuclideRemoteConnectionProfile} from './connection-types';

let dialogPromiseQueue: ?PromiseQueue = null;

/**
 * Opens the remote connection dialog flow, which includes asking the user
 * for connection parameters (e.g. username, server name, etc), and optionally
 * asking for additional (e.g. 2-fac) authentication.
 */
export function openConnectionDialog(props): Promise<?RemoteConnection> {
  const {extend, PromiseQueue} = require('nuclide-commons');
  if (!dialogPromiseQueue) {
    dialogPromiseQueue = new PromiseQueue();
  }

  return dialogPromiseQueue.submit((resolve, reject) => {
    const defaultConnectionProfile: NuclideRemoteConnectionProfile = getDefaultConnectionProfile();

    const dialogProps = extend.immutableExtend({
      connectionProfiles: [defaultConnectionProfile],
      // Select the default connection profile, which should always be index 0.
      indexOfInitiallySelectedConnectionProfile: 0,
      // TODO jessicalin This will be filled in and used later in this stack.
      onAddProfileClicked: () => {},
      // TODO jessicalin This will be filled in and used later in this stack.
      onDeleteProfileClicked: () => {},
      onConnect: async (connection, config) => {
        resolve(connection);
        saveConnectionConfig(config, getOfficialRemoteServerCommand());
      },
      onError: (err, config) => {
        resolve(/*connection*/ null);
        saveConnectionConfig(config, getOfficialRemoteServerCommand());
      },
      onCancel: () => resolve(/*connection*/ null),
    }, props);

    const React = require('react-for-atom');
    const ConnectionDialog = require('./ConnectionDialog');

    const workspaceEl = atom.views.getView(atom.workspace);
    const hostEl = document.createElement('div');
    workspaceEl.appendChild(hostEl);

    dialogProps.onClosed = () => {
      // Unmount the ConnectionDialog and clean up the host element.
      if (hostEl) {
        React.unmountComponentAtNode(hostEl);
        if (hostEl.parentNode) {
          hostEl.parentNode.removeChild(hostEl);
        }
      }
    };

    React.render(<ConnectionDialog {...dialogProps} />, hostEl);
  });
}
