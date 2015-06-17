'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable, Disposable} = require('atom');
var net = require('net');
var url = require('url');
var logger = require('nuclide-logging').getLogger();
var {EventEmitter} = require('events');

var RemoteFile = require('./RemoteFile');
var RemoteDirectory = require('./RemoteDirectory');
var NuclideClient = require('nuclide-server/lib/NuclideClient');
var NuclideRemoteEventbus = require('nuclide-server/lib/NuclideRemoteEventbus');
var {fsPromise} = require('nuclide-commons');
var {getVersion} = require('nuclide-version');

const HEARTBEAT_AWAY_REPORT_COUNT = 3;
const HEARTBEAT_NOTIFICATION_ERROR = 1;
const HEARTBEAT_NOTIFICATION_WARNING = 2;

type HeartbeatNotification = {
  notification: Notification;
  code: string;
}

type RemoteConnectionConfiguration = {
  host: string; // host nuclide server is running on.
  port: number; // port to connect to.
  cwd: string; // Path to remote directory user should start in upon connection.
  certificateAuthorityCertificate: ?Buffer; // certificate of certificate authority.
  clientCertificate: ?Buffer; // client certificate for https connection.
  clientKey: ?Buffer; // key for https connection.
}

var _connections: Array<RemoteConnection> = [];
var _emitter: EventEmitter = new EventEmitter();

class RemoteConnection {
  _entries: {[path: string]: RemoteFile|RemoteDirectory};
  _config: RemoteConnectionConfiguration;
  _initialized: ?bool;
  _closed: ?bool;

  _heartbeatNetworkAwayCount: int;
  _lastHeartbeatNotification: ?HeartbeatNotification;

  constructor(config: RemoteConnectionConfiguration) {
    this._subscriptions = new CompositeDisposable();
    this._entries = {};
    this._config = config;
    this._heartbeatNetworkAwayCount = 0;
    this._closed = false;
  }

  dispose(): void {
    this._subscriptions.dispose();
  }

  // A workaround before Atom 2.0: Atom's Project::setPaths currently uses
  // ::repositoryForDirectorySync, so we need the repo information to already be
  // available when the new path is added. t6913624 tracks cleanup of this.
  async _setHgRepoInfo(): void {
    var eventBus = this.getClient().eventbus;
    var remotePath = this.getPathForInitialWorkingDirectory();
    var hgRepoDescription = await eventBus.callMethod(
      /*serviceName*/ 'sourceControl',
      /*methodName*/ 'getHgRepository',
      /*methodArgs*/ [remotePath],
      /*extraOptions*/ {method: 'POST', json: true}
    );
    this._setHgRepositoryDescription(hgRepoDescription);
  }

