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

import type {AdditionalLogFile} from '../../nuclide-logging/lib/rpc-types';
import type {LanguageService} from './LanguageService';

import {arrayFlatten} from 'nuclide-commons/collection';
import {ConnectionCache} from '../../nuclide-remote-connection';

export class AdditionalLogFileProvider<T: LanguageService> {
  _connectionToLanguageService: ConnectionCache<T>;

  constructor(connectionToLanguageService: ConnectionCache<T>) {
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(
    connectionToLanguageService: ConnectionCache<T>,
  ): IDisposable {
    return atom.packages.serviceHub.provide(
      'additional-log-files',
      '0.0.0',
      new AdditionalLogFileProvider(connectionToLanguageService),
    );
  }

  async getAdditionalLogFiles(): Promise<Array<AdditionalLogFile>> {
    const connections = Array.from(this._connectionToLanguageService.keys());
    const results = await Promise.all(
      connections.map(async connection => {
        const service = await this._connectionToLanguageService.get(connection);
        const subResults = await service.getAdditionalLogFiles();
        const prefix =
          connection == null ? '' : connection.getRemoteHostname() + ':';
        return subResults.map(log => ({...log, title: prefix + log.title}));
      }),
    );
    return arrayFlatten(results);
  }
}
