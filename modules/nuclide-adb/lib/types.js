/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Observable} from 'rxjs';

export type SimpleProcess = {
  user: string,
  pid: string,
  name: string,
};

export type AndroidJavaProcess = SimpleProcess;

export type AdbDevice = {|
  serial: string,
  displayName: string,
  usb: ?string,
  product: ?string,
  model: ?string,
  device: ?string,
  transportId: ?string,
|};

export type Process = {
  user: string,
  pid: number,
  name: string,
  cpuUsage: ?number,
  memUsage: ?number,
  isJava: boolean,
};

//
// nuclide-ssh-tunnel types and nuclide-socket-rpc types
//

export type TunnelHost = {
  host: string,
  port: number,
  family: 4 | 6,
};

export type ResolvedTunnel = {
  from: TunnelHost,
  to: TunnelHost,
};

export type Host = {
  host: 'localhost' | NuclideUri,
  port: number,
  family?: 4 | 6,
};

export type Tunnel = {
  description: string,
  from: Host,
  to: Host,
};

export type SshTunnelService = {
  openTunnels(tunnels: Array<Tunnel>): Observable<'ready'>,
  getOpenTunnels(): Set<ResolvedTunnel>,
  getAvailableServerPort(uri: NuclideUri): Promise<number>,
};
