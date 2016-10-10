'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {LanguageService} from '../../nuclide-hack-rpc/lib/LanguageService';
import type {ServerConnection} from '../../nuclide-remote-connection';

import {ConnectionCache} from '../../nuclide-remote-connection';
import {Observable} from 'rxjs';

export class AtomLanguageService {
  _connectionToLanguageService: ConnectionCache<LanguageService>;

  constructor(languageServiceFactory: (connection: ?ServerConnection) => Promise<LanguageService>) {
    this._connectionToLanguageService = new ConnectionCache(languageServiceFactory);
  }

  async getLanguageServiceForUri(fileUri: ?NuclideUri): Promise<?LanguageService> {
    const result = this._connectionToLanguageService.getForUri(fileUri);
    return (result == null) ? null : await result;
  }

  async isFileInProject(fileUri: NuclideUri): Promise<bool> {
    const languageService = await this.getLanguageServiceForUri(fileUri);
    return (languageService != null) && await languageService.isFileInProject(fileUri);
  }

  observeLanguageServices(): Observable<LanguageService> {
    return this._connectionToLanguageService.observeValues()
      .switchMap(languageService => {
        return Observable.fromPromise(languageService);
      });
  }

  reset(): void {
    this._connectionToLanguageService.dispose();
  }
}
