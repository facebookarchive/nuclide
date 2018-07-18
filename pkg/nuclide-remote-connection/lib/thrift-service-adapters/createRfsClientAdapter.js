/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {BigDigClient} from 'big-dig/src/client';
import type {ThriftClient} from 'big-dig/src/services/thrift/types';

import {memoize} from 'lodash';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {RemoteFileSystemClient} from 'big-dig/src/services/fs/types';
import {FallbackToRpcError} from './util';

// including all supported remote file system function names
export const SUPPORTED_THRIFT_RFS_FUNCTIONS: Set<string> = new Set([
  'readFile',
]);

export class ThriftRfsClientAdapter {
  _client: RemoteFileSystemClient;

  constructor(client: RemoteFileSystemClient) {
    this._client = client;
  }

  readFile(uri: NuclideUri, options?: {flag?: string}): Promise<Buffer> {
    if (nuclideUri.isInArchive(uri)) {
      return Promise.reject(
        new FallbackToRpcError(
          `Unable to read archive file: ${uri}, fallback to use RPC read method`,
        ),
      );
    }
    const path = nuclideUri.getPath(uri);
    return this._client.readFile(path);
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
