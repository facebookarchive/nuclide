'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type ClangFlagsManager from './ClangFlagsManager';

import path from 'path';
import split from 'split';

import {EventEmitter} from 'events';
import {checkOutput, safeSpawn} from '../../commons';
import {getLogger} from '../../logging';

const logger = getLogger();
const pathToLibClangServer = path.join(__dirname, '../python/clang_server.py');

async function _findClangServerArgs(): Promise<{
  libClangLibraryFile: ?string;
  pythonExecutable: string;
  pythonPathEnv: ?string;
}> {
  let findClangServerArgs;
  try {
    findClangServerArgs = require('./fb/find-clang-server-args');
  } catch (e) {
    // Ignore.
  }

  let libClangLibraryFile;
  if (process.platform === 'darwin') {
    const result = await checkOutput('xcode-select', ['--print-path']);
    if (result.exitCode === 0) {
      libClangLibraryFile = result.stdout.trim() +
        '/Toolchains/XcodeDefault.xctoolchain/usr/lib/libclang.dylib';
    }
  }

  const clangServerArgs = {
    libClangLibraryFile,
    pythonExecutable: 'python',
    pythonPathEnv: path.join(__dirname, '../pythonpath'),
  };
  if (typeof findClangServerArgs === 'function') {
    const clangServerArgsOverrides = await findClangServerArgs();
    return {...clangServerArgs, ...clangServerArgsOverrides};
  } else {
    return clangServerArgs;
  }
}

type Connection = {
  dispose: () => any,
  readableStream: stream$Readable,
  writableStream: stream$Writable,
}

async function createAsyncConnection(src: string): Promise<Connection> {
  return await new Promise(async (resolve, reject) => {
    const {libClangLibraryFile, pythonPathEnv, pythonExecutable} = await _findClangServerArgs();
    const options = {
      cwd: path.dirname(pathToLibClangServer),
      // The process should use its ordinary stderr for errors.
      stdio: ['pipe', null, 'pipe', 'pipe'],
      detached: false, // When Atom is killed, clang_server.py should be killed, too.
      env: {
        // On Mac OSX El Capitan, bash seems to wipe out the `LD_LIBRARY_PATH` and
        // `DYLD_LIBRARY_PATH` environment letiables. So, set this env let which is read by
        // clang_server.py to explicitly set the file path to load.
        LIB_CLANG_LIBRARY_FILE: libClangLibraryFile,
        PYTHONPATH: pythonPathEnv,
      },
    };

    // Note that safeSpawn() often overrides options.env.PATH, but that only happens when
    // options.env is undefined (which is not the case here). This will only be an issue if the
    // system cannot find `pythonExecutable`.
    const child = await safeSpawn(pythonExecutable, /* args */ [pathToLibClangServer], options);

    child.on('close', function(exitCode) {
      logger.error('%s exited with code %s', pathToLibClangServer, exitCode);
    });
    child.stderr.on('data', function(error) {
      if (error instanceof Buffer) {
        error = error.toString('utf8');
      }
      logger.error('Error receiving data', error);
    });
    /* $FlowFixMe - update Flow defs for ChildProcess */
    const writableStream = child.stdio[3];
    writableStream.on('error', (error) => {
      logger.error('Error writing data', error);
    });

    let childRunning = true;
    child.on('exit', () => {
      childRunning = false;
    });
    // Make sure the bidirectional communication channel is set up before
    // resolving this Promise.
    child.stdout.once('data', function(data: Buffer) {
      if (data.toString() === 'ack\n') {
        const result = {
          dispose: () => {
            if (childRunning) {
              child.kill();
              childRunning = false;
            }
          },
          readableStream: child.stdout,
          writableStream,
        };
        resolve(result);
      } else {
        reject(data);
      }
    });
    writableStream.write(`init:${src}\n`);
  });
}

// List of supported methods. Keep in sync with the Python server.
type ClangServerRequest =
  'compile' | 'get_completions' | 'get_declaration' | 'get_declaration_info';

export default class ClangServer {

