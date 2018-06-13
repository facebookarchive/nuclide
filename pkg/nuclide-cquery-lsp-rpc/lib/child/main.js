/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Message} from 'vscode-jsonrpc';
import type {
  DidOpenTextDocumentParams,
  DidCloseTextDocumentParams,
} from '../../../nuclide-vscode-language-service-rpc/lib/protocol';

import performanceNow from 'nuclide-commons/performanceNow';
import os from 'os';
import child_process from 'child_process';
import log4js from 'log4js';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {memoryUsagePerPid} from 'nuclide-commons/process';
import {serializeAsyncCall} from 'nuclide-commons/promise';
import SafeStreamMessageReader from 'nuclide-commons/SafeStreamMessageReader';
import {Observable} from 'rxjs';
import {StreamMessageWriter} from 'vscode-jsonrpc';
import {track} from '../../../nuclide-analytics';
import {getCompilationDatabaseHandler} from '../../../nuclide-buck-rpc/lib/BuckClangCompilationDatabase';
import {MessageType} from '../../../nuclide-vscode-language-service-rpc/lib/protocol';
import {readCompilationFlags} from '../../../nuclide-clang-rpc/lib/clang-flags-reader';
import {lspUri_localPath} from '../../../nuclide-vscode-language-service-rpc/lib/convert';
import {findNearestCompilationDbDir} from '../CompilationDatabaseFinder';
import {addDbMessage, windowMessage} from './messages';
import {setMessageWriter} from './WindowLogAppender';

type FlagsInfo = {flagsFile: string, databaseDirectory: string};

// Percentage of total memory cquery may not exceed.
const DEFAULT_MEMORY_LIMIT = 30;
// Time between checking cquery memory usage, in millseconds.
const MEMORY_CHECK_INTERVAL = 15000;

// Read and store arguments.
const loggingFile = process.argv[2];
const recordingFile = process.argv[3];
const libclangLogging = process.argv[4] === 'true';

// Log to stderr to avoid polluting the JsonRpc stdout.
// Also send errors to the client's log.
log4js.configure({
  appenders: [
    {type: 'stderr'},
    {type: require.resolve('./WindowLogAppender'), level: 'error'},
  ],
});
const logger = log4js.getLogger('nuclide-cquery-wrapper');
const compilationDbHandler = getCompilationDatabaseHandler({
  flavorsForTarget: [],
  args: [],
  useDefaultPlatform: true,
});
// Map source file to its flags def file (either buck or compile_commands.json)
const knownFileMap: Map<string, string> = new Map();
// Set of known compilation database folders.
const knownCompileCommandsSet: Set<string> = new Set();
// Map of pending opened files to their command resolution promise.
// A file in this map means that we've seen its didOpen but have not resolved
// its compile commands from Buck or the filesystem.
// Used to resolve races between open/close events.
const pendingOpenRequests: Map<string, Promise<?FlagsInfo>> = new Map();

// Message handlers defined here perform processing on messages from the
// client (Nuclide) and then forward to the server (cquery).
function initializeClientMessageHandlers(
  serverWriter: StreamMessageWriter,
  clientWriter: StreamMessageWriter,
): {[key: string]: (Message) => mixed} {
  return {
    'textDocument/didOpen': async message => {
      const params = ((message: any).params: DidOpenTextDocumentParams);
      const path = lspUri_localPath(params.textDocument.uri);
      if (knownFileMap.has(path)) {
        // If we have seen the path then don't find a compilation database again.
        return serverWriter.write(message);
      } else if (pendingOpenRequests.has(path)) {
        // If there's another open request still in flight then drop the request.
        clientWriter.write(
          windowMessage(MessageType.Info, `${path} still being opened`),
        );
        return;
      }
      const startTime = performanceNow();
      clientWriter.write(
        windowMessage(MessageType.Info, `Looking for flags of ${path}`),
      );
      let flagsInfo = null;
      let resolveOpenRequest = () => {};
      pendingOpenRequests.set(
        path,
        new Promise((resolve, _) => {
          resolveOpenRequest = resolve;
        }),
      );
      try {
        flagsInfo = await flagsInfoForPath(path);
      } catch (e) {
        logger.error(`Error finding flags for ${path}, ${e}`);
      }
      const duration = performanceNow() - startTime;
      if (flagsInfo != null) {
        const {databaseDirectory, flagsFile} = flagsInfo;
        const databaseFile = nuclideUri.join(
          databaseDirectory,
          'compile_commands.json',
        );
        clientWriter.write(
          windowMessage(
            MessageType.Info,
            `Found flags for ${path} at ${flagsFile} in ${duration}ms`,
          ),
        );
        knownFileMap.set(path, flagsFile);
        if (!knownCompileCommandsSet.has(databaseDirectory)) {
          knownCompileCommandsSet.add(databaseDirectory);
          serverWriter.write(addDbMessage(databaseDirectory));
          // Read the database file and cache listed files as known.
          readCompilationFlags(databaseFile).subscribe(entry =>
            knownFileMap.set(entry.file, flagsFile),
          );
        }
      } else {
        clientWriter.write(
          windowMessage(
            MessageType.Warning,
            `Could not find flags for ${path} in ${duration}ms, diagnostics may not be correct.`,
          ),
        );
      }
      serverWriter.write(message);
      resolveOpenRequest();
    },
    'textDocument/didClose': async message => {
      const params = ((message: any).params: DidCloseTextDocumentParams);
      const path = lspUri_localPath(params.textDocument.uri);
      // If user closes the file while the open request is pending, then wait
      // for the open request to finish before emitting the close notification.
      // Otherwise we could end up with inconsistent state with server thinking
      // the file is open when the client has closed it.
      try {
        if (pendingOpenRequests.has(path)) {
          clientWriter.write(
            windowMessage(
              MessageType.Warning,
              `${path} closed before we finished opening it`,
            ),
          );
          await pendingOpenRequests.get(path);
        }
      } finally {
        serverWriter.write(message);
      }
    },
  };
}

