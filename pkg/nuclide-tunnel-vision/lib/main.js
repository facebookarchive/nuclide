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
  isVisible: () => boolean;
  toggle: () => void;
};

let tunnelVision: ?TunnelVision = null;

export function activate(state: ?Object) {
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
    tunnelVision.dispose();
    tunnelVision = null;
  }
}

export function consumeTunnelVisionProvider(provider: TunnelVisionProvider): IDisposable {
  invariant(tunnelVision != null);
  return tunnelVision.consumeTunnelVisionProvider(provider);
}
