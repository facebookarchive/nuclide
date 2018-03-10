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

import {validateTunnel} from '../Whitelist';
import * as Actions from './Actions';
import {Observable} from 'rxjs';
import invariant from 'assert';
import {getSocketServiceByNuclideUri} from '../../../nuclide-remote-connection/';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {tunnelDescription} from '../../../nuclide-socket-rpc/lib/Tunnel';
import * as SocketService from '../../../nuclide-socket-rpc';

export function requestTunnelEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions
    .ofType(Actions.REQUEST_TUNNEL)
    .mergeMap(async action => {
      invariant(action.type === Actions.REQUEST_TUNNEL);
      const {tunnel, onOpen, onClose} = action.payload;
      const {from, to} = tunnel;
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
      const friendlyString = `${tunnelDescription(tunnelDescriptor)} (${
        tunnel.description
      })`;

      if (!await validateTunnel(tunnel)) {
        onOpen(
          new Error(
            `Trying to open a tunnel on a non-whitelisted port: ${
              to.port
            }\n\n` +
              'Contact the Nuclide team if you would like this port to be available.',
          ),
        );
        return null;
      }

      const fromService = getSocketServiceByHost(from.host);
      const toService = getSocketServiceByHost(to.host);
      let clientCount = 0;
      const connectionFactory = await toService.getConnectionFactory();
      const events = fromService.createTunnel(
        tunnelDescriptor,
        connectionFactory,
      );

      const subscription = events.refCount().subscribe({
        next: event => {
          if (event.type === 'server_started') {
            store.getState().consoleOutput.next({
              text: `Opened tunnel: ${friendlyString}`,
              level: 'info',
            });
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
        error: error => store.dispatch(Actions.closeTunnel(tunnel, error)),
      });

      return Actions.addOpenTunnel(tunnel, error => {
        subscription.unsubscribe();
        let message;
        if (error == null) {
          message = {
            text: `Closed tunnel: ${friendlyString}`,
            level: 'info',
          };
        } else {
          message = {
            text: `Tunnel error: ${friendlyString}\n${error.message}`,
            level: 'error',
          };
        }
        store.getState().consoleOutput.next(message);
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
    // Bypass the RPC framework to avoid extra marshal/unmarshaling.
    return SocketService;
  } else {
    const uri = nuclideUri.createRemoteUri(host, '/');
    return getSocketServiceByNuclideUri(uri);
  }
}
