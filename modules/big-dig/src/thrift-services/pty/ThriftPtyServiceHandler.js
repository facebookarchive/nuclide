/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */
import type {ITerminal} from 'nuclide-prebuilt-libs/pty';
import type {SpawnArguments} from './types';

import {getOriginalEnvironment} from 'nuclide-commons/process';
import fsPromise from 'nuclide-commons/fsPromise';
// $FlowIgnore
import pty_types from './gen-nodejs/pty_types';
import {getLogger} from 'log4js';
import * as nodePty from 'nuclide-prebuilt-libs/pty';

const logger = getLogger('thrift-pty-server-handler');
const MAX_BUFFER_LENGTH_BYTES = 2147483647;
const DEFAULT_BUFFER_LENGTH_BYTES = 1e6;
const POLL_WAIT_TIME_MS = 50;
const LONG_POLL_TIMEOUT_MESSAGE = 'long_poll_timed_out';
const DEFAULT_ENCODING = 'utf-8';
async function patchCurrentEnvironment(envPatches: {
  [string]: string,
}): Promise<{[string]: string}> {
  const currentEnv = {...(await getOriginalEnvironment())};
  const filteredVariables = ['NODE_ENV', 'NODE_PATH'];
  for (const x of filteredVariables) {
    delete currentEnv[x];
  }
  return {
    ...currentEnv,
    ...envPatches,
  };
}

/**
 * These are the actual functions called by the Thrift server/service. The
 * auto-generated Thrift service handles the passing of data from the transport
 * to the function and back. But the functions aren't defined in Thrift --
 * they're defined here in a service Handler.
 */
export class ThriftPtyServiceHandler {
  _pty: ?ITerminal;
  _exitCode: ?number;
  _bufferCursor: number;
  _encoding: string;
  _buffer: Buffer;
  _droppedBytes: number;
  _maxBufferPayloadBytes: number;
  _resolveLongPoll: ?(string) => typeof undefined;

  constructor() {
    this._pty = null;
    this._buffer = Buffer.alloc(DEFAULT_BUFFER_LENGTH_BYTES);
    this._bufferCursor = 0;
    this._exitCode = -1;
    this._encoding = DEFAULT_ENCODING;
    this._droppedBytes = 0;
    this._maxBufferPayloadBytes = 1e6;
  }

  dispose(): void {
    const pid = this._pty?.pid;
    if (this._pty != null) {
      this._pty.destroy();
      this._pty = null;
      logger.info('disposed of pty with pid', pid);
    }
  }

  async poll(timeoutSec: number): Promise<pty_types.PollEvent> {
    return this._poll(timeoutSec);
  }

  resize(columns: number, rows: number): void {
    this._requirePty();
    if (this._pty != null) {
      this._pty.resize(columns, rows);
    }
  }

  setEncoding(encoding: string): void {
    this._requirePty();
    if (this._pty != null) {
      this._encoding = encoding;
      this._pty.setEncoding(encoding);
      logger.info('setting encoding to', encoding);
    }
  }

  async spawn(
    spawnArguments: SpawnArguments,
    initialCommand: ?string,
  ): Promise<void> {
    if (this._pty != null) {
      logger.warn(
        `pty with pid ${this._pty.pid} already exists. Not spawning.`,
      );
      return;
    }
    const defaultSpawnCommand = '/bin/bash';
    if (!fsPromise.exists(spawnArguments.command)) {
      logger.warn(
        `command ${
          spawnArguments.command
        } does not exist. Using ${defaultSpawnCommand} instead`,
      );
      spawnArguments.command = defaultSpawnCommand;
    }
    logger.info('creating new pty with these arguments');
    logger.info(spawnArguments);
    this._pty = nodePty.spawn(
      spawnArguments.command,
      spawnArguments.commandArgs,
      {
        name: spawnArguments.name,
        cwd: spawnArguments.cwd,
        env: await patchCurrentEnvironment(spawnArguments.envPatches),
        cols: spawnArguments.cols,
        rows: spawnArguments.rows,
      },
    );

    this._addListeners(this._pty);
    if (initialCommand != null) {
      this.writeInput(initialCommand);
    }
    logger.info('Spawned pty with pid', this._pty?.pid);
  }

  writeInput(data: string): void {
    this._requirePty();
    if (this._pty != null) {
      this._pty.write(data);
    }
  }

  async executeCommand(
    data: string,
    minBytesOutput: number,
    timeoutSec: number,
  ): Promise<Buffer> {
    return this._executeCommand(data, minBytesOutput, timeoutSec);
  }

  // client api entrypoints above this point
  // private methods below this point

