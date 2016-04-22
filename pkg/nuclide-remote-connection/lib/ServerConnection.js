'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';
import type {RemoteConnection} from './RemoteConnection';
import type {HgRepositoryDescription} from '../../nuclide-source-control-helpers';
import typeof * as InfoService from '../../nuclide-server/lib/services/InfoService';

import invariant from 'assert';
import pathModule from 'path';
import ClientComponent from '../../nuclide-server/lib/serviceframework/ClientComponent';
import {loadServicesConfig} from '../../nuclide-server/lib/serviceframework/config';
import {getProxy} from '../../nuclide-service-parser';
import ServiceFramework from '../../nuclide-server/lib/serviceframework/index';
import {setConnectionConfig} from './RemoteConnectionConfigurationManager';
import {ConnectionHealthNotifier} from './ConnectionHealthNotifier';
import {RemoteFile} from './RemoteFile';
import {RemoteDirectory} from './RemoteDirectory';

import {Disposable} from 'atom';
import {parse as parseRemoteUri} from '../../nuclide-remote-uri';
import {EventEmitter} from 'events';

import NuclideSocket from '../../nuclide-server/lib/NuclideSocket';
import {getVersion} from '../../nuclide-version';

const newServices = ServiceFramework.loadServicesConfig();

export type ServerConnectionConfiguration = {
  host: string; // host nuclide server is running on.
  port: number; // port to connect to.
  certificateAuthorityCertificate?: Buffer; // certificate of certificate authority.
  clientCertificate?: Buffer; // client certificate for https connection.
  clientKey?: Buffer; // key for https connection.
};

const _emitter: EventEmitter = new EventEmitter();

// ServerConnection represents the client side of a connection to a remote machine.
// There can be at most one connection to a given remote machine at a time. Clients should
// get a ServerConnection via ServerConnection.getOrCreate() and should never call the
// constructor directly. Alternately existing connections can be queried with getByHostname().
//
// getService() returns typed RPC services via the service framework.
//
// A ServerConnection keeps a list of RemoteConnections - one for each open directory on the remote
// machine. Once all RemoteConnections have been closed, then the ServerConnection will close.
class ServerConnection {
  _entries: {[path: string]: RemoteFile | RemoteDirectory};
  _config: ServerConnectionConfiguration;
  _closed: boolean;
  _healthNotifier: ?ConnectionHealthNotifier;
  _client: ?ClientComponent;
  _connections: Array<RemoteConnection>;

  static _connections: Map<string, ServerConnection> = new Map();

  static async getOrCreate(config: ServerConnectionConfiguration): Promise<ServerConnection> {
    const existingConnection = ServerConnection.getByHostname(config.host);
    if (existingConnection != null) {
      return existingConnection;
    }

    const newConnection = new ServerConnection(config);
    try {
      await newConnection.initialize();
      return newConnection;
    } catch (e) {
      newConnection.close();
      throw e;
    }
  }

  // WARNING: This shuts down all Nuclide servers _without_ closing their
  // RemoteConnections first! This is extremely unsafe and
  // should only be used to forcibly kill Nuclide servers before restarting.
  static async forceShutdownAllServers(): Promise<void> {
    await Promise.all(
      Array.from(ServerConnection._connections).map(([_, connection]) => {
        return connection._getInfoService().closeConnection(true);
      }),
    );
  }

  // Do NOT call this from outside this class. Use ServerConnection.getOrCreate() instead.
  constructor(config: ServerConnectionConfiguration) {
    this._entries = {};
    this._config = config;
    this._closed = false;
    this._healthNotifier = null;
    this._client = null;
    this._connections = [];
  }

  dispose(): void {
    if (this._healthNotifier != null) {
      this._healthNotifier.dispose();
    }
  }

  static async _createInsecureConnectionForTesting(
    cwd: string,
    port: number,
  ): Promise<?ServerConnection> {
    const config = {
      host: 'localhost',
      port,
      cwd,
    };
    const connection = new ServerConnection(config);
    await connection.initialize();
    return connection;
  }

