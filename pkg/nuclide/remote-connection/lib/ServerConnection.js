'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RemoteConnection} from './RemoteConnection';

import invariant from 'assert';
import {trackEvent} from '../../analytics';
import ClientComponent from '../../server/lib/serviceframework/ClientComponent';
import {loadServicesConfig} from '../../server/lib/serviceframework/config';
import {getProxy} from '../../service-parser';
import ServiceFramework from '../../server/lib/serviceframework';
import {setConnectionConfig} from './RemoteConnectionConfigurationManager';

import {CompositeDisposable, Disposable} from 'atom';
import {parse as parseRemoteUri} from '../../remote-uri';
import {getLogger} from '../../logging';
import {EventEmitter} from 'events';

import NuclideSocket from '../../server/lib/NuclideSocket';
import {getVersion} from '../../version';

const logger = getLogger();
const newServices = ServiceFramework.loadServicesConfig();

const HEARTBEAT_AWAY_REPORT_COUNT = 3;
const HEARTBEAT_NOTIFICATION_ERROR = 1;
const HEARTBEAT_NOTIFICATION_WARNING = 2;

type HeartbeatNotification = {
  notification: atom$Notification,
  code: string,
}

export type ServerConnectionConfiguration = {
  host: string, // host nuclide server is running on.
  port: number, // port to connect to.
  certificateAuthorityCertificate?: Buffer, // certificate of certificate authority.
  clientCertificate?: Buffer, // client certificate for https connection.
  clientKey?: Buffer, // key for https connection.
}

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
  _config: ServerConnectionConfiguration;
  _closed: boolean;
  _subscriptions: CompositeDisposable;
  _heartbeatNetworkAwayCount: number;
  _lastHeartbeatNotification: ?HeartbeatNotification;
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

  // Do NOT call this from outside this class. Use ServerConnection.getOrCreate() instead.
  constructor(config: ServerConnectionConfiguration) {
    this._config = config;
    this._closed = false;
    this._subscriptions = new CompositeDisposable();
    this._heartbeatNetworkAwayCount = 0;
    this._lastHeartbeatNotification = null;
    this._client = null;
    this._connections = [];
  }

  dispose(): void {
    this._subscriptions.dispose();
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
    const socket = this.getSocket();
    const serverUri = socket.getServerUri();

    /**
     * Adds an Atom notification for the detected heartbeat network status
     * The function makes sure not to add many notifications for the same event and prioritize
     * new events.
     */
    const addHeartbeatNotification = (
      type: number,
      errorCode: string,
      message: string,
      dismissable: boolean,
      askToReload: boolean
    ) => {
      const {code, notification: existingNotification} = this._lastHeartbeatNotification || {};
      if (code && code === errorCode && dismissable) {
        // A dismissible heartbeat notification with this code is already active.
        return;
      }
      let notification = null;
      const options = {dismissable, buttons: []};
      if (askToReload) {
        options.buttons.push({
          className: 'icon icon-zap',
          onDidClick() { atom.reload(); },
          text: 'Reload Atom',
        });
      }
      switch (type) {
        case HEARTBEAT_NOTIFICATION_ERROR:
          notification = atom.notifications.addError(message, options);
          break;
        case HEARTBEAT_NOTIFICATION_WARNING:
          notification = atom.notifications.addWarning(message, options);
          break;
        default:
          throw new Error('Unrecongnized heartbeat notification type');
      }
      if (existingNotification) {
        existingNotification.dismiss();
      }
      invariant(notification);
      this._lastHeartbeatNotification = {
        notification,
        code: errorCode,
      };
    };

    const onHeartbeat = () => {
      if (this._lastHeartbeatNotification) {
        // If there has been existing heartbeat error/warning,
        // that means connection has been lost and we shall show a message about connection
        // being restored without a reconnect prompt.
        const {notification} = this._lastHeartbeatNotification;
        notification.dismiss();
        atom.notifications.addSuccess('Connection restored to Nuclide Server at: ' + serverUri);
        this._heartbeatNetworkAwayCount = 0;
        this._lastHeartbeatNotification = null;
      }
    };

    const notifyNetworkAway = (code: string) => {
      this._heartbeatNetworkAwayCount++;
      if (this._heartbeatNetworkAwayCount >= HEARTBEAT_AWAY_REPORT_COUNT) {
        addHeartbeatNotification(HEARTBEAT_NOTIFICATION_WARNING, code,
          `Nuclide server can not be reached at "${serverUri}".<br/>` +
          'Check your network connection.',
          /*dismissable*/ true,
          /*askToReload*/ false);
      }
    };

    const onHeartbeatError = (error: any) => {
      const {code, message, originalCode} = error;
      trackEvent({
        type: 'heartbeat-error',
        data: {
          code: code || '',
          message: message || '',
          host: this._config.host,
        },
      });
      logger.info('Heartbeat network error:', code, originalCode, message);
      switch (code) {
        case 'NETWORK_AWAY':
            // Notify switching networks, disconnected, timeout, unreachable server or fragile
            // connection.
          notifyNetworkAway(code);
          break;
        case 'SERVER_CRASHED':
            // Server shut down or port no longer accessible.
            // Notify the server was there, but now gone.
          addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code,
                '**Nuclide Server Crashed**<br/>' +
                'Please reload Atom to restore your remote project connection.',
                /*dismissable*/ true,
                /*askToReload*/ true);
            // TODO(most) reconnect ServerConnection, restore the current project state,
            // and finally change dismissable to false and type to 'WARNING'.
          break;
        case 'PORT_NOT_ACCESSIBLE':
            // Notify never heard a heartbeat from the server.
          const {port} = parseRemoteUri(serverUri);
          addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code,
                '**Nuclide Server Is Not Reachable**<br/>' +
                `It could be running on a port that is not accessible: ${port}.`,
                /*dismissable*/ true,
                /*askToReload*/ false);
          break;
        case 'INVALID_CERTIFICATE':
            // Notify the client certificate is not accepted by nuclide server
            // (certificate mismatch).
          addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code,
                '**Connection Reset Error**<br/>' +
                'This could be caused by the client certificate mismatching the ' +
                  'server certificate.<br/>' +
                'Please reload Atom to restore your remote project connection.',
                /*dismissable*/ true,
                /*askToReload*/ true);
            // TODO(most): reconnect ServerConnection, restore the current project state.
            // and finally change dismissable to false and type to 'WARNING'.
          break;
        default:
          notifyNetworkAway(code);
          logger.error('Unrecongnized heartbeat error code: ' + code, message);
          break;
      }
    };
    socket.on('heartbeat', onHeartbeat);
    socket.on('heartbeat.error', onHeartbeatError);

    this._subscriptions.add(new Disposable(() => {
      socket.removeListener('heartbeat', onHeartbeat);
      socket.removeListener('heartbeat.error', onHeartbeatError);
    }));
  }

  getUriOfRemotePath(remotePath: string): string {
    return `nuclide://${this.getRemoteHost()}${remotePath}`;
  }

  getPathOfUri(uri: string): string {
    return parseRemoteUri(uri).path;
  }

  async initialize(): Promise<void> {
    this._startRpc();
    const client = this.getClient();

    // Test connection first. First time we get here we're checking to reestablish
    // connection using cached credentials. This will fail fast (faster than infoService)
    // when we don't have cached credentials yet.
    await client.testConnection();

    // Do version check.
    const infoService = this.getService('InfoService');
    const serverVersion = await infoService.getServerVersion();

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

  removeConnection(connection: RemoteConnection): void {
    invariant(this._connections.indexOf(connection) !== -1,
      'Attempt to remove a non-existent RemoteConnection');
    this._connections.splice(this._connections.indexOf(connection), 1);
    if (this._connections.length === 0) {
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

  static getByHostname(hostname: string): ?ServerConnection {
    return ServerConnection._connections.get(hostname);
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
}

module.exports = {
  ServerConnection,
  __test__: {
    connections: ServerConnection._connections,
  },
};
