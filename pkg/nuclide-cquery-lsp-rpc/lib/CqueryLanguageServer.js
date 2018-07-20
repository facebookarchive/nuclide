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
import type {HostServices} from '../../nuclide-language-service-rpc/lib/rpc-types';
import type {FileVersion} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {StatusData} from '../../nuclide-language-service/lib/LanguageService';
import type {CqueryLanguageService} from '..';

import fsPromise from 'nuclide-commons/fsPromise';
import {Observable, ConnectableObservable} from 'rxjs';
import {MultiProjectLanguageService} from '../../nuclide-language-service-rpc';
import {CqueryLanguageClient} from './CqueryLanguageClient';

export default class CqueryLanguageServer
  extends MultiProjectLanguageService<CqueryLanguageClient>
  implements CqueryLanguageService {
  _host: HostServices;
  _languageId: string;

  constructor(host: HostServices) {
    super();
    this._host = host;
    this._languageId = 'cquery';
  }

  async restartProcessForFile(file: NuclideUri): Promise<void> {
    const projectDir = await this.findProjectDir(file);
    const cqueryProcess = await this.getLanguageServiceForFile(file);
    if (projectDir != null && cqueryProcess != null) {
      const cacheDir = cqueryProcess.getCacheDirectory();
      this._processes.delete(projectDir);
      await fsPromise.rimraf(cacheDir);
    } else {
      this._host.consoleNotification(
        this._languageId,
        'warning',
        'Could not restart: no cquery index found for ' + file,
      );
    }
  }

  observeStatus(fileVersion: FileVersion): ConnectableObservable<StatusData> {
    this._observeStatusPromiseResolver();
    // Concat the observable to itself in case the language service for a file
    // changes but the version has not (e.g. the underlying service restarts).
    const factory = () =>
      Observable.fromPromise(
        this.getLanguageServiceForFile(fileVersion.filePath),
      ).flatMap(
        ls =>
          // If we receive a null language service then don't restart.
          ls != null
            ? ls
                .observeStatus(fileVersion)
                .refCount()
                .concat(Observable.defer(factory))
            : Observable.empty(),
      );
    return factory().publish();
  }
}
