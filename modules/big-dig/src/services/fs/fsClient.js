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

import type {createThriftClientOptions} from '../../common/thriftService-types';
import type {IThriftServiceClient} from '../../common/thriftService-types';

import thrift from 'thrift';
import RemoteFileSystemService from './gen-nodejs/RemoteFileSystemService';
import filesystem_types from './gen-nodejs/filesystem_types';
import {getLogger} from 'log4js';

/**
 * Wrapper class of raw thrift client which provide more methods, e.g. close()
 * e.g. initialze(), close() etc.
 */
export class RemoteFileSystemClient implements IThriftServiceClient {
  _connection: thrift.Connection;
  _client: thrift.client;
  _options: createThriftClientOptions;
  _logger: log4js$Logger;

  constructor(options: createThriftClientOptions) {
    this._options = options;
    this._logger = getLogger('fs-thrift-client');
  }

  async initialize(): Promise<void> {
    if (this._client != null) {
      return;
    }
    const transport = thrift.TBufferedTransport();
    const protocol = thrift.TBinaryProtocol();

    // Here we always create connection connected to localhost
    this._connection = thrift.createConnection(
      'localhost',
      this._options.port,
      {
        transport,
        protocol,
      },
    );
    this._connection.on('error', error => {
      throw error;
    });
    this._client = thrift.createClient(
      RemoteFileSystemService,
      this._connection,
    );
  }

  watch(path: string, options: filesystem_types.WatchOpt): Promise<void> {
    const watchOpts = options || {recursive: true, excludes: []};
    return this._client.watch(path, watchOpts);
  }

  /**
   * @return Promise<Array<filesystem_types.FileChangeEvent>>
   */
  pollFileChanges(): Promise<any> {
    return this._client.pollFileChanges();
  }

  mkdir(path: string): Promise<void> {
    return this._client.createDirectory(path);
  }

  stat(path: string): Promise<filesystem_types.FileStat> {
    return this._client.stat(path);
  }

  readFile(path: string): Promise<Buffer> {
    return this._client.readFile(path);
  }

  writeFile(
    path: string,
    content: Buffer,
    options: filesystem_types.WriteFileOpt,
  ): Promise<void> {
    return this._client.writeFile(path, content, options);
  }

  rename(
    oldUri: string,
    newUri: string,
    options: filesystem_types.RenameOpt,
  ): Promise<void> {
    return this._client.rename(oldUri, newUri, options);
  }

  copy(
    source: string,
    destination: string,
    options: filesystem_types.CopyOpt,
  ): Promise<void> {
    return this._client.copy(source, destination, options);
  }

  getOptions(): createThriftClientOptions {
    return this._options;
  }

  close() {
    this._logger.info('Close remote file system thrift service client...');
    this._connection.end();
  }
}

/**
 * Creates a remote file system thrift client.
 */
export async function createThriftClient(
  options: createThriftClientOptions,
): Promise<RemoteFileSystemClient> {
  try {
    const client = new RemoteFileSystemClient(options);
    await client.initialize();
    return client;
  } catch (err) {
    getLogger().error('Failed to created remote file system thrift client!');
    throw err;
  }
}
