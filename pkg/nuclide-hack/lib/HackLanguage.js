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
import typeof * as HackService from '../../nuclide-hack-rpc/lib/HackService';
import type {LanguageService} from '../../nuclide-hack-rpc/lib/LanguageService';
import type {ServerConnection} from '../../nuclide-remote-connection';

import {getServiceByConnection} from '../../nuclide-remote-connection';
import {getConfig} from './config';
import {getNotifierByConnection} from '../../nuclide-open-files';
import {Observable} from 'rxjs';
import {AtomLanguageService} from './AtomLanguageService';

const HACK_SERVICE_NAME = 'HackService';

async function connectionToHackService(connection: ?ServerConnection): Promise<LanguageService> {
  const hackService: HackService = getServiceByConnection(HACK_SERVICE_NAME, connection);
  const config = getConfig();
  const useIdeConnection = config.useIdeConnection;
  // TODO:     || (await passesGK('nuclide_hack_use_persistent_connection'));
  const fileNotifier = await getNotifierByConnection(connection);
  const languageService = await hackService.initialize(
    config.hhClientPath,
    useIdeConnection,
    config.logLevel,
    fileNotifier);

  return languageService;
}

export const hackLanguageService = new AtomLanguageService(connectionToHackService);

export function getHackLanguageForUri(uri: ?NuclideUri): Promise<?LanguageService> {
  return hackLanguageService.getLanguageServiceForUri(uri);
}

export function isFileInHackProject(fileUri: NuclideUri): Promise<bool> {
  return hackLanguageService.isFileInProject(fileUri);
}

export function observeHackLanguages(): Observable<LanguageService> {
  return hackLanguageService.observeLanguageServices();
}