  _monitorConnectionHeartbeat() {
    invariant(this._healthNotifier == null);
    this._healthNotifier = new ConnectionHealthNotifier(this._config.host, this.getSocket());
  }

  getUriOfRemotePath(remotePath: string): string {
    return `nuclide://${this.getRemoteHost()}${remotePath}`;
  }

  getPathOfUri(uri: string): string {
    return parseRemoteUri(uri).path;
  }

  createDirectory(
    uri: NuclideUri,
    hgRepositoryDescription: ?HgRepositoryDescription,
    symlink: boolean = false
  ): RemoteDirectory {
    let {path} = parseRemoteUri(uri);
    path = pathModule.normalize(path);

    let entry = this._entries[path];
    if (
      !entry ||
      entry.getLocalPath() !== path ||
      entry.isSymbolicLink() !== symlink
    ) {
      this._entries[path] = entry = new RemoteDirectory(
        this,
        this.getUriOfRemotePath(path),
        symlink,
        {hgRepositoryDescription},
      );
      // TODO: We should add the following line to keep the cache up-to-date.
      // We need to implement onDidRename and onDidDelete in RemoteDirectory
      // first. It's ok that we don't add the handlers for now since we have
      // the check `entry.getLocalPath() !== path` above.
      //
      // this._addHandlersForEntry(entry);
    }

    invariant(entry instanceof RemoteDirectory);
    if (!entry.isDirectory()) {
      throw new Error('Path is not a directory:' + uri);
    }

    return entry;
  }

  createFile(uri: NuclideUri, symlink: boolean = false): RemoteFile {
    let {path} = parseRemoteUri(uri);
    path = pathModule.normalize(path);

    let entry = this._entries[path];
    if (
      !entry ||
      entry.getLocalPath() !== path ||
      entry.isSymbolicLink() !== symlink
    ) {
      this._entries[path] = entry = new RemoteFile(
        this,
        this.getUriOfRemotePath(path),
        symlink,
      );
      this._addHandlersForEntry(entry);
    }

    invariant(entry instanceof RemoteFile);
    if (entry.isDirectory()) {
      throw new Error('Path is not a file');
    }

    return entry;
  }

  _addHandlersForEntry(entry: RemoteFile | RemoteDirectory): void {
    const oldPath = entry.getLocalPath();
    /* $FlowFixMe */
    const renameSubscription = entry.onDidRename(() => {
      delete this._entries[oldPath];
      this._entries[entry.getLocalPath()] = entry;
    });
    /* $FlowFixMe */
    const deleteSubscription = entry.onDidDelete(() => {
      delete this._entries[entry.getLocalPath()];
      renameSubscription.dispose();
      deleteSubscription.dispose();
    });
  }

  async initialize(): Promise<void> {
    this._startRpc();
    const client = this.getClient();

    // Test connection first. First time we get here we're checking to reestablish
    // connection using cached credentials. This will fail fast (faster than infoService)
    // when we don't have cached credentials yet.
    await client.testConnection();

    // Do version check.
    const serverVersion = await this._getInfoService().getServerVersion();

    const clientVersion = getVersion();
    if (clientVersion !== serverVersion) {
      throw new Error(
        `Version mismatch. Client at ${clientVersion} while server at ${serverVersion}.`);
    }

    this._monitorConnectionHeartbeat();

    ServerConnection._connections.set(this.getRemoteHostname(), this);
    setConnectionConfig(this._config);
    _emitter.emit('did-add', this);
  }

  close(): void {
    if (this._closed) {
      return;
    }

    // Future getClient calls should fail, if it has a cached ServerConnection instance.
    this._closed = true;

    // The Rpc channel owns the socket.
    if (this._client != null) {
      this._client.close();
      this._client = null;
    }

    // Remove from _connections to not be considered in future connection queries.
    if (ServerConnection._connections.delete(this.getRemoteHostname())) {
      _emitter.emit('did-close', this);
    }
  }

