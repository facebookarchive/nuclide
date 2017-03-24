/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
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
import {hasPrefix, convertCompletions} from './Completions';
import {findHackPrefix} from '../../nuclide-hack-common/lib/autocomplete';

// From hphp/hack/src/utils/exit_status.ml
const HACK_SERVER_ALREADY_EXISTS_EXIT_CODE = 77;
const HACK_IDE_NEW_CLIENT_CONNECTED_EXIT_CODE = 207;

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
  logger.logTrace(`Hack Connection message ${direction}: '${message}'`);
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
  ): Promise<?Array<Completion>> {
    const filePath = fileVersion.filePath;
    logger.log(`Attempting Hack Autocomplete: ${filePath}, ${position.toString()}`);
    const buffer = await this.getBufferAtVersion(fileVersion);
    if (buffer == null) {
      return [];
    }
    const contents = buffer.getText();
    const offset = buffer.characterIndexForPosition(position);

    const replacementPrefix = findHackPrefix(buffer, position);
    if (replacementPrefix === '' && !hasPrefix(buffer, position)) {
      return null;
    }

    const line = position.row + 1;
    const column = position.column + 1;
    const service = this.getConnectionService();

    logger.log('Got Hack Service');
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
        logger.log('Attempting to disconnect cleanly from HackProcess');
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
    } else {
      logger.logInfo(`HackProcess attempt to shut down already disposed ${this.getRoot()}.`);
    }
  }
}

// Maps FileCache => hack config dir => HackProcess
const processes: Cache<FileCache, Cache<NuclideUri, Promise<HackProcess>>>
  = new Cache(
    fileCache => new Cache(
      hackRoot => retryCreateHackProcess(fileCache, hackRoot),
      value => { value.then(DISPOSE_VALUE); }),
    DISPOSE_VALUE);

// TODO: Is there any situation where these can be disposed before the
//       remote connection is terminated?
// Remove fileCache when the remote connection shuts down
processes.observeKeys().subscribe(
  fileCache => {
    fileCache.observeFileEvents().ignoreElements().subscribe(
      undefined, // next
      undefined, // error
      () => {
        logger.logInfo('fileCache shutting down.');
        closeProcesses(fileCache);
      },
    );
  });

export async function getHackProcess(
  fileCache: FileCache,
  filePath: string,
): Promise<HackProcess> {
  const configDir = await findHackConfigDir(filePath);
  if (configDir == null) {
    throw new Error('Failed to find Hack config directory');
  }
  return processes.get(fileCache).get(configDir);
}

// Ensures that the only attached HackProcesses are those for the given configPaths.
// Closes all HackProcesses not in configPaths, and starts new HackProcesses for any
// paths in configPaths.
export function ensureProcesses(fileCache: FileCache, configPaths: Set<NuclideUri>): void {
  logger.logInfo(`Hack ensureProcesses. ${Array.from(configPaths).join(', ')}`);
  processes.get(fileCache).setKeys(configPaths);
}

// Closes all HackProcesses for the given fileCache.
export function closeProcesses(fileCache: FileCache): void {
  logger.logInfo('Hack closeProcesses');
  if (processes.has(fileCache)) {
    logger.logInfo(
      `Shutting down HackProcesses ${Array.from(processes.get(fileCache).keys()).join(',')}`);
    processes.delete(fileCache);
  }
}

async function retryCreateHackProcess(
  fileCache: FileCache,
  hackRoot: string,
): Promise<HackProcess> {
  let hackProcess = null;
  let waitTimeMs = 500;
  // Disable no-await-in-loop because we do want these iterations to be serial.
  /* eslint-disable no-await-in-loop */
  while (hackProcess == null) {
    try {
      hackProcess = await createHackProcess(fileCache, hackRoot);
    } catch (e) {
      logger.logError(`Couldn't create HackProcess: ${e.message}`);
      logger.logError(`Waiting ${waitTimeMs}ms before retrying...`);

      await new Promise(resolve => setTimeout(resolve, waitTimeMs));
      waitTimeMs *= 2;

      const hackProcessNeeded =
        processes.has(fileCache) && processes.get(fileCache).has(hackRoot);

      // If the HackProcess is no longer needed, or we would be waiting
      // longer than a few seconds, just give up.
      if (!hackProcessNeeded || waitTimeMs > 4000) {
        logger.logError(`Giving up on creating HackProcess: ${e.message}`);
        // Remove the (soon-to-be) rejected promise from our processes cache so
        // that the next time someone attempts to get this connection, we'll try
        // to create it.
        if (hackProcessNeeded) {
          processes.get(fileCache).delete(hackRoot);
        }
        throw e;
      }
    }
  }
  /* eslint-enable no-await-in-loop */
  return hackProcess;
}

async function createHackProcess(
  fileCache: FileCache,
  configDir: string,
): Promise<HackProcess> {
  const command = await getHackCommand();
  if (command === '') {
    throw new Error("Couldn't find Hack command");
  }

  logger.logInfo(`Creating new hack connection for ${configDir}: ${command}`);
  logger.logInfo(`Current PATH: ${maybeToString(process.env.PATH)}`);
  const startServerResult = await asyncExecute(command, ['start', configDir]);
  logger.logInfo(
    `Hack connection start server results:\n${JSON.stringify(startServerResult, null, 2)}\n`);
  const {exitCode} = startServerResult;
  if (exitCode !== 0 && exitCode !== HACK_SERVER_ALREADY_EXISTS_EXIT_CODE) {
    throw new Error(`Hack server start failed with code: ${String(exitCode)}`);
  }
  const createProcess = () => safeSpawn(command, ['ide', configDir]);
  const hackProcess = new HackProcess(
    fileCache, `HackProcess-${configDir}`, createProcess, configDir);

  // If the process exits unexpectedly, create a new one immediately.
  const startTime = Date.now();
  hackProcess.observeExitCode().subscribe(message => {
    if (message.exitCode === HACK_IDE_NEW_CLIENT_CONNECTED_EXIT_CODE) {
      logger.logInfo('Not reconnecting Hack process--another client connected');
      return;
    }
    // This should always be true because the exit code sequence is terminated
    // immediately after the HackProcess disposes itself, and it removes itself
    // from the processes cache during disposal.
    invariant(
      !processes.has(fileCache) ||
      !processes.get(fileCache).has(configDir),
      'Attempt to reconnect Hack process when connection already exists',
    );
    // If the process exited too quickly (possibly due to a crash), don't get
    // stuck in a loop creating and crashing it.
    const processUptimeMs = Date.now() - startTime;
    if (processUptimeMs < 1000) {
      logger.logError('Hack process exited in <1s; not reconnecting');
      return;
    }
    logger.logInfo(`Reconnecting with new HackProcess for ${configDir}`);
    processes.get(fileCache).get(configDir);
  });

  return hackProcess;
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
