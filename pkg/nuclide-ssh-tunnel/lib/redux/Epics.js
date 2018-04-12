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

import {getSocketServiceByHost, resolveTunnel} from '../Normalization';
import {validateTunnel} from '../Whitelist';
import * as Actions from './Actions';
import {Observable} from 'rxjs';
import invariant from 'assert';
import {tunnelDescription} from '../../../nuclide-socket-rpc/lib/Tunnel';

export function requestTunnelEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions
    .ofType(Actions.REQUEST_TUNNEL)
    .mergeMap(async action => {
      invariant(action.type === Actions.REQUEST_TUNNEL);
      const {tunnel, onOpen, onClose} = action.payload;
      const resolved = resolveTunnel(tunnel);
      const {from, to} = resolved;
      const friendlyString = `${tunnelDescription(resolved)} (${
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

      let subscription;

      let isTunnelOpen = false;
      const open = () => {
        const events = fromService.createTunnel(resolved, connectionFactory);
        subscription = events.refCount().subscribe({
          next: event => {
            if (event.type === 'server_started') {
              store.getState().consoleOutput.next({
                text: `Opened tunnel: ${friendlyString}`,
                level: 'info',
              });
              isTunnelOpen = true;
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
          error: error => {
            if (!isTunnelOpen) {
              onOpen(error);
            }
            store.dispatch(Actions.closeTunnel(tunnel, error));
          },
        });
      };

      const close = error => {
        subscription.unsubscribe();
        if (!isTunnelOpen) {
          return;
        }
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
      };

      return Actions.openTunnel(tunnel, open, close);
    })
    .switchMap(action => {
      if (action == null) {
        return Observable.empty();
      } else {
        return Observable.of(action);
      }
    });
}

export function openTunnelEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions
    .ofType(Actions.OPEN_TUNNEL)
    .do(action => {
      invariant(action.type === Actions.OPEN_TUNNEL);
      action.payload.open();
    })
    .ignoreElements();
}
