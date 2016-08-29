'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as CommandService from '../lib/CommandService';
import {getServer} from '../shared/ConfigDirectory';
import net from 'net';
import {loadServicesConfig, RpcConnection, SocketTransport} from '../../nuclide-rpc';
import nuclideUri from '../../commons-node/nuclideUri';

function convertStringFamilyToNumberFamily(family: string): number {
  switch (family) {
    case 'IPv4': return 4;
    case 'IPv6': return 6;
    default: throw new Error(`Unrecognized network address family ${family}`);
  }
}

// Connects to the local NuclideServer process, opens the file in the connected
// Atom process, and resolves once the file is open in Atom.
export async function openFile(filePath: string, line: number, column: number): Promise<void> {
  // Get the RPC connection info for the filesystem.
  const serverInfo = await getServer();
  if (serverInfo == null) {
    throw new Error('Could not find a nuclide-server with a connected Atom');
  }
  const {commandPort, family} = serverInfo;

  // Setup the RPC connection to the NuclideServer process.
  const services = loadServicesConfig(nuclideUri.join(__dirname, '..'));
  const socket = net.connect({
    port: commandPort,
    family: convertStringFamilyToNumberFamily(family),
  });
  const transport = new SocketTransport(socket);
  await transport.onConnected();
  const connection = RpcConnection.createLocal(transport, services);

  const service: CommandService = connection.getService('CommandService');
  const commands = await service.getAtomCommands();
  if (commands == null) {
    throw new Error('Nuclide server is running but no Atom process with Nuclide is connected.');
  }
  return await commands.openFile(filePath, line, column);
}
