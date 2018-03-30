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

import type {
  CloseTunnelAction,
  OpenTunnelAction,
  RequestTunnelAction,
  SetTunnelStateAction,
  Tunnel,
  TunnelState,
} from '../types';

export const CLOSE_TUNNEL = 'CLOSE_TUNNEL';
export const OPEN_TUNNEL = 'OPEN_TUNNEL';
export const REQUEST_TUNNEL = 'REQUEST_TUNNEL';
export const SET_TUNNEL_STATE = 'SET_TUNNEL_STATE';
export const SET_CURRENT_WORKING_DIRECTORY = 'SET_CURRENT_WORKING_DIRECTORY';

export function closeTunnel(tunnel: Tunnel, error: ?Error): CloseTunnelAction {
  return {
    type: CLOSE_TUNNEL,
    payload: {tunnel, error},
  };
}

export function openTunnel(
  tunnel: Tunnel,
  open: () => void,
  close: (?Error) => void,
): OpenTunnelAction {
  return {
    type: OPEN_TUNNEL,
    payload: {tunnel, open, close},
  };
}

export function requestTunnel(
  tunnel: Tunnel,
  onOpen: (?Error) => void,
  onClose: (?Error) => void,
): RequestTunnelAction {
  return {
    type: REQUEST_TUNNEL,
    payload: {tunnel, onOpen, onClose},
  };
}

export function setTunnelState(
  tunnel: Tunnel,
  state: TunnelState,
): SetTunnelStateAction {
  return {
    type: SET_TUNNEL_STATE,
    payload: {tunnel, state},
  };
}

export function setCurrentWorkingDirectory(directory: ?string) {
  return {
    type: SET_CURRENT_WORKING_DIRECTORY,
    payload: {directory},
  };
}