  getClient(): ClientComponent {
    invariant(!this._closed && this._client != null, 'Server connection has been closed.');
    return this._client;
  }

  _startRpc(): void {
    let uri;
    const options = {};

    // Use https if we have key, cert, and ca
    if (this._isSecure()) {
      options.certificateAuthorityCertificate = this._config.certificateAuthorityCertificate;
      options.clientCertificate = this._config.clientCertificate;
      options.clientKey = this._config.clientKey;
      uri = `https://${this.getRemoteHost()}`;
    } else {
      uri = `http://${this.getRemoteHost()}`;
    }

    const socket = new NuclideSocket(uri, options);
    const client = new ClientComponent(socket, loadServicesConfig());

    // Register NuclideUri type conversions.
    client.registerType('NuclideUri',
      remoteUri => this.getPathOfUri(remoteUri), path => this.getUriOfRemotePath(path));

    this._client = client;
  }

  _isSecure(): boolean {
    return !!(
        this._config.certificateAuthorityCertificate
        && this._config.clientCertificate
        && this._config.clientKey
    );
  }

  getRemoteHost(): string {
    return `${this._config.host}:${this._config.port}`;
  }

  getPort(): number {
    return this._config.port;
  }

  getRemoteHostname(): string {
    return this._config.host;
  }

  getConfig(): ServerConnectionConfiguration {
    return this._config;
  }

  addConnection(connection: RemoteConnection): void {
    this._connections.push(connection);
  }

  async removeConnection(connection: RemoteConnection, shutdownIfLast: boolean): Promise<void> {
    invariant(this._connections.indexOf(connection) !== -1,
      'Attempt to remove a non-existent RemoteConnection');
    this._connections.splice(this._connections.indexOf(connection), 1);
    if (this._connections.length === 0) {
      // The await here is subtle, it ensures that the shutdown call is sent
      // on the socket before the socket is closed on the next line.
      // TODO: Ideally we'd not Promise.all() for argument lists which do not
      // contain any remote interfaces rather than await here.
      await this._getInfoService().closeConnection(shutdownIfLast);
      this.close();
    }
  }

  static onDidAddServerConnection(handler: (connection: ServerConnection) => void): Disposable {
    _emitter.on('did-add', handler);
    return new Disposable(() => {
      _emitter.removeListener('did-add', handler);
    });
  }

  static onDidCloseServerConnection(handler: (connection: ServerConnection) => void): Disposable {
    _emitter.on('did-close', handler);
    return new Disposable(() => {
      _emitter.removeListener('did-close', handler);
    });
  }

  static getForUri(uri: NuclideUri): ?ServerConnection {
    const {hostname} = parseRemoteUri(uri);
    if (hostname == null) {
      return null;
    }
    return ServerConnection.getByHostname(hostname);
  }

  static getByHostname(hostname: string): ?ServerConnection {
    return ServerConnection._connections.get(hostname);
  }

  getRemoteConnectionForUri(uri: NuclideUri): ?RemoteConnection {
    const {path} = parseRemoteUri(uri);
    return this.getConnections().filter(connection => {
      return path.startsWith(connection.getPathForInitialWorkingDirectory());
    })[0];
  }

  getConnections(): Array<RemoteConnection> {
    return this._connections;
  }

  getService(serviceName: string): any {
    const [serviceConfig] = newServices.filter(config => config.name === serviceName);
    invariant(serviceConfig != null, `No config found for service ${serviceName}`);
    return getProxy(serviceConfig.name, serviceConfig.definition, this.getClient());
  }

  getSocket(): NuclideSocket {
    return this.getClient().getSocket();
  }

  _getInfoService(): InfoService {
    return this.getService('InfoService');
  }
}

module.exports = {
  ServerConnection,
  __test__: {
    connections: ServerConnection._connections,
  },
};
