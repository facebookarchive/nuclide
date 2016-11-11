'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AtomCommands, ConnectionDetails} from './rpc-types';

import invariant from 'assert';
import {loadServicesConfig, ServiceRegistry, SocketServer} from '../../nuclide-rpc';
import nuclideUri from '../../commons-node/nuclideUri';
import {createNewEntry, RPC_PROTOCOL} from '../shared/ConfigDirectory';
import {localNuclideUriMarshalers} from '../../nuclide-marshalers-common';

// Ties the AtomCommands registered via RemoteCommandService to
// the server side CommandService.
export class CommandServer {
  static _server: ?CommandServer = null;

  static async getConnectionDetails(): Promise<?ConnectionDetails> {
    return CommandServer._server == null
      ? null
      : (await CommandServer._server._server.getAddress());
  }

  _server: SocketServer;
  _nuclidePort: number;
  _atomCommands: AtomCommands;

  constructor(nuclidePort: number, atomCommands: AtomCommands) {
    this._nuclidePort = nuclidePort;
    this._atomCommands = atomCommands;
    const services = loadServicesConfig(nuclideUri.join(__dirname, '..'));
    const registry = new ServiceRegistry(
      [localNuclideUriMarshalers],
      services,
      RPC_PROTOCOL);
    this._server = new SocketServer(registry);
  }

  async _initialize(): Promise<void> {
    const address = await this._server.getAddress();

    await createNewEntry(this._nuclidePort, address.port, address.family);
  }

  dispose(): void {
    invariant(CommandServer._server === this);
    CommandServer._server = null;
    this._server.dispose();
  }

  static async create(
    port: number,
    atomCommands: AtomCommands,
  ): Promise<CommandServer> {
    if (CommandServer._server != null) {
      CommandServer._server.dispose();
    }
    invariant(CommandServer._server == null);

    const server = new CommandServer(port, atomCommands);
    await server._initialize();
    CommandServer._server = server;
    return server;
  }

  static getAtomCommands(): ?AtomCommands {
    if (CommandServer._server == null) {
      return null;
    }
    return CommandServer._server._atomCommands;
  }
}
