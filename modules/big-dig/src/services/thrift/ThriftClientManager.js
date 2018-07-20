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

import type {Subscription} from 'rxjs';
import type {Transport} from '../../server/BigDigServer';
import type {
  ThriftServiceCommand,
  ThriftServerConfig,
  ThriftServiceConfig,
  ThriftClient,
} from './types';

import {getAvailableServerPort} from 'nuclide-commons/serverPort';
import RemoteFileSystemService from '../fs/gen-nodejs/RemoteFileSystemService';
import {getLogger} from 'log4js';
import invariant from 'assert';
import {Tunnel} from '../tunnel/Tunnel';
import {TunnelManager} from '../tunnel/TunnelManager';
import EventEmitter from 'events';

import {createThriftClient} from './createThriftClient';
import {encodeMessage, decodeMessage} from './util';
import {convertToServerConfig, genConfigId} from './config-utils';

// Every client increase tunnel's refCount by 1, while closing it, we need to
// reduce tunnel refCount by 1. The reason we want to let ThriftClientManager
// to manager tunnel's refCount instead of directly using Tunnel class' refCount
// is because it is more convenient and robust to let the tunnel's direct
// consumer to manager the refCount.
type TunnelCacheEntry = {tunnel: Tunnel, refCount: number};

// waiting for server response timeout
let remoteCallTimeLimit = 15000;

// create and export for speeding up testing
export function setTimeoutLimit(time: number): void {
  remoteCallTimeLimit = time;
}

/**
 * This class manages the creation and disposal of thrift clients.
 * `ThriftClientManager` instances will be created and managed by BigDigClient
 */
export class ThriftClientManager {
  _transport: Transport;
  _tunnel: Tunnel;
  _tunnelManager: TunnelManager;
  _logger: log4js$Logger;
  _isClosed: boolean;
  _subscription: Subscription;
  _emitter: EventEmitter;
  _messageId: number;
  _clientIndex: number;

  // The following attributes are used to managing multiple Thrift service client
  _clientMap: Map<string, ThriftClient>;
  _availableServices: Set<string>;
  _tunnelByServiceConfigId: Map<string, TunnelCacheEntry>;
  _nameToServiceConfig: Map<string, ThriftServiceConfig>;

  constructor(transport: Transport, tunnelManager: TunnelManager) {
    this._transport = transport;
    this._tunnelManager = tunnelManager;
    this._logger = getLogger('bigdig-thrift-client-manager');
    this._messageId = 0;
    this._clientIndex = 0;
    this._isClosed = false;
    this._emitter = new EventEmitter();

    this._availableServices = new Set();
    this._clientMap = new Map();
    this._tunnelByServiceConfigId = new Map();
    this._nameToServiceConfig = new Map();

    // Register all available thrift services
    this._registerThriftServices();

    const observable = this._transport.onMessage();
    observable.subscribe({
      // TODO(terryltang): Temporarily use json format for readability, later
      // consider to use the new tunnel/Encoder to encode/decode message
      next: value => {
        const response = decodeMessage(value);
        this._emitter.emit(response.id, response);
      },
      error(err) {
        // eslint-disable-next-line no-console
        this._logger.error(
          'Error received in big-dig thrift client manager!',
          err,
        );
      },
      complete() {
        // eslint-disable-next-line no-console
        this._logger.error(
          'big-dig thrift client manager transport subscription completed',
        );
      },
    });
  }

  /**
   * Register all available Thrift services and do initializaiton
   *
   * TODO(terryltang): (T30983466) later we should create a Thrift service
   * config file list available thrift service name and install path. And we
   * will have a thrift service loader to fetch all thrift client factory
   * functions and pass the factory functions to here. Probably also need to
   * pass more information from each thrift service to here, which will be used
   * by in `_startRemoteThrfitServer` will resovle these in later diffs
   */
  _registerThriftServices(): void {
    const serviceName = 'thrift-rfs';
    // Register available service name, set factory function and initializaiton
    this._availableServices.add(serviceName);

    const serviceConfig = {
      name: serviceName,
      remoteUri: '',
      remoteCommand: '',
      remoteCommandArgs: [],
      remotePort: 0,
      thriftTransport: 'buffered',
      thriftProtocol: 'binary',
      thriftService: RemoteFileSystemService,
      killOldThriftServerProcess: true,
    };
    this._nameToServiceConfig.set(serviceName, serviceConfig);
  }

  addThriftService(serviceConfig: ThriftServiceConfig): void {
    this._availableServices.add(serviceConfig.name);
    this._nameToServiceConfig.set(serviceConfig.name, serviceConfig);
  }

  _getServiceConfig(serviceName: string): ThriftServiceConfig {
    const config = this._nameToServiceConfig.get(serviceName);
    invariant(config != null);
    return config;
  }

