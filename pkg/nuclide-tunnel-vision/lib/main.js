'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

import {TunnelVision} from './TunnelVision';

export type TunnelVisionProvider = {
  // Should be the unique to all providers. Recommended to be the package name.
  name: string;
  isVisible: () => boolean;
  toggle: () => void;
};

export type TunnelVisionState = {
  // Serialize the restore state via an array of provider names.
  restoreState: ?Array<string>;
}

let tunnelVision: ?TunnelVision = null;

export function activate(state: ?TunnelVisionState) {
  if (tunnelVision == null) {
    tunnelVision = new TunnelVision(state);
    atom.commands.add(
      atom.views.getView(atom.workspace),
      'nuclide-tunnel-vision:toggle',
      tunnelVision.toggleTunnelVision.bind(tunnelVision),
    );
  }
}

export function deactivate() {
  if (tunnelVision != null) {
    tunnelVision = null;
  }
}

export function serialize(): TunnelVisionState {
  invariant(tunnelVision != null);
  return tunnelVision.serialize();
}

export function consumeTunnelVisionProvider(provider: TunnelVisionProvider): IDisposable {
  invariant(tunnelVision != null);
  return tunnelVision.consumeTunnelVisionProvider(provider);
}
