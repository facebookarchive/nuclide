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

import nuclideUri from '../../commons-node/nuclideUri';
import {asyncExecute, safeSpawn} from '../../commons-node/process';
import {maybeToString} from '../../commons-node/string';
import RpcProcess from '../../commons-node/RpcProcess';
import {getHackCommand, findHackConfigDir} from './hack-config';
import {ServiceRegistry, loadServicesConfig} from '../../nuclide-rpc';
import {localNuclideUriMarshalers} from '../../nuclide-marshalers-common';
import invariant from 'assert';
import {FileCache} from '../../nuclide-open-files-rpc';

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
    this._fileSubscription.unsubscribe();
    this._dispose();
  }

  async _dispose(): Promise<void> {
    processes.delete(this._hhconfigPath);
    // Atempt to send disconnect message
    try {
      (await this.getConnectionService()).disconnect();
    } catch (e) {
      logger.logError('Error disconnecting from Hack connection.');
    }
    super.dispose();
  }
}

// Maps hack config dir to HackProcess
const processes: Map<string, Promise<?HackProcess>> = new Map();

async function getHackProcess(fileCache: FileCache, filePath: string): Promise<?HackProcess> {
  const command = await getHackCommand();
  if (command === '') {
    return null;
  }

  const configDir = await findHackConfigDir(filePath);
  if (configDir == null) {
    return null;
  }

  let hackProcess = processes.get(configDir);
  if (hackProcess == null) {
    hackProcess = createHackProcess(fileCache, command, configDir);
    processes.set(configDir, hackProcess);
    hackProcess.then(result => {
      // If we fail to connect to hack, then retry on next request.
      if (result == null) {
        processes.delete(configDir);
      }
    });
  }
  const result: ?HackProcess = await hackProcess;
  if (result != null) {
    // TODO(peterhal): Add better error handling ...
    invariant(result._fileCache === fileCache, 'Multiple Atom windows opening same hack project');
  }
  return result;
}

async function createHackProcess(
  fileCache: FileCache,
  command: string,
  configDir: string,
): Promise<?HackProcess> {
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
