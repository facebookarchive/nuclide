/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {ConnectableObservable, Observable} from 'rxjs';

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {LanguageService} from '../../nuclide-language-service/lib/LanguageService';
import type {FileVersion, FileNotifier} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {Outline} from '../../nuclide-outline-view/lib/rpc-types';

import invariant from 'assert';
import {Subject} from 'rxjs';

import {
  ServerLanguageService,
  MultiProjectLanguageService,
} from '../../nuclide-language-service-rpc';
import {FileCache, getBufferAtVersion} from '../../nuclide-open-files-rpc';

import {getCategoryLogger} from '../../nuclide-logging';

export type Loc = {
  file: NuclideUri,
  point: atom$Point,
};

// If types are added here, make sure to also add them to FlowConstants.js. This needs to be the
// canonical type definition so that we can use these in the service framework.
export type ServerStatusType =
  'failed' |
  'unknown' |
  'not running' |
  'not installed' |
  'busy' |
  'init' |
  'ready';

export type ServerStatusUpdate = {
  pathToRoot: NuclideUri,
  status: ServerStatusType,
};

import {FlowSingleProjectLanguageService} from './FlowSingleProjectLanguageService';
import {FlowServiceState} from './FlowServiceState';

let state: ?FlowServiceState = null;

function getState(): FlowServiceState {
  if (state == null) {
    state = new FlowServiceState();
  }
  return state;
}

export function dispose(): void {
  if (state != null) {
    state.dispose();
    state = null;
  }
}

const serverStatuses: Subject<Observable<ServerStatusUpdate>> = new Subject();
let currentLanguageService: ?FlowLanguageService = null;

export async function initialize(
  fileNotifier: FileNotifier,
): Promise<LanguageService> {
  invariant(fileNotifier instanceof FileCache);
  const fileCache: FileCache = fileNotifier;
  const ls = new FlowLanguageService(fileCache);
  serverStatuses.next(ls.getServerStatusUpdates().refCount());
  currentLanguageService = ls;
  return ls;
}

class FlowLanguageService
    extends MultiProjectLanguageService<ServerLanguageService<FlowSingleProjectLanguageService>> {
  constructor(fileCache: FileCache) {
    const logger = getCategoryLogger('Flow');
    super(
      logger,
      fileCache,
      '.flowconfig',
      ['.js', '.jsx'],
      projectDir => {
        const execInfoContainer = getState().getExecInfoContainer();
        const singleProjectLS = new FlowSingleProjectLanguageService(projectDir, execInfoContainer);
        const languageService = new ServerLanguageService(fileCache, singleProjectLS);
        return Promise.resolve(languageService);
      },
    );
  }

  async getOutline(
    fileVersion: FileVersion,
  ): Promise<?Outline> {
    const ls = await this.getLanguageServiceForFile(fileVersion.filePath);
    if (ls != null) {
      return ls.getOutline(fileVersion);
    } else {
      const buffer = await getBufferAtVersion(fileVersion);
      if (buffer == null) {
        return null;
      }
      return FlowSingleProjectLanguageService.getOutline(
        fileVersion.filePath,
        buffer,
        null,
        getState().getExecInfoContainer(),
      );
    }
  }

  getServerStatusUpdates(): ConnectableObservable<ServerStatusUpdate> {
    return this.observeLanguageServices().mergeMap(languageService => {
      const singleProjectLS: FlowSingleProjectLanguageService =
          languageService.getSingleFileLanguageService();
      const pathToRoot = singleProjectLS.getPathToRoot();
      return singleProjectLS
        .getServerStatusUpdates()
        .map(status => ({pathToRoot, status}));
    }).publish();
  }

  async getAst(filePath: ?NuclideUri, currentContents: string): Promise<?any> {
    const ls = filePath != null ? await this.getLanguageServiceForFile(filePath) : null;
    let singleLS: ?FlowSingleProjectLanguageService;
    if (ls == null) {
      singleLS = null;
    } else {
      singleLS = ls.getSingleFileLanguageService();
    }
    return FlowSingleProjectLanguageService.flowGetAst(
      singleLS,
      currentContents,
      getState().getExecInfoContainer(),
    );
  }

  async allowServerRestart(): Promise<void> {
    const languageServices = await this.getAllLanguageServices();
    const flowLanguageServices = languageServices.map(ls => ls.getSingleFileLanguageService());
    flowLanguageServices.forEach(ls => ls.allowServerRestart());
  }
}

export function getServerStatusUpdates(): ConnectableObservable<ServerStatusUpdate> {
  return serverStatuses.concatAll().publish();
}

export function flowGetAst(
  file: ?NuclideUri,
  currentContents: string,
): Promise<?any> {
  if (currentLanguageService == null) {
    return Promise.resolve(null);
  }
  return currentLanguageService.getAst(file, currentContents);
}

export function allowServerRestart(): void {
  if (currentLanguageService != null) {
    currentLanguageService.allowServerRestart();
  }
}