  _monitorConnectionHeartbeat() {
    var socket = this.getClient().eventbus.socket;
    var serverUri = socket.getServerUri();

    /**
     * Adds an Atom notification for the detected heartbeat network status
     * The function makes sure not to add many notifications for the same event and prioritize new events.
     */
    var addHeartbeatNotification = (type: string, errorCode: string, message: string, dismissable: boolean) => {
      var {code, notification: existingNotification} = this._lastHeartbeatNotification || {};
      if (code && code === errorCode && dismissable) {
        // A dismissible heartbeat notification with this code is already active.
        return;
      }
      var notification;
      switch (type) {
        case HEARTBEAT_NOTIFICATION_ERROR:
          notification = atom.notifications.addError(message, {dismissable});
          break;
        case HEARTBEAT_NOTIFICATION_WARNING:
          notification = atom.notifications.addWarning(message, {dismissable});
          break;
        default:
          throw new Error('Unrecongnized heartbeat notification type');
      }
      if (existingNotification) {
        existingNotification.dismiss();
      }
      this._lastHeartbeatNotification = {
        notification,
        code: errorCode,
      };
    };

    var onHeartbeat = () => {
      if (this._lastHeartbeatNotification) {
        // If there has been existing heartbeat error/warning,
        // that means connection has been lost and we shall show a message about connection
        // being restored without a reconnect prompt.
        var {notification} = this._lastHeartbeatNotification;
        notification.dismiss();
        atom.notifications.addSuccess('Connection restored to Nuclide Server at: ' + serverUri);
        this._heartbeatNetworkAwayCount = 0;
        this._lastHeartbeatNotification = null;
      }
    };

    var notifyNetworkAway = (code: string) => {
      this._heartbeatNetworkAwayCount++;
      if (this._heartbeatNetworkAwayCount >= HEARTBEAT_AWAY_REPORT_COUNT) {
        addHeartbeatNotification(HEARTBEAT_NOTIFICATION_WARNING, code,
          'Nuclide server can not be reached at: ' + serverUri +
          '<br/>Check your network connection!',
          /*dismissable*/ true);
      }
    };

    var onHeartbeatError = (error: any) => {
      var {code, message, originalCode} = error;
      logger.info('Heartbeat network error:', code, originalCode, message);
      switch (code) {
          case 'NETWORK_AWAY':
            // Notify switching networks, disconnected, timeout, unreachable server or fragile connection.
            notifyNetworkAway(code);
            break;
          case 'SERVER_CRASHED':
            // Server shut down or port no longer accessible.
            // Notify the server was there, but now gone.
            addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code,
                'Nuclide server crashed!<br/>' +
                'Please reload Nuclide to restore your remote project connection! : (⌃-⌥-⌘-L)',
                /*dismissable*/ true);
            // TODO(most) reconnect RemoteConnection, restore the current project state,
            // and finally change dismissable to false and type to 'WARNING'.
            break;
          case 'PORT_NOT_ACCESSIBLE':
            // Notify never heard a heartbeat from the server.
            var {port} = url.parse(serverUri);
            addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code,
                'Nuclide server is not reachable.<br/>It could be running on a port that is not accessible: ' + port,
                /*dismissable*/ true);
            break;
          case 'INVALID_CERTIFICATE':
            // Notify the client certificate is not accepted by nuclide server (certificate mismatch).
            addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code,
                'Connection Reset Error!!<br/>This could be caused by the client certificate mismatching the server certificate.<br/>' +
                'Please reload Nuclide to restore your remote project connection! : (⌃-⌥-⌘-L)',
                /*dismissable*/ true);
            // TODO(most): reconnect RemoteConnection, restore the current project state.
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
    return url.parse(uri).path;
  }

  createDirectory(uri: string): ?RemoteDirectory {
    var {path} = url.parse(uri);
    path = require('path').normalize(path);

    var entry = this._entries[path];
    if (!entry || entry.getLocalPath() !== path) {
      this._entries[path] = entry = new RemoteDirectory(
        this,
        this.getUriOfRemotePath(path),
        {hgRepositoryDescription: this._hgRepositoryDescription}
      );
      // TODO: We should add the following line to keep the cache up-to-date.
      // We need to implement onDidRename and onDidDelete in RemoteDirectory
      // first. It's ok that we don't add the handlers for now since we have
      // the check `entry.getLocalPath() !== path` above.
      //
      // this._addHandlersForEntry(entry);
    }

    if (!entry.isDirectory()) {
      throw new Error('Path is not a directory:' + uri);
    }

    return entry;
  }

  // A workaround before Atom 2.0: see ::getHgRepoInfo of main.js.
  _setHgRepositoryDescription(hgRepositoryDescription): void {
    this._hgRepositoryDescription = hgRepositoryDescription;
  }

  createFile(uri: string): ?RemoteFile {
    var {path} = url.parse(uri);
    path = require('path').normalize(path);

    var entry = this._entries[path];
    if (!entry || entry.getLocalPath() !== path) {
      this._entries[path] = entry = new RemoteFile(this, this.getUriOfRemotePath(path));
      this._addHandlersForEntry(entry);
    }

    if (entry.isDirectory()) {
      throw new Error('Path is not a file');
    }

    return entry;
  }

  _addHandlersForEntry(entry: File | Directory): void {
    var oldPath = entry.getLocalPath();
    var renameSubscription = entry.onDidRename(() => {
      delete this._entries[oldPath];
      this._entries[entry.getLocalPath()] = entry;
    });
    var deleteSubscription = entry.onDidDelete(() => {
      delete this._entries[entry.getLocalPath()];
      renameSubscription.dispose();
      deleteSubscription.dispose();
    });
  }

  async initialize(): void {
    // Right now we don't re-handshake.
    if (this._initialized === undefined) {
      this._initialized = false;
      // Do version check.
      var client = this._getClient();
      var serverVersion;
      try {
        serverVersion = await client.version();
      } catch (e) {
        client.close();
        throw e;
      }
      var clientVersion = getVersion();
      if (clientVersion != serverVersion) {
        client.close();
        throw new Error(`Version mismatch. Client at ${clientVersion} while server at ${serverVersion}.`);
      }
      this._initialized = true;
      this._monitorConnectionHeartbeat();
      // A workaround before Atom 2.0: see ::getHgRepoInfo.
      await this._setHgRepoInfo();
      // Save to cache.
      this._addConnection();
    }
  }

  _addConnection() {
    _connections.push(this);
    _emitter.emit('did-add', this);
  }

  close(): void {
    // Close the eventbus that will stop the heartbeat interval, websocket reconnect trials, ..etc.
    if (this._client) {
      this._client.close();
      this._client = null;
    }
    if (!this._closed) {
      // Future getClient calls should fail, if it has a cached RemoteConnection instance.
      this._closed = true;
      // Remove from _connections to not be considered in future connection queries.
      _connections.splice(_connections.indexOf(this), 1);
      _emitter.emit('did-close', this);
    }
  }

  getClient(): NuclideClient {
    if (!this._initialized) {
      throw new Error('Remote connection has not been initialized.');
    } else if (this._closed) {
      throw new Error('Remote connection has been closed.');
    } else {
      return this._getClient();
    }
  }

  _getClient(): NuclideClient {
    if (!this._client) {
      var uri;
      var cwd = this._config.cwd;
      var options = {};

      // Use https if we have key, cert, and ca
      if (this._isSecure()) {
        options.certificateAuthorityCertificate = this._config.certificateAuthorityCertificate;
        options.clientCertificate = this._config.clientCertificate;
        options.clientKey = this._config.clientKey;
        uri = `https://${this.getRemoteHost()}`;
      } else {
        uri = `http://${this.getRemoteHost()}`;
      }

      // The remote connection and client are identified by both the remote host and the inital working directory.
      var clientId = this.getRemoteHost() + this.getPathForInitialWorkingDirectory();
      this._client = new NuclideClient(clientId, new NuclideRemoteEventbus(uri, options), {cwd});
      // Start watching the project for changes.
      this._client.watchDirectoryRecursive(cwd, /* do nothing on change */() => {}).catch((err) => {
        var warningMessage = 'Watcher failed to start - watcher features disabled!<br/>' +
            (err.message ? ('DETAILS: ' + err.message) : '');
        // Add a persistent warning message to make sure the user sees it and intentionally dismissing it.
        atom.notifications.addWarning(warningMessage, {dismissable: true});
      });
    }
    return this._client;
  }

  /**
   * Make rpc call through this connection given serviceUri in form of `$serviceName/$methodName`
   * and args as arguments list.
   */
  makeRpc(serviceUri: string, args: Array<any>, serviceOptions: any): Promise<any> {
    return this.getClient().makeRpc(serviceUri, args, serviceOptions);
  }

  registerEventListener(eventName: string, callback: (payload: any) => void, serviceOptions: any): Disposable {
    return this.getClient().registerEventListener(eventName, callback, serviceOptions);
  }


  _isSecure(): boolean {
    return this._config.certificateAuthorityCertificate
        && this._config.clientCertificate
        && this._config.clientKey;
  }

  getRemoteHost(): string {
    return `${this._config.host}:${this._config.port}`;
  }

  getRemoteHostname(): string {
    return this._config.host;
  }

  getUriForInitialWorkingDirectory(): string {
    return this.getUriOfRemotePath(this.getPathForInitialWorkingDirectory());
  }

  getPathForInitialWorkingDirectory(): string {
    return this._config.cwd;
  }

  getConfig(): RemoteConnectionConfiguration{
    return this._config;
  }

  static onDidAddRemoteConnection(handler: (connection: RemoteConnection) => void): Disposable {
    _emitter.on('did-add', handler);
    return new Disposable(() => {
      _emitter.removeListener('did-add', handler);
    });
  }

  static onDidCloseRemoteConnection(handler: (connection: RemoteConnection) => void): Disposable {
    _emitter.on('did-close', handler);
    return new Disposable(() => {
      _emitter.removeListener('did-close', handler);
    });
  }

  static getForUri(uri: string): ?RemoteConnection {
    var {hostname, path} = url.parse(uri);
    return RemoteConnection.getByHostnameAndPath(hostname, path);
  }

  /**
   * Get cached connection match the hostname and the path has the prefix of connection.cwd. If path is null,
   * then return the connection who matches the hostname and ignore connection.cwd.
   */
  static getByHostnameAndPath(hostname: string, path: ?string): ?RemoteConnection {
    return _connections.filter((connection) => {
      return connection.getRemoteHostname() === hostname &&
          (path === null || path.startsWith(connection.getPathForInitialWorkingDirectory()));
    })[0];
  }

  static getByHostname(hostname: string): Array<RemoteConnection> {
    return _connections.filter(connection => connection.getRemoteHostname() === hostname);
  }
}

// Expose local variables for testability.
RemoteConnection.test = {
  connections: _connections,
};

module.exports = RemoteConnection;
