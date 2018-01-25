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

import type {Message} from '../../../../modules/atom-ide-ui/pkg/atom-ide-console/lib/types';
import type {Action, Tunnel, OpenTunnel} from '../types';
import type {Directory} from '../../../nuclide-remote-connection';

import * as Actions from './Actions';
import * as Immutable from 'immutable';
import invariant from 'assert';
import {Subject} from 'rxjs';

export function openTunnels(
  state: Immutable.Map<Tunnel, OpenTunnel> = Immutable.Map(),
  action: Action,
) {
  switch (action.type) {
    case Actions.ADD_OPEN_TUNNEL:
      const {close, tunnel} = action.payload;
      return state.set(tunnel, {
        close,
        state: 'initializing',
      });
    case Actions.CLOSE_TUNNEL:
      const toClose = action.payload.tunnel;
      const openTunnel = state.get(toClose);
      if (openTunnel == null) {
        return state;
      }
      openTunnel.close(action.payload.error);
      return state.delete(toClose);
    case Actions.SET_TUNNEL_STATE:
      invariant(state.get(action.payload.tunnel) != null);
      return state.update(action.payload.tunnel, value => ({
        ...value,
        state: action.payload.state,
      }));
    default:
      return state;
  }
}

export function currentWorkingDirectory(
  state: ?Directory = null,
  action: Action,
) {
  switch (action.type) {
    case Actions.SET_CURRENT_WORKING_DIRECTORY:
      return action.payload.directory;
    default:
      return state;
  }
}

export function consoleOutput(
  state: Subject<Message> = new Subject(),
  action: Action,
) {
  return state;
}