  _addListeners(pty: ITerminal): void {
    const dataCallback = (chunk: string) => {
      if (this._bufferCursor === 0 && this._resolveLongPoll) {
        const resolveLongPoll = this._resolveLongPoll;
        this._resolveLongPoll = null;
        if (resolveLongPoll) {
          resolveLongPoll(chunk);
        }
        return;
      }

      const lenNewData = Buffer.byteLength(chunk);
      const bufferLength = this._buffer.length;
      const finalCursor = this._bufferCursor + lenNewData;
      if (finalCursor > bufferLength) {
        if (finalCursor > MAX_BUFFER_LENGTH_BYTES) {
          // TODO add backpressure to pty output
          this._droppedBytes += lenNewData;
          return;
        }
        this._expandBuffer(finalCursor);
      }
      this._buffer.write(chunk, this._bufferCursor);
      this._bufferCursor += lenNewData;
    };
    pty.addListener('data', dataCallback);
    pty.addListener('exit', (code, signal) => {
      logger.info('got exit code', code, 'signal', signal);
      this._exitCode = code;
      this.dispose();
    });
  }

  _expandBuffer(requiredLength: number): void {
    if (requiredLength > MAX_BUFFER_LENGTH_BYTES) {
      throw new Error(
        `Max buffer size is ${MAX_BUFFER_LENGTH_BYTES} (requested ${requiredLength})`,
      );
    }
    const newLength = Math.min(requiredLength * 2, MAX_BUFFER_LENGTH_BYTES);
    const newBuffer = Buffer.alloc(newLength);
    this._buffer.copy(newBuffer, 0, 0, this._bufferCursor);
    this._buffer = newBuffer;
  }

  _drainOutputFromBuffer(): Buffer {
    const exceedsMaxPayload = this._bufferCursor > this._maxBufferPayloadBytes;
    let chunk;
    if (exceedsMaxPayload) {
      // return first n bytes of buffer
      chunk = this._buffer.slice(0, this._maxBufferPayloadBytes);
      // move buffer data to the left
      this._buffer.copy(
        this._buffer,
        0, // dest start
        this._maxBufferPayloadBytes, // src start
        this._bufferCursor, // src end
      );
      // move cursor back by the amount we stripped off the front
      this._bufferCursor -= this._maxBufferPayloadBytes;
    } else {
      // send the whole buffer
      chunk = this._buffer.slice(0, this._bufferCursor);
      this._bufferCursor = 0;
    }
    return chunk;
  }

  async _poll(timeoutSec: number): Promise<pty_types.PollEvent> {
    return new Promise(async (resolve, reject) => {
      if (this._bufferCursor) {
        const pollEvent = new pty_types.PollEvent();
        pollEvent.eventType = pty_types.PollEventType.NEW_OUTPUT;
        pollEvent.chunk = this._drainOutputFromBuffer();
        resolve(pollEvent);
        return;
      }
      if (this._pty == null) {
        const pollEvent = new pty_types.PollEvent();
        pollEvent.eventType = pty_types.PollEventType.NO_PTY;
        pollEvent.chunk = null;
        pollEvent.exitCode = this._exitCode;
        resolve(pollEvent);
        return;
      }
      try {
        const chunk = await this._waitForNewOutput(timeoutSec);
        const pollEvent = new pty_types.PollEvent();
        pollEvent.eventType = pty_types.PollEventType.NEW_OUTPUT;
        pollEvent.chunk = Buffer.from(chunk);
        resolve(pollEvent);
        return;
      } catch (e) {
        if (e === LONG_POLL_TIMEOUT_MESSAGE) {
          const pollEvent = new pty_types.PollEvent();
          pollEvent.eventType = pty_types.PollEventType.TIMEOUT;
          pollEvent.chunk = null;
          resolve(pollEvent);
          return;
        } else {
          throw e;
        }
      }
    });
  }

  _requirePty() {
    if (this._pty == null) {
      throw new pty_types.Error({message: 'no pty'});
    }
  }

  async _executeCommand(
    data: string,
    minBytesOutput: number,
    timeoutSec: number,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this._requirePty();
      if (minBytesOutput > this._maxBufferPayloadBytes) {
        throw new Error(
          'Cannot return more than ${this._maxBufferPayloadBytes} bytes in one response',
        );
      }
      if (timeoutSec < 0) {
        throw new Error('timeout time must be positive');
      }

      const startTime = Date.now();
      const deadline = startTime + timeoutSec * 1000;

      const collectBytes = () => {
        if (this._bufferCursor >= minBytesOutput) {
          const buffer = this._drainOutputFromBuffer();
          resolve(buffer);
          return;
        } else {
          const timeRemaining = deadline - Date.now();
          if (timeRemaining <= 0) {
            reject(
              new Error(
                'timeout. got ' +
                  this._bufferCursor +
                  'bytes but needed' +
                  minBytesOutput,
              ),
            );
            return;
          }
        }
        setTimeout(collectBytes, POLL_WAIT_TIME_MS);
      };
      collectBytes();
    });
  }

  async _waitForNewOutput(timeoutSec: number): Promise<string> {
    const SEC_TO_MSEC = 1000;
    return new Promise((resolveLongPoll, rejectLongPoll) => {
      // attach resolve function to this object so the new data callback
      // can resolve when new data arrives
      this._resolveLongPoll = resolveLongPoll;

      setTimeout(() => {
        rejectLongPoll(LONG_POLL_TIMEOUT_MESSAGE);
      }, timeoutSec * SEC_TO_MSEC);
    });
  }
}