// First find a compile commands.json nearby, otherwise get it from buck.
async function flagsInfoForPath(path: string): Promise<?FlagsInfo> {
  const flagsInfo = await flagsInfoFromJson(path);
  if (flagsInfo != null) {
    return flagsInfo;
  }
  return flagsInfoFromBuck(path);
}

async function flagsInfoFromJson(source: string): Promise<?FlagsInfo> {
  const databaseDirectory = await findNearestCompilationDbDir(source);
  if (databaseDirectory != null) {
    return {
      databaseDirectory,
      flagsFile: nuclideUri.join(databaseDirectory, 'compile_commands.json'),
    };
  }
}

async function flagsInfoFromBuck(source: string): Promise<?FlagsInfo> {
  const buckDatabase = await compilationDbHandler.getCompilationDatabase(
    source,
  );
  if (buckDatabase != null) {
    const {file, flagsFile} = buckDatabase;
    if (file != null && flagsFile != null) {
      return {databaseDirectory: nuclideUri.dirname(file), flagsFile};
    }
  }
}

function onChildSpawn(childProcess): void {
  // client reader/writer reads/writes to Nuclide.
  // server reader/writer reads/writes to cquery.
  const clientReader = new SafeStreamMessageReader(process.stdin);
  const serverWriter = new StreamMessageWriter(childProcess.stdin);
  const clientWriter = new StreamMessageWriter(process.stdout);
  setMessageWriter(clientWriter);

  // If child process quits, we also quit.
  childProcess.on('exit', code => process.exit(code));
  childProcess.on('close', code => process.exit(code));
  const clientMessageHandlers = initializeClientMessageHandlers(
    serverWriter,
    clientWriter,
  );

  clientReader.listen(message => {
    // Message would have a method if it's a request or notification.
    const method: ?string = ((message: any): {method: ?string}).method;
    if (method != null && clientMessageHandlers[method] != null) {
      try {
        clientMessageHandlers[method](message);
      } catch (e) {
        logger.error(`Uncaught error in ${method} override handler:`, e);
      }
    } else {
      serverWriter.write(message);
    }
  });

  // Every 15 seconds, check the server memory usage.
  const memoryLimit = (os.totalmem() * DEFAULT_MEMORY_LIMIT) / 100;
  const serializedMemoryCheck = serializeAsyncCall(async () =>
    (await memoryUsagePerPid([childProcess.pid])).get(childProcess.pid),
  );
  Observable.interval(MEMORY_CHECK_INTERVAL).subscribe(async () => {
    const memoryUsed = await serializedMemoryCheck();
    if (memoryUsed != null) {
      track('nuclide-cquery-lsp:memory-used', {
        projects: Array.from(knownCompileCommandsSet),
        memoryUsed,
        memoryLimit,
      });
      if (memoryUsed > memoryLimit) {
        logger.error(
          `Memory usage ${memoryUsed} exceeds limit ${memoryLimit}, killing cquery`,
        );
        childProcess.kill();
      }
    }
  });
}

function spawnChild() {
  onChildSpawn(
    child_process.spawn(
      'cquery',
      ['--log-file', loggingFile, '--record', recordingFile],
      {
        env: libclangLogging
          ? {LIBCLANG_LOGGING: 1, ...process.env}
          : process.env,
        // only pipe stdin and stdout, and inherit stderr
        stdio: ['pipe', 'inherit', 'inherit'],
      },
    ),
  );
}

spawnChild();
