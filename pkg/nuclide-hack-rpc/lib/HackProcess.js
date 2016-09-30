'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as HackConnectionService from './HackConnectionService';
import type {ProcessMaker} from '../../commons-node/RpcProcess';
import type {FileEditEvent} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {TextEdit} from './HackConnectionService';
import type {NuclideUri} from '../../commons-node/nuclideUri';

import nuclideUri from '../../commons-node/nuclideUri';
import {asyncExecute, safeSpawn} from '../../commons-node/process';
import {maybeToString} from '../../commons-node/string';
import RpcProcess from '../../commons-node/RpcProcess';
import {getHackCommand, findHackConfigDir} from './hack-config';
import {ServiceRegistry, loadServicesConfig} from '../../nuclide-rpc';
import {localNuclideUriMarshalers} from '../../nuclide-marshalers-common';
import invariant from 'assert';
import {FileCache} from '../../nuclide-open-files-rpc';
import {Cache, DISPOSE_VALUE} from '../../commons-node/cache';

// From https://reviews.facebook.net/diffusion/HHVM/browse/master/hphp/hack/src/utils/exit_status.ml
const HACK_SERVER_ALREADY_EXISTS_EXIT_CODE = 77;

import {logger} from './hack-config';

let serviceRegistry: ?ServiceRegistry = null;

function getServiceRegistry(): ServiceRegistry {
  if (serviceRegistry == null) {
    serviceRegistry = new ServiceRegistry(
      [localNuclideUriMarshalers],
      loadServicesConfig(nuclideUri.join(__dirname, '..')),
    );
  }
  return serviceRegistry;
}

function logMessage(direction: string, message: string): void {
  logger.logInfo(`Hack Connection message ${direction}: '${message}'`);
}

// From hack/src/utils/findUtils.ml
const HACK_FILE_EXTENSIONS: Array<string> = [
  '.php',  // normal php file
  '.hh',   // Hack extension some open source code is starting to use
  '.phpt', // our php template files
  '.hhi',  // interface files only visible to the type checker
  '.xhp',  // XHP extensions
];

class HackProcess extends RpcProcess {
  _hhconfigPath: string;
  _fileCache: FileCache;
  _fileSubscription: rx$ISubscription;

  constructor(
    fileCache: FileCache,
    name: string,
    createProcess: ProcessMaker,
    hhconfigPath: string,
  ) {
    super(name, getServiceRegistry(), createProcess, logMessage);
    this._fileCache = fileCache;
    this._hhconfigPath = hhconfigPath;

    const service = this.getConnectionService();
    this._fileSubscription = fileCache.observeFileEvents()
      .filter(fileEvent => {
        const fileExtension = nuclideUri.extname(fileEvent.fileVersion.filePath);
        return HACK_FILE_EXTENSIONS.indexOf(fileExtension) !== -1;
      })
      .subscribe(fileEvent => {
        const filePath = fileEvent.fileVersion.filePath;
        const version = fileEvent.fileVersion.version;
        switch (fileEvent.kind) {
          case 'open':
            service.didOpenFile(filePath);
            service.didChangeFile(
              filePath,
              version,
              [{text: fileEvent.contents}],
            );
            break;
          case 'close':
            service.didCloseFile(filePath);
            break;
          case 'edit':
            service.didChangeFile(
              filePath,
              version,
              [editToHackEdit(fileEvent)],
            );
            break;
          default:
            throw new Error(`Unexpected FileEvent kind: ${JSON.stringify(fileEvent)}`);
        }
      });
  }

  getRoot(): string {
    return this._hhconfigPath;
  }

  getConnectionService(): HackConnectionService {
    invariant(!this.isDisposed(), 'getService called on disposed hackProcess');
    return this.getService('HackConnectionService');
  }

  dispose(): void {
    if (!this.isDisposed()) {
      // Atempt to send disconnect message before shutting down connection
      this.getConnectionService().disconnect();
      super.dispose();
      this._fileSubscription.unsubscribe();
      if (processes.has(this._fileCache)) {
        processes.get(this._fileCache).delete(this._hhconfigPath);
      }
    }
  }
}

// Maps FileCache => hack config dir => HackProcess
const processes: Cache<FileCache, Cache<NuclideUri, Promise<?HackProcess>>>
  = new Cache(
    fileCache => new Cache(
      hackRoot => createHackProcess(fileCache, hackRoot),
      value => {
        value.then(process => {
          if (process != null) {
            process.dispose();
          }
        });
      }),
    DISPOSE_VALUE);

// TODO: Is there any situation where these can be disposed before the
//       remote connection is terminated?
// Remove fileCache when the remote connection shuts down
processes.observeKeys().subscribe(
  fileCache => {
    fileCache.observeFileEvents().ignoreElements().subscribe(
      undefined, // next
      undefined, // error
      () => { processes.delete(fileCache); },
    );
  });

async function getHackProcess(fileCache: FileCache, filePath: string): Promise<?HackProcess> {
  const configDir = await findHackConfigDir(filePath);
  if (configDir == null) {
    return null;
  }

  const processCache = processes.get(fileCache);
  const hackProcess = processCache.get(configDir);
  hackProcess.then(result => {
    // If we fail to connect to hack, then retry on next request.
    if (result == null) {
      processCache.delete(configDir);
    }
  });
  return await hackProcess;
}

async function createHackProcess(
  fileCache: FileCache,
  configDir: string,
): Promise<?HackProcess> {
  const command = await getHackCommand();
  if (command === '') {
    return null;
  }

  logger.logInfo(`Creating new hack connection for ${configDir}: ${command}`);
  logger.logInfo(`Current PATH: ${maybeToString(process.env.PATH)}`);
  const startServerResult = await asyncExecute(command, ['start', configDir]);
  logger.logInfo(
    `Hack connection start server results:\n${JSON.stringify(startServerResult, null, 2)}\n`);
  if (startServerResult.exitCode !== 0 &&
      startServerResult.exitCode !== HACK_SERVER_ALREADY_EXISTS_EXIT_CODE) {
    return null;
  }
  const createProcess = () => safeSpawn(command, ['ide', configDir]);
  return new HackProcess(fileCache, `HackProcess-${configDir}`, createProcess, configDir);
}

export async function getHackConnectionService(
  fileCache: FileCache,
  filePath: string,
): Promise<?HackConnectionService> {
  const process = await getHackProcess(fileCache, filePath);
  if (process == null) {
    return null;
  }
  return process.getConnectionService();
}

function editToHackEdit(editEvent: FileEditEvent): TextEdit {
  const {start, end} = editEvent.oldRange;
  return {
    range: {
      start: {line: start.row + 1, column: start.column + 1},
      end: {line: end.row + 1, column: end.column + 1},
    },
    text: editEvent.newText,
  };
}
