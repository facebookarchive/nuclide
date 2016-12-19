/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
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
  // The list of connected AtomCommands, most recent connection last.
  // We have no way of detecting a traumatic termination of an Atom
  // process, so the most recent connection is likely the healthiest
  // connection.
  static _connections: Array<CommandServer> = [];
  static _server: ?SocketServer = null;

  static async _ensureServer(): Promise<SocketServer> {
    if (CommandServer._server != null) {
      return CommandServer._server;
    }
    const services = loadServicesConfig(nuclideUri.join(__dirname, '..'));
    const registry = new ServiceRegistry(
      [localNuclideUriMarshalers],
      services,
      RPC_PROTOCOL);
    const result = new SocketServer(registry);
    CommandServer._server = result;
    const address = await result.getAddress();
    await createNewEntry(address.port, address.family);
    return result;
  }

  static async getConnectionDetails(): Promise<?ConnectionDetails> {
    const server = CommandServer.getCurrentServer();
    return server == null
      ? null
      : (await (await CommandServer._ensureServer()).getAddress());
  }

  _atomCommands: AtomCommands;

  constructor(atomCommands: AtomCommands) {
    this._atomCommands = atomCommands;
    CommandServer._ensureServer();
  }

  dispose(): void {
    invariant(CommandServer._connections.includes(this));
    CommandServer._connections.splice(CommandServer._connections.indexOf(this), 1);
  }

  static async register(
    atomCommands: AtomCommands,
  ): Promise<IDisposable> {
    const server = new CommandServer(atomCommands);
    CommandServer._connections.push(server);
    return server;
  }

  static getCurrentServer(): ?CommandServer {
    if (CommandServer._connections.length === 0) {
      return null;
    }
    return CommandServer._connections[CommandServer._connections.length - 1];
  }

  static getAtomCommands(): ?AtomCommands {
    const server = CommandServer.getCurrentServer();
    return (server == null) ? null : server._atomCommands;
  }
}
