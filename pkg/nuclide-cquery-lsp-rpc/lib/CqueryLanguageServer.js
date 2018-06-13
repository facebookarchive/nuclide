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
import type {CqueryProject, RequestLocationsResult} from './types';
import type {CqueryLanguageService} from '..';

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

  async requestLocationsCommand(
    methodName: string,
    path: NuclideUri,
    point: atom$Point,
  ): Promise<RequestLocationsResult> {
    const cqueryProcess = await this.getLanguageServiceForFile(path);
    if (cqueryProcess) {
      return cqueryProcess.requestLocationsCommand(methodName, path, point);
    } else {
      this._host.consoleNotification(
        this._languageId,
        'warning',
        'Could not freshen: no cquery index found for ' + path,
      );
      return [];
    }
  }

  async freshenIndexForFile(file: NuclideUri): Promise<void> {
    const cqueryProcess = await this.getLanguageServiceForFile(file);
    if (cqueryProcess) {
      cqueryProcess.freshenIndex();
    } else {
      this._host.consoleNotification(
        this._languageId,
        'warning',
        'Could not freshen: no cquery index found for ' + file,
      );
    }
  }

  async deleteProject(project: CqueryProject): Promise<void> {}
}
