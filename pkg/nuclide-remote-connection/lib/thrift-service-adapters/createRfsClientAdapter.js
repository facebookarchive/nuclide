/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {BigDigClient} from 'big-dig/src/client';
import type {ThriftClient} from 'big-dig/src/services/thrift/types';
import type {WriteOptions} from '../../../nuclide-fs';

import fs from 'fs';
import {memoize} from 'lodash';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {RemoteFileSystemClient} from 'big-dig/src/services/fs/types';
import {
  rejectArchivePaths,
  convertToFsFileStat,
  checkArchivePathsToFallbackToRpc,
} from './util';
import filesystem_types from 'big-dig/src/services/fs/gen-nodejs/filesystem_types';

export const BUFFER_ENCODING = 'utf-8';

// including all supported remote file system function names
export const SUPPORTED_THRIFT_RFS_FUNCTIONS: Set<string> = new Set([
  'stat',
  'lstat',
  'exists',
  'readFile',
  'writeFile',
  'writeFileBuffer',
]);

export class ThriftRfsClientAdapter {
  _client: RemoteFileSystemClient;

  constructor(client: RemoteFileSystemClient) {
    this._client = client;
  }

  async _statPath(path: string): Promise<fs.Stats> {
    const thriftFileStat = await this._client.stat(path);
    return convertToFsFileStat(thriftFileStat);
  }

  async stat(uri: NuclideUri): Promise<fs.Stats> {
    try {
      checkArchivePathsToFallbackToRpc(uri, 'stat');
      return await this._statPath(nuclideUri.getPath(uri));
    } catch (err) {
      throw err;
    }
  }

  async lstat(uri: NuclideUri): Promise<fs.Stats> {
    try {
      checkArchivePathsToFallbackToRpc(uri, 'lstat');
      const thriftFileStat = await this._client.lstat(nuclideUri.getPath(uri));
      return convertToFsFileStat(thriftFileStat);
    } catch (err) {
      throw err;
    }
  }

  async exists(uri: NuclideUri): Promise<boolean> {
    try {
      checkArchivePathsToFallbackToRpc(uri, 'exists');
      await this._statPath(nuclideUri.getPath(uri));
      return true;
    } catch (error) {
      if (error.code === filesystem_types.ErrorCode.ENOENT) {
        return false;
      } else {
        throw error;
      }
    }
  }

  async readFile(uri: NuclideUri, options?: {flag?: string}): Promise<Buffer> {
    try {
      checkArchivePathsToFallbackToRpc(uri, 'readFile');
      const path = nuclideUri.getPath(uri);
      return await this._client.readFile(path);
    } catch (err) {
      throw err;
    }
  }

  async writeFile(
    uri: NuclideUri,
    content: string,
    options?: WriteOptions,
  ): Promise<void> {
    try {
      rejectArchivePaths(uri, 'writeFile');
      const data = new Buffer(content, BUFFER_ENCODING);
      await this.writeFileBuffer(uri, data, options);
    } catch (err) {
      throw err;
    }
  }

  async writeFileBuffer(
    uri: NuclideUri,
    data: Buffer,
    options?: WriteOptions,
  ): Promise<void> {
    try {
      rejectArchivePaths(uri, 'writeFileBuffer');
      const path = nuclideUri.getPath(uri);
      const writeOptions = options || {};
      await this._client.writeFile(path, data, writeOptions);
    } catch (err) {
      throw err;
    }
  }
}

export async function getOrCreateRfsClientAdapter(
  bigDigClient: BigDigClient,
): Promise<ThriftRfsClientAdapter> {
  const clientWrapper = await getOrCreateThriftClient(bigDigClient);
  return getOrCreateAdapter(clientWrapper);
}

const getOrCreateThriftClient = memoize(
  (bigDigClient: BigDigClient): Promise<ThriftClient> => {
    return bigDigClient.getOrCreateThriftClient('thrift-rfs').then(
      clientWrapper => {
        clientWrapper.onConnectionEnd(() => {
          getOrCreateThriftClient.cache.delete(bigDigClient);
        });
        return clientWrapper;
      },
      error => {
        getOrCreateThriftClient.cache.delete(bigDigClient);
        return Promise.reject(error);
      },
    );
  },
);

const getOrCreateAdapter = memoize(
  (clientWrapper: ThriftClient): ThriftRfsClientAdapter => {
    clientWrapper.onConnectionEnd(() => {
      getOrCreateAdapter.cache.delete(clientWrapper);
    });
    return new ThriftRfsClientAdapter(clientWrapper.getClient());
  },
);
