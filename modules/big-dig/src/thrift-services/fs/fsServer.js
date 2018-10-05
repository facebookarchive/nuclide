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

import thrift from 'thrift';
import ThriftFileSystemService from './gen-nodejs/ThriftFileSystemService';
import {ThriftFileSystemServiceHandler} from './ThriftFileSystemServiceHandler';
import {scanPortsToListen} from '../../common/ports';
import {getLogger} from 'log4js';
import {WatchmanClient} from 'nuclide-watchman-helpers';

/**
 * Wrapper class of raw thrift server which provide more methods
 * e.g. initialze(), close() etc.
 */
export class RemoteFileSystemServer {
  _thriftFileSystemserviceHandler: ThriftFileSystemServiceHandler;
  _server: thrift.Server;
  _port: number;
  _logger: log4js$Logger;
  _watcher: WatchmanClient;

  constructor(port: number) {
    this._port = port;
    this._logger = getLogger('fs-thrift-server');
    this._watcher = new WatchmanClient();
    this._thriftFileSystemserviceHandler = new ThriftFileSystemServiceHandler(
      this._watcher,
    );
  }

  async initialize(): Promise<void> {
    if (this._server != null) {
      return;
    }

    this._server = thrift.createServer(
      ThriftFileSystemService,
      this._thriftFileSystemserviceHandler,
    );

    this._server.on('error', error => {
      throw error;
    });

    const isServerListening = await scanPortsToListen(
      this._server,
      String(this._port),
    );

    if (!isServerListening) {
      throw new Error(`All ports in range "${this._port}" are already in use`);
    }
  }

  getPort(): number {
    return this._server.address().port;
  }

  close() {
    this._logger.info('Close remote file system thrift service server...');
    this._server = null;
    this._watcher.dispose();
    this._thriftFileSystemserviceHandler.dispose();
  }
}
