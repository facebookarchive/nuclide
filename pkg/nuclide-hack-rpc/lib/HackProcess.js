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
import type {FileEditEvent} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {TextEdit} from './HackConnectionService';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {FileVersion} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {HackCompletionsResult} from './rpc-types';
import type {ProcessMaker} from '../../nuclide-rpc/lib/RpcProcess';
import type {Completion} from '../../nuclide-language-service/lib/LanguageService';

import nuclideUri from '../../commons-node/nuclideUri';
import {asyncExecute, safeSpawn} from '../../commons-node/process';
import {maybeToString} from '../../commons-node/string';
import {RpcProcess} from '../../nuclide-rpc';
import {getHackCommand, findHackConfigDir, HACK_FILE_EXTENSIONS} from './hack-config';
import {ServiceRegistry, loadServicesConfig} from '../../nuclide-rpc';
import {localNuclideUriMarshalers} from '../../nuclide-marshalers-common';
import invariant from 'assert';
import {
  FileCache,
  FileVersionNotifier,
  FileEventKind,
} from '../../nuclide-open-files-rpc';
import {Cache, DISPOSE_VALUE} from '../../commons-node/cache';
import {Observable} from 'rxjs';
import {getBufferAtVersion} from '../../nuclide-open-files-rpc';
import {hasPrefix, findHackPrefix, convertCompletions} from './Completions';

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

class HackProcess extends RpcProcess {
  _hhconfigPath: string;
  _fileCache: FileCache;
  _fileSubscription: rxjs$ISubscription;
  _fileVersionNotifier: FileVersionNotifier;

  constructor(
    fileCache: FileCache,
    name: string,
    createProcess: ProcessMaker,
    hhconfigPath: string,
  ) {
    super(name, getServiceRegistry(), createProcess, logMessage);
    this._fileCache = fileCache;
    this._fileVersionNotifier = new FileVersionNotifier();
    this._hhconfigPath = hhconfigPath;

    const service = this.getConnectionService();
    this._fileSubscription = fileCache.observeFileEvents()
      // TODO: Filter on hhconfigPath
      .filter(fileEvent => {
        const fileExtension = nuclideUri.extname(fileEvent.fileVersion.filePath);
        return HACK_FILE_EXTENSIONS.indexOf(fileExtension) !== -1;
      })
      .subscribe(fileEvent => {
        const filePath = fileEvent.fileVersion.filePath;
        const version = fileEvent.fileVersion.version;
        switch (fileEvent.kind) {
          case FileEventKind.OPEN:
            service.didOpenFile(filePath, version, fileEvent.contents);
            // TODO: Remove this once hack handles the initial contents in the open message.
            service.didChangeFile(
              filePath,
              version,
              [{
                text: fileEvent.contents,
              }]);
            break;
          case FileEventKind.CLOSE:
            service.didCloseFile(filePath);
            break;
          case FileEventKind.EDIT:
            service.didChangeFile(
              filePath,
              version,
              [editToHackEdit(fileEvent)],
            );
            break;
          default:
            throw new Error(`Unexpected FileEvent kind: ${JSON.stringify(fileEvent)}`);
        }
        this._fileVersionNotifier.onEvent(fileEvent);
      });
    this.observeExitCode().finally(() => { this.dispose(); });
  }

  getRoot(): string {
    return this._hhconfigPath;
  }

  getConnectionService(): HackConnectionService {
    invariant(!this.isDisposed(), 'getService called on disposed hackProcess');
    return this.getService('HackConnectionService');
  }

  async getBufferAtVersion(fileVersion: FileVersion): Promise<?simpleTextBuffer$TextBuffer> {
    const buffer = await getBufferAtVersion(fileVersion);
    // Must also wait for edits to be sent to Hack
    if (!(await this._fileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
      return null;
    }
    return buffer != null && buffer.changeCount === fileVersion.version ? buffer : null;
  }

  async getAutocompleteSuggestions(
    fileVersion: FileVersion,
    position: atom$Point,
    activatedManually: boolean,
  ): Promise<Array<Completion>> {
    const filePath = fileVersion.filePath;
    logger.logTrace(`Attempting Hack Autocomplete: ${filePath}, ${position.toString()}`);
    const buffer = await this.getBufferAtVersion(fileVersion);
    if (buffer == null) {
      return [];
    }
    const contents = buffer.getText();
    const offset = buffer.characterIndexForPosition(position);

    const replacementPrefix = findHackPrefix(buffer, position);
    if (replacementPrefix === '' && !hasPrefix(buffer, position)) {
      return [];
    }

    const line = position.row + 1;
    const column = position.column + 1;
    const service = this.getConnectionService();

    logger.logTrace('Got Hack Service');
    return convertCompletions(
      contents,
      offset,
      replacementPrefix,
      // TODO: Include version number to ensure agreement on file version.
      (await service.getCompletions(filePath, {line, column}): ?HackCompletionsResult));
  }

  dispose(): void {
    if (!this.isDisposed()) {
      // Atempt to send disconnect message before shutting down connection
      try {
        logger.logTrace('Attempting to disconnect cleanly from HackProcess');
        this.getConnectionService().disconnect();
      } catch (e) {
        // Failing to send the shutdown is not fatal...
        // ... continue with shutdown.
        logger.logError('Hack Process died before disconnect() could be sent.');
      }
      super.dispose();
      this._fileVersionNotifier.dispose();
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

export async function getHackProcess(
  fileCache: FileCache,
  filePath: string,
): Promise<?HackProcess> {
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

// Ensures that the only attached HackProcesses are those for the given configPaths.
// Closes all HackProcesses not in configPaths, and starts new HackProcesses for any
// paths in configPaths.
export function ensureProcesses(fileCache: FileCache, configPaths: Set<NuclideUri>): void {
  processes.get(fileCache).setKeys(configPaths);
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

export function observeConnections(fileCache: FileCache): Observable<HackConnectionService> {
  logger.logInfo('observing connections');
  return processes.get(fileCache).observeValues()
    .switchMap(process => Observable.fromPromise(process))
    .filter(process => process != null)
    .map(process => {
      invariant(process != null);
      logger.logInfo(`Observing process ${process._hhconfigPath}`);
      return process.getConnectionService();
    });
}