  _src: string;
  _clangFlagsManager: ClangFlagsManager;
  _emitter: EventEmitter;
  _nextRequestId: number;
  _lastProcessedRequestId: number;
  _asyncConnection: ?Connection;
  _pendingCompileRequests: number;

  // Cache the flags-fetching promise so we don't end up invoking Buck twice.
  _flagsPromise: ?Promise<?Array<string>>;

  constructor(clangFlagsManager: ClangFlagsManager, src: string) {
    this._src = src;
    this._clangFlagsManager = clangFlagsManager;
    this._emitter = new EventEmitter();
    this._nextRequestId = 0;
    this._lastProcessedRequestId = -1;
    this._pendingCompileRequests = 0;
  }

  dispose() {
    // Fail all pending requests.
    // The Clang server receives requests serially via stdin (and processes them in that order)
    // so it's quite safe to assume that requests are processed in order.
    for (let reqid = this._lastProcessedRequestId + 1; reqid < this._nextRequestId; reqid++) {
      this._emitter.emit(reqid.toString(16), {error: 'Server was killed.'});
    }
    if (this._asyncConnection) {
      this._asyncConnection.dispose();
    }
    this._emitter.removeAllListeners();
  }

  getFlags(): Promise<?Array<string>> {
    if (this._flagsPromise != null) {
      return this._flagsPromise;
    }
    this._flagsPromise = this._clangFlagsManager.getFlagsForSrc(this._src)
      .catch((e) => {
        logger.error(`clang-server: Could not get flags for ${this._src}:`, e);
        // Make sure this gets a retry.
        this._flagsPromise = null;
      });
    return this._flagsPromise;
  }

  async makeRequest(method: ClangServerRequest, params: Object): Promise<?Object> {
    if (method === 'compile') {
      this._pendingCompileRequests++;
    } else if (this._pendingCompileRequests) {
      // All other requests should instantly fail.
      return null;
    }
    try {
      return await this._makeRequestImpl(method, params);
    } finally {
      if (method === 'compile') {
        this._pendingCompileRequests--;
      }
    }
  }

  async _makeRequestImpl(method: ClangServerRequest, params: Object): Promise<?Object> {
    const flags = await this.getFlags();
    if (flags == null) {
      return null;
    }

    const connection = await this._getAsyncConnection();
    if (connection == null) {
      return null;
    }

    const reqid = this._getNextRequestId();
    const request = {reqid, method, src: this._src, flags, ...params};
    const logData = JSON.stringify(request, (key, value) => {
      // File contents are too large and clutter up the logs, so exclude them.
      if (key === 'contents') {
        return undefined;
      } else {
        return value;
      }
    });

    logger.debug('LibClang request: ' + logData);
    // Because Node uses an event-loop, we do not have to worry about a call to
    // write() coming in from another thread between our two calls here.
    const {writableStream} = connection;
    writableStream.write(JSON.stringify(request));
    writableStream.write('\n');

    return new Promise((resolve, reject) => {
      this._emitter.once(reqid, (response) => {
        logger.debug('LibClang response: ' + JSON.stringify(response));
        const isError = 'error' in response;
        if (isError) {
          logger.error('error received from clang_server.py for request:\n%o\nError:%s',
            logData,
            response['error']);
        }
        this._lastProcessedRequestId = parseInt(reqid, 16);
        (isError ? reject : resolve)(response);
      });
    });
  }

  _getNextRequestId(): string {
    return (this._nextRequestId++).toString(16);
  }

  async _getAsyncConnection(): Promise<?Connection> {
    if (this._asyncConnection == null) {
      try {
        const connection = await createAsyncConnection(this._src);
        connection.readableStream
          .pipe(split(JSON.parse))
          .on('data', (response) => {
            const id = response['reqid'];
            this._emitter.emit(id, response);
          })
          .on('error', (error) => {
            logger.error(
              'Failed to handle libclang output, most likely the libclang python'
              + ' server crashed.',
              error,
            );
            this.dispose();
            this._asyncConnection = null;
            this._lastProcessedRequestId = this._nextRequestId - 1;
          });
        this._asyncConnection = connection;
      } catch (e) {
        logger.error('Could not connect to Clang server', e);
      }
    }
    return this._asyncConnection;
  }

}
