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
import type {OpenTunnel, Tunnel} from '../types';

import * as React from 'react';
import ManualTunnelSection from './ManualTunnelSection';
import {TunnelsPanelTable} from './TunnelsPanelTable';

export type Props = {
  tunnels: Array<[Tunnel, OpenTunnel]>,
  closeTunnel: Tunnel => void,
  workingDirectoryHost: 'localhost' | ?NuclideUri,
  openTunnel(tunnel: Tunnel): void,
};

export class TunnelsPanelContents extends React.Component<Props> {
  props: Props;

  render(): React.Element<any> {
    return (
      <div className="nuclide-ssh-tunnels-panel-contents">
        <TunnelsPanelTable
          tunnels={this.props.tunnels}
          closeTunnel={this.props.closeTunnel}
        />
        <ManualTunnelSection
          workingDirectoryHost={this.props.workingDirectoryHost}
          openTunnel={this.props.openTunnel}
        />
      </div>
    );
  }
}
