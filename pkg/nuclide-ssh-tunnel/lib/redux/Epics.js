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

import type {ActionsObservable} from 'nuclide-commons/redux-observable';
import type {Action, Store} from '../types';

import * as Actions from './Actions';
import {Observable} from 'rxjs';
import invariant from 'assert';
import {getSocketServiceByNuclideUri} from '../../../nuclide-remote-connection/';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {fetchSitevarOnce} from '../../../commons-node/fb-sitevar';

export function openTunnelEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions
    .ofType(Actions.OPEN_TUNNEL)
    .switchMap(async action => {
      invariant(action.type === Actions.OPEN_TUNNEL);
      const {tunnel, onOpen, onClose} = action.payload;
      const allowedPorts: ?Array<number> = await getAllowedPorts();
      invariant(allowedPorts);

      if (!validateTunnel(tunnel, allowedPorts)) {
        onOpen(
          new Error('Invalid tunnel specification: ' + JSON.stringify(tunnel)),
        );
        return null;
      }

      const {from, to} = tunnel;
      const fromService = getSocketServiceByHost(from.host);
      const toService = getSocketServiceByHost(to.host);
      let clientCount = 0;

      const connectionFactory = await toService.getConnectionFactory();
      const tunnelDescriptor = {
        from: {
          host: from.host,
          port: from.port,
          family: from.family || 6,
        },
        to: {
          host: to.host,
          port: to.port,
          family: to.family || 6,
        },
      };

      const events = fromService.createTunnel(
        tunnelDescriptor,
        connectionFactory,
      );

      const subscription = events.refCount().subscribe({
        next: event => {
          if (event.type === 'server_started') {
            store.dispatch(Actions.setTunnelState(tunnel, 'ready'));
            onOpen();
          } else if (event.type === 'client_connected') {
            clientCount++;
            store.dispatch(Actions.setTunnelState(tunnel, 'active'));
          } else if (event.type === 'client_disconnected') {
            clientCount--;
            if (clientCount === 0) {
              store.dispatch(Actions.setTunnelState(tunnel, 'ready'));
            }
          }
        },
      });

      return Actions.addOpenTunnel(tunnel, error => {
        subscription.unsubscribe();
        onClose(error);
      });
    })
    .switchMap(action => {
      if (action == null) {
        return Observable.empty();
      } else {
        return Observable.of(action);
      }
    });
}

function getSocketServiceByHost(host) {
  if (host === 'localhost') {
    return getSocketServiceByNuclideUri('');
  } else {
    const uri = nuclideUri.createRemoteUri(host, '/');
    return getSocketServiceByNuclideUri(uri);
  }
}

async function getAllowedPorts(): Promise<?Array<number>> {
  const allowedPorts = await fetchSitevarOnce('NUCLIDE_TUNNEL_ALLOWED_PORTS');
  if (allowedPorts == null) {
    return [];
  }
  return allowedPorts;
}

function validateTunnel(tunnel: Object, allowedPorts: Array<number>): boolean {
  const remote = tunnel.to.host === 'localhost' ? tunnel.from : tunnel.to;
  if (!allowedPorts.includes(remote.port)) {
    return false;
  } else {
    return true;
  }
}