  /**
   * Before, the method name was `getOrCreateThriftClient`, we then decided to
   * return a new Thrift client every single time, but they will reuse tunnel
   * and Thrift server if possible. Each module will maintain its own singleton
   * of Thrift client to increase the separation of the Thrift clients
   * (potentially reliability) yet reduce resource consumption through reusing
   *  tunnel and Thrift server.
   */
  async createThriftClient(serviceName: string): Promise<ThriftClient> {
    invariant(!this._isClosed, 'big-dig thrift client manager close!');
    invariant(
      this._availableServices.has(serviceName),
      `No available thrift service for ${serviceName}`,
    );

    const serviceConfig = this._getServiceConfig(serviceName);
    const tunnel = await this._getOrCreateTunnel(serviceConfig);
    const clientId = `${serviceConfig.name}\0${this._clientIndex++}`;
    const client = await createThriftClient(
      serviceConfig,
      tunnel.getLocalPort(),
    );
    const clientDispose = () => {
      this._clientMap.delete(clientId);
      this._closeTunnel(serviceConfig);
    };
    client.onConnectionEnd(clientDispose);
    client.onUnexpectedConnectionEnd(clientDispose);
    this._clientMap.set(clientId, client);
    return client;
  }

  /**
   * Expect result from remote methods. Here return type `any` can be downcasted
   * to other expected data types in callers
   */
  async _invokeRemoteMethod(
    command: ThriftServiceCommand,
    serverConfig: ThriftServerConfig,
  ): Promise<any> {
    const id = (this._messageId++).toString(16);
    const response = new Promise((resolve, reject) => {
      let timeoutHandler = setTimeout(() => {
        this._emitter.removeListener(id, onResponse);
        reject(
          new Error(
            `Service: ${serverConfig.name} command: ${command} timeout`,
          ),
        );
        timeoutHandler = null;
      }, remoteCallTimeLimit);
      function onResponse(message): void {
        if (timeoutHandler != null) {
          clearTimeout(timeoutHandler);
        }
        if (message.payload.success) {
          resolve(message.payload.port);
        } else {
          reject(new Error(message.payload.error));
        }
      }
      this._emitter.once(id, onResponse);
    });
    const message = {
      id,
      payload: {type: 'request', command, serverConfig},
    };
    this._transport.send(encodeMessage(message));
    return response;
  }

  _createRemoteServer(serverConfig: ThriftServerConfig): Promise<number> {
    return this._invokeRemoteMethod('start-server', serverConfig);
  }

  _closeRemoteServer(serviceName: string): Promise<any> {
    const serverConfig = this._getServiceConfig(serviceName);
    return this._invokeRemoteMethod('stop-server', serverConfig);
  }

  async _getOrCreateTunnel(
    serviceConfig: ThriftServiceConfig,
  ): Promise<Tunnel> {
    const serviceConfigId = genConfigId(serviceConfig);
    const tunnelCacheEntry = this._tunnelByServiceConfigId.get(serviceConfigId);
    let tunnel = null;

    if (tunnelCacheEntry != null) {
      this._logger.info(`Using an existent tunnel for ${serviceConfig.name}`);
      tunnel = tunnelCacheEntry.tunnel;
      tunnelCacheEntry.refCount++;
    } else {
      this._logger.info(`Creating a new tunnel for ${serviceConfig.name}`);
      const serverConfig = convertToServerConfig(serviceConfig);
      const remotePort = await this._createRemoteServer(serverConfig);
      const localPort = await getAvailableServerPort();
      const useIPv4 = false;
      tunnel = await this._tunnelManager.createTunnel(
        localPort,
        remotePort,
        useIPv4,
      );
      this._tunnelByServiceConfigId.set(serviceConfigId, {tunnel, refCount: 1});
    }
    return tunnel;
  }

  async _closeTunnel(serviceConfig: ThriftServiceConfig): Promise<void> {
    const serviceConfigId = genConfigId(serviceConfig);
    const tunnelCacheEntry = this._tunnelByServiceConfigId.get(serviceConfigId);
    if (tunnelCacheEntry == null) {
      throw new Error(`Expected tunnel to be open: ${serviceConfig.name}`);
    }
    if (tunnelCacheEntry.refCount === 1) {
      this._tunnelByServiceConfigId.delete(serviceConfigId);
      tunnelCacheEntry.tunnel.close();
      await this._closeRemoteServer(serviceConfig.name);
    } else {
      tunnelCacheEntry.refCount -= 1;
    }
  }

  close(): void {
    if (this._isClosed) {
      return;
    }
    this._isClosed = true;
    this._logger.info('Close Big-Dig thrift client manager!');
    for (const client of this._clientMap.values()) {
      client.close();
    }
    this._availableServices.clear();
    this._emitter.removeAllListeners();
  }
}
