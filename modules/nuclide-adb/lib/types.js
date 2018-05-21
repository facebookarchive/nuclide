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
import type {Observable, ConnectableObservable} from 'rxjs';

export type SimpleProcess = {
  user: string,
  pid: string,
  name: string,
};

export type AndroidJavaProcess = SimpleProcess;

export type DebugBridgeType = 'adb' | 'sdb';

export type DeviceId = {name: string, port: number};

export type DeviceDescription = {|
  name: string,
  port: number,
  architecture: string,
  apiVersion: string,
  model: string,
|};

export type Process = {
  user: string,
  pid: number,
  name: string,
  cpuUsage: ?number,
  memUsage: ?number,
  isJava: boolean,
};

export type DebugBridgeConfig = {path: string, ports: Array<number>};

export type DebugBridgeFullConfig = {
  active: ?string,
  all: Array<string>,
  ports: Array<number>,
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

export type DBType = 'adb' | 'sdb';

export type DBPlatform = {
  name: string,
  type: DBType,
  command: string,
  getService: NuclideUri => {
    getDeviceList: () => ConnectableObservable<Array<DeviceDescription>>,
  },
};
