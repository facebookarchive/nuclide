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

import {ConnectionCache, getServiceByConnection} from '../../nuclide-remote-connection';
import {getConfig} from './config';
import {getNotifierByConnection} from '../../nuclide-open-files';
import {Observable} from 'rxjs';

const HACK_SERVICE_NAME = 'HackService';

const connectionToHackLanguage: ConnectionCache<LanguageService>
  = new ConnectionCache(connectionToHackService);

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

export async function getHackLanguageForUri(uri: ?NuclideUri): Promise<?LanguageService> {
  const result = connectionToHackLanguage.getForUri(uri);
  return (result == null) ? null : await result;
}

export function clearHackLanguageCache(): void {
  connectionToHackLanguage.dispose();
}

export async function isFileInHackProject(fileUri: NuclideUri): Promise<bool> {
  const language = await getHackLanguageForUri(fileUri);
  if (language == null) {
    return false;
  }
  return await language.isFileInProject(fileUri);
}

export function observeHackLanguages(): Observable<LanguageService> {
  return connectionToHackLanguage.observeValues()
    .switchMap(hackLanguage => {
      return Observable.fromPromise(hackLanguage);
    });
}
