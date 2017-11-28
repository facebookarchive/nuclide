/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import type {
  SshTunnelService,
  Tunnel,
} from '../../nuclide-ssh-tunnel/lib/types';
import type {TunnelBehavior} from './types';

import nuclideUri from 'nuclide-commons/nuclideUri';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';

export type TunnelResult = {
  wasNeeded: boolean,
  // Present if a tunnel was opened.
  closeTunnel?: UniversalDisposable,
};

export async function openTunnel(
  serviceUri: NuclideUri,
  behavior: TunnelBehavior,
): Promise<TunnelResult> {
  if (!nuclideUri.isRemote(serviceUri) || behavior === 'do_not_open_tunnel') {
    return {wasNeeded: false};
  }
  const tunnelService: ?SshTunnelService = await consumeFirstProvider(
    'nuclide.ssh-tunnel',
  );
  if (tunnelService == null) {
    throw new Error(
      'No package to open a tunnel to the remote host available.',
    );
  }
  const desired = {
    description: 'Metro',
    from: {
      host: 'localhost',
      port: 8081,
    },
    to: {host: nuclideUri.getHostname(serviceUri), port: 8081},
  };
  for (const tunnel of tunnelService.getOpenTunnels()) {
    const {from, to} = tunnel;
    if (from.port === desired.from.port && from.host === desired.from.host) {
      if (to.host !== desired.to.host) {
        throw new Error(
          'You have a tunnel open from `localhost:8081` to a different host than your ' +
            'Current Working Root. Close the tunnel in the SSH tunnels panel and try again.',
        );
      }
      return {wasNeeded: false};
    }
  }
  if (behavior === 'ask_about_tunnel') {
    return _askToRequestTunnel(tunnelService, desired);
  } else {
    const closeTunnel = await _requestTunnelFromService(tunnelService, desired);
    return {wasNeeded: true, closeTunnel};
  }
}

function _askToRequestTunnel(
  service: SshTunnelService,
  tunnel: Tunnel,
): Promise<TunnelResult> {
  return new Promise(resolve => {
    let result;
    const notification = atom.notifications.addSuccess(
      'Open tunnel?\n\nOpen a new tunnel so Metro becomes available at `localhost:8081`?',
      {
        icon: 'milestone',
        dismissable: true,
        buttons: [
          {
            text: 'Open tunnel',
            onDidClick: async () => {
              const closeTunnel = await _requestTunnelFromService(
                service,
                tunnel,
              );
              result = {wasNeeded: true, closeTunnel};
              notification.dismiss();
            },
          },
          {
            text: 'Dismiss',
            onDidClick: () => notification.dismiss(),
          },
        ],
      },
    );
    notification.onDidDismiss(() => {
      if (result === undefined) {
        result = {wasNeeded: false};
      }
      resolve(result);
    });
  });
}

function _requestTunnelFromService(
  service: SshTunnelService,
  tunnel: Tunnel,
): Promise<UniversalDisposable> {
  return new Promise((resolve, reject) => {
    const disposable = service.openTunnel(
      tunnel,
      error => {
        if (error == null) {
          resolve(disposable);
        } else {
          reject(error);
        }
      },
      () => {},
    );
  });
}
